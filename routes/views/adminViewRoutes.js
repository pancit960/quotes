//admin only server side view

const express = require('express');
const bcrypt = require('bcrypt');
const salesModel = require('../../models/salesModel');
const quoteModel = require('../../models/quoteModel');
const {requireSessionRole} = require('../middleware/sessionAuth');

const router = express.Router();
const SALT_ROUNDS = 10;

router.use(requireSessionRole('admin'));

//dashboard

//get /admin/dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const associates = await salesModel.findAll();
        const allQuotes = await quoteModel.search({});

        const stats = {
            associateCount: associates.length,
            draftCount: allQuotes.filter(q => q.quote_status === 'draft').length,
            finalizedCount: allQuotes.filter(q => q.quote_status === 'finalized').length,
            sanctionedCount: allQuotes.filter(q => q.quote_status === 'sanctioned').length,
            orderedCount: allQuotes.filter(q => q.quote_status === 'ordered').length,
        };

        res.render('admin/dashboard', {title: 'Admin Dashboard', stats,});
    } 
    catch(err) {
        console.error('[adminViewRoutes.dashboard]', err);
        res.status(500).send('Failed to load admin dashboard');
    }
});

//associates list

//get /admin/associates
router.get('/associates', async (req, res) => {
    try {
        const associates = await salesModel.findAll();
        res.render('admin/associates', {title: 'Sales Associates', associates,
            success: req.session.flash_success || null,
            error: req.session.flash_error   || null,
        });

        delete req.session.flash_success;
        delete req.session.flash_error;
    } 
    catch(err) {
        console.error('[adminViewRoutes.associates]', err);
        res.status(500).send('Failed to load associates.');
    }
});

//new associates

//get /admin/associates/new
router.get('/associates/new', (req, res) => {
    res.render('admin/associate-form', {
        title: 'New Associate',
        associate: null,
        error:  null,
    });
});

//post /admin/associates
router.post('/associates', async (req, res) => {
    try {
        const {name, username, password, email_addr, address} = req.body;
        const user_pass = await bcrypt.hash(password, SALT_ROUNDS);

        await salesModel.create({name, username, user_pass, email_addr, address});

        req.session.flash_success = `Associate "${name}" created.`;
        res.redirect('/admin/associates');
    } 
    catch(err) {
        console.error('[adminViewRoutes.createAssociate]', err);
        const message = err.code === 'ER_DUP_ENTRY' ? 'ID or username already exists.' : 'Failed to create associate.';
        res.render('admin/associate-form', {title: 'New Associate', associate: null, error: message});
    }
});

//edit existing associate

// GET /admin/associates/:id/edit
router.get('/associates/:id/edit', async (req, res) => {
    try {
        const associate = await salesModel.findById(req.params.id);
        if(!associate) {
            return res.status(404).send('Associate not found.');
        }

        res.render('admin/associate-form', {
            title: 'Edit Associate', associate,
            error: req.session.flash_error || null,
        });
        delete req.session.flash_error;
    } 
    catch(err) {
        console.error('[adminViewRoutes.editAssociate]', err);
        res.status(500).send('Failed to load associate.');
    }
});

//post /admin/associates/:id
router.post('/associates/:id', async (req, res) => {
    try {
        const {name, username, email_addr, address, password} = req.body;
        const data = {name, username, email_addr, address};

        if(password) {
            data.user_pass = await bcrypt.hash(password, SALT_ROUNDS);
        }

        await salesModel.update(req.params.id, data);

        req.session.flash_success = 'Associate updated.';
        res.redirect('/admin/associates');
    } 
    catch(err) {
        console.error('[adminViewRoutes.updateAssociate]', err);
        req.session.flash_error = 'Failed to update associate.';
        res.redirect(`/admin/associates/${req.params.id}/edit`);
    }
});

//delete existing associate

//post /admin/associates/:id/delete
router.post('/associates/:id/delete', async (req, res) => {
    try {
        await salesModel.remove(req.params.id);
        req.session.flash_success = 'Associate deleted.';
        res.redirect('/admin/associates');
    } 
    catch(err) {
        console.error('[adminViewRoutes.deleteAssociate]', err);
        req.session.flash_error = 'Failed to delete associate. They may have existing quotes.';
        res.redirect('/admin/associates');
    }
});

//quqote search

// GET /admin/quotes
router.get('/quotes', async (req, res) => {
    try {
        const {status, dateFrom, dateTo, associateId, customerId} = req.query;
        const hasFilters = status || dateFrom || dateTo || associateId || customerId;

        const quotes = hasFilters ? await quoteModel.search({status, dateFrom, dateTo, associateId, customerId}) : [];

        res.render('admin/quotes', {
            title:   'Search Quotes',
            quotes:  hasFilters ? quotes : undefined,
            filters: req.query,
        });
    } 
    catch(err) {
        console.error('[adminViewRoutes.quotes]', err);
        res.status(500).send('Failed to search quotes.');
    }
});

// POST /admin/quotes/:id/delete
router.post('/quotes/:id/delete', async (req, res) => {
    try {
        await quoteModel.remove(req.params.id);
        req.session.flash_success = `Quote #${req.params.id} deleted.`;
        res.redirect('/admin/quotes');
    } 
    catch (err) {
        console.error('[adminViewRoutes.deleteQuote]', err);
        res.redirect('/admin/quotes');
    }
});

module.exports = router;