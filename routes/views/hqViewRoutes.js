//hq interface for admin/hq

const express = require('express');
const quoteModel = require('../../models/quoteModel');
const quoteItemModel = require('../../models/quoteItemModel');
const QuoteNoteModel = require('../../models/quoteNoteModel');
const emailService = require('../../services/emailService');
const {requireSessionRole} = require('../middleware/sessionAuth');
const router = express.Router();

router.use(requireSessionRole('hq', 'admin'));

//dashboard

//get /hq/dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const quotes = await quoteModel.findFinished();
        res.render('hq/dashboard', {
            title: 'HQ Dashboard',
            quotes,
            success: req.session.flash_success || null,
            error: req.session.flash_error || null,
        });
        
        delete req.session.flash_success;
        delete req.session.flash_error;
    } 
    catch(err) {
        console.error('[hqViewRoutes.dashboard]', err);
        res.status(500).send('Failed to load HQ dashboard');
    }
});

//quote review

//get /hq/quotes/:id
router.get('/quotes/:id', async (req, res) => {
    try {
        const quote = await quoteModel.findById(req.params.id);
        if (!quote) {
            return res.status(404).send('Quote not found'); 
        }

        const items = await quoteItemModel.findByQuote(quote.id);
        const notes = await QuoteNoteModel.findByQuote(quote.id);

        //get associate name via join already in findFinished, but findById doesn't join
        //so get it from the finalized list or just use associate_id
        res.render('hq/quote-review', {
            title: `Review Quote #${quote.id}`,
            quote: { ...quote, associate_name: `Associate #${quote.associate_id}` },
            items,
            notes,
            success: req.session.flash_success || null,
            error: req.session.flash_error || null,
        });

        delete req.session.flash_success;
        delete req.session.flash_error;
    } 
    catch(err) {
        console.error('[hqViewRoutes.quoteReview]', err);
        res.status(500).send('Failed to load quote');
    }
});

//quote line items

//post /hq/quotes/:id/items
router.post('/quotes/:id/items', async (req, res) => {
    try {
        const quote = await quoteModel.findById(req.params.id);
        if(!quote) {
            return res.status(404).send('Quote not found');
        }

        const {description, price} = req.body;
        await quoteItemModel.create({quote_id: quote.id, description, price});
        await quoteModel.recomputeTotals(quote.id);

        req.session.flash_success = 'Line item added';
        res.redirect(`/hq/quotes/${req.params.id}`);
    } 
    catch(err) {
        console.error('[hqViewRoutes.addItem]', err);
        req.session.flash_error = 'Failed to add line item';
        res.redirect(`/hq/quotes/${req.params.id}`);
    }
});

//post /hq/quotes/:id/items/:itemId  (update)
router.post('/quotes/:id/items/:itemId', async (req, res) => {
    try {
        const {description, price} = req.body;
        await quoteItemModel.update(req.params.itemId, {description, price});
        await quoteModel.recomputeTotals(req.params.id);

        req.session.flash_success = 'Line item updated';
        res.redirect(`/hq/quotes/${req.params.id}`);
    } 
    catch(err) {
        console.error('[hqViewRoutes.updateItem]', err);
        req.session.flash_error = 'Failed to update line item';
        res.redirect(`/hq/quotes/${req.params.id}`);
    }
});

//post /hq/quotes/:id/items/:itemId/delete
router.post('/quotes/:id/items/:itemId/delete', async (req, res) => {
    try {
        await quoteItemModel.remove(req.params.itemId);
        await quoteModel.recomputeTotals(req.params.id);

        req.session.flash_success = 'Line item removed';
        res.redirect(`/hq/quotes/${req.params.id}`);
    } 
    catch(err) {
        console.error('[hqViewRoutes.deleteItem]', err);
        req.session.flash_error = 'Failed to remove line item';
        res.redirect(`/hq/quotes/${req.params.id}`);
    }
});

//discount
//post /hq/quotes/:id/discount
router.post('/quotes/:id/discount', async (req, res) => {
    try {
        const {discount_type, discount_val} = req.body;
        await quoteModel.update(req.params.id, {discount_type, discount_val});

        req.session.flash_success = 'Discount applied';
        res.redirect(`/hq/quotes/${req.params.id}`);
    } 
    catch(err) {
        console.error('[hqViewRoutes.discount]', err);
        req.session.flash_error = 'Failed to apply discount';
        res.redirect(`/hq/quotes/${req.params.id}`);
    }
});

//notes
//post /hq/quotes/:id/notes
router.post('/quotes/:id/notes', async (req, res) => {
    try {
        await QuoteNoteModel.create({
            quoteId: req.params.id,
            note: req.body.note,
            associateId: null,
            noteAuthor: 'HQ',
        });

        req.session.flash_success = 'Note added.';
        res.redirect(`/hq/quotes/${req.params.id}`);
    } 
    catch(err) {
        console.error('[hqViewRoutes.addNote]', err);
        req.session.flash_error = 'Failed to add note';
        res.redirect(`/hq/quotes/${req.params.id}`);
    }
});

//sanction
//post /hq/quotes/:id/sanction
router.post('/quotes/:id/sanction', async (req, res) => {
    try {
        const quote = await quoteModel.findById(req.params.id);
        if(!quote) { 
            return res.status(404).send('Quote not found.');
        }

        await quoteModel.update(quote.id, {
            quote_status: 'sanctioned',
            sanctioned_at: new Date(),
        });

        const updatedQuote = await quoteModel.findById(quote.id);
        const items = await quoteItemModel.findByQuote(quote.id);
        console.log('[sanctioning] sending email', quote.id);
        await emailService.sendSanctionedQuote(updatedQuote, items);
        console.log('sanction] emaial finished')

        req.session.flash_success = `Quote #${quote.id} sanctioned and emailed to ${quote.customer_email}.`;
        res.redirect('/hq/dashboard');
    } 
    catch (err) {
        console.error('[hqViewRoutes.sanction]', err);
        req.session.flash_error = 'Failed to sanction quote.';
        res.redirect(`/hq/quotes/${req.params.id}`);
    }
});

module.exports = router;