//server view for sales associate interface
const express = require('express');
const quoteModel = require('../../models/quoteModel');
const itemModel = require('../../models/quoteItemModel');
const noteModel = require('../../models/quoteNoteModel');
const customerModel = require('../../models/customerModel');
const {requireSessionRole} = require('../middleware/auth');
const router = express.Router();

//all associate routes need to login as an associate
router.use(requireSessionRole('associate'));

//dashboard for associates
//get /associate/dashboard
router.get('/dashboard', async(req, res) => {
    try {
        const quotes = await quoteModel.findByAssociate(req.session.user.id);
        res.render('associate/dashboard', {title: 'My Quotes', quotes,
            success: req.session.flash_success ? req.session.flash_success : null,
            error: req.session.flash_error ? req.session.flash_error : null,
        });
        //clear messages
        delete req.session.flash_success;
        delete req.session.flash_error;
    }
    catch(err) {
        console.error('[associateViewRoutes.dashboard]', err);
        res.status(500).send('Failed to load associates dashboard');
    }
});

//customer search using new quote ejs file
//get /associate/customers/search?q=term
router.get('/customers/search', async(req, res) => {
    try {
        const customers = await customerModel.search(req.query.q || '');
        res.json({success: true, data: customers});
    }
    catch(err) {
        console.error('[associateViewRoutes.customerSearch]', err);
        res.json({success: false, data: []});
    }
});

//new quote
//get /associate/quotes/new
router.get('/quotes/new', (req, res) => {
    res.render('associate/quote-new' , {title: 'New Quote', error: null});
});

//post /associate/quotes
router.post('/quotes', async(req, res) => {
    try {
        const {customerId, customerEmail} = req.body;
        const customer = await customerModel.findById(customerId);

        if(!customer) {
            return res.render('associate/quote-new', {title: 'New Quote', error: 'Could not find customer'});
        }

        const quote = await quoteModel.create({customer_id: customer.id,
            customer_name: customer.name,
            customer_email: customerEmail,
            associate_id: req.session.user.id,
            quote_status: 'draft',
            subtotal: 0,
            final_total: 0
        });

        res.redirect(`/associate/quotes/${quote.id}`);
    }
    catch(err) {
        console.error('[associateViewRoutes.createQuote]', err);
        res.render('associate/quote-new', {title: 'New Quote', error: 'Could not create quote'});
    }
});

//Quote details
//get /associate/quotes/:id
router.get('/quotes/:id', async (req, res) => {
    try {
        const quote = await quoteModel.findById(req.params.id);
        //throw error
        if(!quote || quote.associate_id !== req.session.user.id) {
            return res.status(404).send('Quote could not be found');
        }
        
        const items = await itemModel.findByQuote(quote.id);
        const notes = await noteModel.findByQuote(quote.id);

        res.render('associate/quote-detail', {title: `Quote #${quote.id}`,
            quote, items, notes,
            success: req.session.flash_success || null,
            error: req.session.flash_error || null
        });
        //delete messages
        delete req.session.flash_success;
        delete req.session.flash_error;
    }
    catch(err) {
        console.error('[associateViewRoutes.quoteDetail', err);
        res.status(500).send('Could not load this quote')
    }
});

//update customer email
//post /associate/quotes/id/email
router.post('/quotes/:id/email', async(req, res) => {
    try {
        const quote = await quoteModel.findById(req.params.id);
        //error checking
        if(!quote || quote.associate_id !== req.session.user.id) {
            return res.status(404).send('Could not find quote')
        }
        if(quote.quote_status !== 'draft') {
            req.session.flash_error = 'Only quotes in draft status can be edited';
            return res.redirect(`/associate/quotes/${quote.id}`);
        }

        await quoteModel.update(quote.id, {customer_email: req.body.customerEmail});
        req.session.flash_success = 'Updated customer email';
        res.redirect(`associate/quotes/${quote.id}`);
    }
    catch(err) {
        console.error('[associateViewRoutes.updateEmail]', err);
        req.session.flash_error = 'Could not update email';
        res.redirect(`/associate/quotes/${req.params.id}`);
    }
});

//adding a line item
//post /associate/quotes/:id/items
router.post('/quotes/:id/items', async(req, res) => {
    try {
        const quote = await quoteModel.findById(req.params.id);
        //error checking
        if(!quote || quote.associate_id !== req.session.user.id) {
            return res.status(404).send('Could not find quote')
        }
        if(quote.quote_status !== 'draft') {
            req.session.flash_error = 'Only quotes in draft status can be edited';
            return res.redirect(`/associate/quotes/${quote.id}`);
        }

        await itemModel.create({quote_id: quote.id,
            description: req.body.description,
            price: req.body.price
        });
        //recompute
        await quoteModel.recomputeTotals(quote.id);
        req.session.flash_success = 'Successfully added line item'
        res.redirect(`/associate/quotes/${quote.id}`);
    }
    catch(err) {
        console.error('[associateViewROutes.addItem]', err);
        req.session.flash_error = 'Could not add line item';
        res.redirect(`/associate/quotes/${req.params.id}`);
    }
});

//delete line items
// post /associate/quotes/id/items/itemId/delete
router.post('/quotes/:id/items/:itemId/delete', async(req, res) => {
    try {
        const quote = await quoteModel.findById(req.params.id);
        //error checking
        if(!quote || quote.associate_id !== req.session.user.id) {
            return res.status(404).send('Could not find quote')
        }
        if(quote.quote_status !== 'draft') {
            req.session.flash_error = 'Only quotes in draft status can be edited';
            return res.redirect(`/associate/quotes/${quote.id}`);
        }

        await itemModel.remove(req.params.itemId);
        await quoteModel.recomputeTotals(quote.id);

        req.session.flash_success = 'Successfully removed line item';
        res.redirect(`/associate/quotes/${quote.id}`);

    }
    catch(err) {
        console.error('[associateViewRoutes.deleteItem]', err);
        req.session.flash_error = 'Could not remove line item';
        res.redirect(`/associate/quotes/${req.params.id}`);
    }
});

//secret notes
//post /associate/quotes/id/notes
router.post('/quotes/:id/notes', async(req,res) => {
    try {
        const quote = await quoteModel.findById(req.params.id);
        //error checking
        if(!quote || quote.associate_id !== req.session.user.id) {
            return res.status(404).send('Could not find quote')
        }

        await noteModel.create({
            quote_id: quote.id,
            associate_id: req.session.user.id,
            note_author: req.session.user.name,
            note: req.body.note
        });

        req.session.flash_success = 'Successfully created secret note';
        res.redirect(`/associate/quotes/${quote.id}`);
    }
    catch(err) {
        console.error('[associateViewRoutes.createNote]', err);
        req.session.flash_error = 'Could not create secret note';
        res.redirect(`/associate/quotes/${req.params.id}`);
    }
});

//finalizing quote
//post /associate/quotes/id/finalize
router.post('/quotes/:id/finalize', async(req, res) => {
    try {
        const quote = await quoteModel.findById(req.params.id);
        //error checking
        if(!quote || quote.associate_id !== req.session.user.id) {
            return res.status(404).send('Could not find quote')
        }
        if(quote.quote_status !== 'draft') {
            req.session.flash_error = 'Only quotes in draft status can be edited';
            return res.redirect(`/associate/quotes/${quote.id}`);
        }

        await quoteModel.update(quote.id, {quote_status: 'finalized',
            finalized_at: new Date()
        });

        req.session.flash_success = 'Quote finalized and sent to HQ';
        res.redirect('/associated/dashboard');
    }
    catch(err) {
        console.error('[associateViewRoutes.finalizeQuote]', err);
        req.session.flash_error = 'Could not finalize the quote';
        res.redirect(`/associate/quotes/${req.params.id}`);
    }
});

module.exports = router;