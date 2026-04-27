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
            return res.render('associate/quote-new', {title})
        }
    }
    catch {
        
    }
})