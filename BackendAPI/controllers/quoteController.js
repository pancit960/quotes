//Author: Riff Talsma
const quoteModel = require('../models/quoteModel');
const itemModel = require('../models/quoteItemModel');
const noteModel = require('../models/quoteNoteModel');
const customerModel = require('../models/customerModel');
const emailService = require('../services/emailService');
const { update } = require('./salesAssociateController');

function forbidden(res, msg='Forbidden') {
    return res.status(403).json({success: false, message: msg});
}

function notFound(res, msg='Quote Not Found') {
    return res.status(404).json({success: false, message: msg});
}

//Associates view
//get /quotes
async function getMyQuotes(req, res) {
    try {
        const quotes = await quoteModel.findByAssociate(req.user.id);
        res.json({success: true, data: quotes});
    }
    catch(err) {
        console.error('[quoteController.getMyQuotes]', err);
        res.status(500).json({success: false, message: 'Failed to retrieve user quotes'});
    }
}

//get /quotes/id
async function getOne(req, res) {
    try {
        const quote = await quoteModel.findById(req.params.id);
        if(!quote) {
            return notFound(res);
        }

        if(req.user.role === 'associate' && quote.associate_id !== req.user.id) {
            return forbidden(res);
        }

        const items = await itemModel.findByQuote(quote.id);
        const notes = await noteModel.findByQuote(quote.id);

        res.json({success: true, data: {quote, items, notes}});
    }
    catch(err) {
        console.error('[quoteController.getOne]', err);
        res.status(500).json({success: false, message: 'Could not find a quote'});
    }
}


//Post /quotes
async function create(req, res) {
    try {
        const{customerId, customerEmail} = req.body;

        if(!customerId || !customerEmail) {
            return res.status(400).json({success: false, message: 'customerId and customerEmail are required'});
        }
        
        const customer = await customerModel.findById(customerId);
        if(!customer) {
            return res.status(404).json({success: false, message: 'Customer was not found'});
        }

        const quote = await quoteModel.create({associateId: req.user.id, 
            customerId: customer.id,
            customerName: customer.name,
            customerEmail});
        //success!
        res.status(201).json({success: true, data: quote});
    }
    catch(err) {
        console.error('[quoteController.create]', err);
        res.status(500).json({success: false, message: 'Could not create a quote'});
    }
}

// Put /quotes/id/email
async function updateEmail(req, res) {
  try {
    const quote = await quoteModel.findById(req.params.id);
    //throw errors
    if(!quote) {
        return notFound(res);
    }
    if(quote.associate_id !== req.user.id) {
        return forbidden(res);
    }
    if(quote.quote_status !== 'draft') {
      return res.status(409).json({success: false, message: 'Only drafts can be edited'});
    }

    const updated = await quoteModel.update(quote.id, {customer_email: req.body.customerEmail});

    //success!
    res.json({success: true, data: updated});
  } 
  catch (err) {
    console.error('[quoteController.updateEmail]', err);
    res.status(500).json({success: false, message: 'Could not update quote'});
  }
}

//post /quotes/id/finalize
async function finalize(req, res) {
  try {
    const quote = await quoteModel.findById(req.params.id);
    //throw errors
    if(!quote) {
        return notFound(res);
    }
    if(quote.associate_id !== req.user.id) {
        return forbidden(res);
    }
    if (quote.quote_status !== 'draft') {
      return res.status(409).json({success: false, message: 'Quote is not a draft'});
    }

    const updated = await quoteModel.update(quote.id, {quote_status: 'finalized', finalized_at: new Date()});
    //success!
    res.json({success: true, data: updated});
  } 
  catch(err) {
    console.error('[quoteController.finalize]', err);
    res.status(500).json({success: false, message: 'Could not finalize the quote'});
  }
}

//line items (quote_desc)
async function addItem(req, res) {
    try {
        const quote = await quoteModel.findById(req.params.id);
        //error
        if(!quote) {
            return notFound(res);
        }
        if(req.user.role === 'associate') {
            if(quote.associate_id !== req.user.id) {
                return forbidden(res);
            }
            if(quote.quote_status !== 'draft') {
                return res.status(409).json({success: false, message: 'Only drafts can be edited'});
            }
        }

        const{description, price} = req.body;
        if(!description || price === undefined) {
            return res.status(400).json({success: false, message: 'Description and price are required'});
        }

        const item = await itemModel.create({quoteId: quote.id, description, price});
        await quoteModel.recomputeTotals(quote.id);

        //success!
        res.status(201).json({success: true, data: item});
    }
    catch(err) {
        console.error('[quoteController.addItem]', err);
        res.status(500).json({success: false, message: 'Could not add item'});
    }
}

//update an item
async function updateItem(req, res) {
    try {
        const quote = await quoteModel.findById(req.params.id);
        //throw errors
        if(!quote) {
            return notFound(res);
        }
        if(quote.associate_id !== req.user.id) {
            return forbidden(res);
        }
        if(quote.quote_status !== 'draft') {
            return forbidden(res, 'Quote cannot be edited');
        }

        const item = await itemModel.update(req.params.itemId, req.body);
        if(!item) {
            return notFound(res, 'Item not found.');
        }

        await quoteModel.recomputeTotals(quote.id);
        //success!
        res.json({success: true, data: item});
    }
    catch(err) {
        console.error('[quoteController.updateItem', err);
        res.status(500).json({success: false, message: 'Could not update item'});
    }
}

//delete an item
async function deleteItem(req, res) {
    try {
        const quote = await quoteModel.findById(req.params.id);
        //throw errors
        if(!quote) {
            return notFound(res);
        }
        if(quote.associate_id !== req.user.id) {
            return forbidden(res);
        }
        if(quote.quote_status !== 'draft') {
            return forbidden(res, 'Quote cannot be edited');
        }

        const deleted = await itemModel.remove(req.params.itemId);
        if(!deleted) {
            return notFound(res, 'Item could not be found');
        }
        await quoteModel.recomputeTotals(quote.id);
        //success!
        res.json({success: true, message: 'Item successfully removed!'});
    }
    catch(err) {
        console.error('[quoteController.deleteItem]', err);
        res.status(500).json({success: false, message: 'Could not delete item'})
    }
}

//secret notes!
async function addNote(req, res) {
    try {
        const quote = await quoteModel.findById(req.params.id);
        //throw error
        if(!quote) {
            return notFound(res);
        }

        const isAssociate = req.user.role === 'associate';
        if(isAssociate && quote.associate_id !== req.user.id) {
            return forbidden(res);
        }
        
        const{note} = req.body;
        if(!note) {
            return res.status(400).json({success: false, message: 'note required'});
        }

        const created = await noteModel.create({quoteId: quote.id, noteText: note,
            associateId: isAssociate ? req.user.id : null,
            authorLabel: isAssociate ? req.user.name : 'HQ'
        });
        //success!
        res.status(201).json({success: true, data: created});
    }
    catch(err) {
        console.error('[quoteController.addNote]', err);
        res.status(500).json({success: false, message: 'Could not add a note'});
    }
}

//HQ functions
//finalizing a quote
async function getFinalizedQuotes(req, res) {
    try {
        const quotes = await quoteModel.findFinished();
        res.json({success: true, data: quotes});
    }
    catch(err) {
        console.error('[quoteController.getFinalizedQuotes]', err);
        res.status(500).json({success: false, message: 'Could not get finalized quotes'});
    }
}

//hq updates a quote
async function hqUpdateQuote(req, res) {
    try {
        const quote = await quoteModel.findById(req.params.id);
        if(!quote) {
            return notFound(res);
        }
        if(!['finalized', 'sanctioned'].includes(quote.quote_status)) {
            return res.status(409).json({success: false, message: 'Quote must be finalized'});
        }

        const updates = {};
        if(req.body.discount_type !== undefined) {
            updates.discount_type = req.body.discount_type;
        }
        if(req.body.discount_val !== undefined) {
            updates.discount_val = req.body.discount_val;
        }
        if(req.body.sanction === true) {
            updates.quote_status = 'sanctioned';
            updates.sanctioned_at = new Date();
        }

        const updated = await quoteModel.update(quote.id, updates);
        if(req.body.sanction === true) {
            const items = await itemModel.findByQuote(updated.id);
            await emailService.sendSanctionedQuote(updated, items);
        }

        //success!
        res.json({success: true, data: updated});
    }
    catch(err) {
        console.error('[quoteController.hqUpdateQuote]', err);
        res.status(500).json({success: false, message: 'Failed to have HQ update quote'});
    }
}

//admin functions
async function adminSearch(req, res) {
    try {
        const quotes = await quoteModel.search(req.query);
        res.json({success: true, data: quotes});
    }
    catch(err) {
        console.error('[quoteController.adminSearch]', err);
        res.status(500).json({success: false, message: 'Could not search on admin side'});
    }
}

//delete quote
async function adminDelete(req, res) {
    try {
        const deleted = await quoteModel.remove(req.params.id);

        if(!deleted) {
            return notFound(res);
        }
        res.json({success: true, message: 'Quote deleted!'});
    }
    catch(err) {
        console.error('[quoteCOntroller.adminDelete]', err);
        res.status(500).json({success: false, message: 'Could not delete quote'});
    }
}

module.exports = {getMyQuotes, getOne, create, updateEmail, finalize, addItem, updateItem,
    deleteItem, addNote, getFinalizedQuotes, hqUpdateQuote, adminSearch, adminDelete
};