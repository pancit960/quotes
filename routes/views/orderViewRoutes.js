//views for purchase order interface

const express = require('express');
const quoteModel = require('../../models/quoteModel');
const quoteItemModel = require('../../models/quoteItemModel');
const orderModel = require('../../models/orderModel');
const salesModel = require('../../models/salesModel');
const externalOrderSvc = require('../../services/externalOrderService');
const emailService  = require('../../services/emailService');
const {computeOrderPricing} = require('../../util/pricing');
const {computeCommission} = require('../../util/commission');
const {requireSessionRole} = require('../middleware/sessionAuth');

const router = express.Router();

router.use(requireSessionRole('hq', 'admin'));

//order list
// GET /orders
router.get('/', async (req, res) => {
    try {
        //sanctioned quotes ready to be ordered
        const quotes = await quoteModel.search({status: 'sanctioned'});
        //all existing purchase orders
        const orders = await orderModel.findAll();

        res.render('order/order-list', {
            title: 'Purchase Orders',
            quotes,
            orders,
            success: req.session.flash_success || null,
            error: req.session.flash_error || null,
        });
        delete req.session.flash_success;
        delete req.session.flash_error;
    } 
    catch(err) {
        console.error('[orderViewRoutes.list]', err);
        res.status(500).send('Failed to load orders');
    } 
});

//order confirmation
//get /orders/:quoteId
router.get('/:quoteId', async (req, res) => {
    try {
        const quote = await quoteModel.findById(req.params.quoteId);
        if(!quote) {
            return res.status(404).send('Quote not found');
        }
        if(quote.quote_status !== 'sanctioned') {
            req.session.flash_error = 'Only sanctioned quotes can be ordered';
            return res.redirect('/orders');
        }

        const items = await quoteItemModel.findByQuote(quote.id);

        res.render('order/order-confirm', {
            title: `Place Order — Quote #${quote.id}`,
            quote: { ...quote, associate_name: `Associate #${quote.associate_id}` },
            items,
            error: req.session.flash_error || null,
        });

        delete req.session.flash_error;
    } 
    catch(err) {
        console.error('[orderViewRoutes.confirm]', err);
        res.status(500).send('Failed to load order confirmation');
    }
});

//submit an order
//post /orders/:quoteId
router.post('/:quoteId', async (req, res) => {
    try {
        const quoteId = parseInt(req.params.quoteId, 10);
        const quoteDiscount = parseFloat(req.body.quoteDiscount) || 0;

        //1. validate the quote
        const quote = await quoteModel.findById(quoteId);
        if(!quote || quote.quote_status !== 'sanctioned') {
            req.session.flash_error = 'Quote is not available for ordering';
            return res.redirect('/orders');
        }

        const existingOrder = await orderModel.findByQuoteId(quoteId);
        if(existingOrder) {
            req.session.flash_error = 'An order already exists for this quote';
            return res.redirect('/orders');
        }

        //2. compute the final amount
        const pricing = computeOrderPricing(quote.final_total, quoteDiscount);
        const quoteAmount = computeOrderPricing.quote_amount;
        const discountUsed = pricing.quote_discount;

        //3. submit to external niu system
        let externalResult;
        try {
            externalResult = await externalOrderSvc.submitOrder({
                quoteId,
                associateId: quote.associate_id,
                customerId: quote.customer_id,
                finalTotal: quoteAmount,
            });
        } 
        catch(extErr) {
            req.session.flash_error = `External system error: ${extErr.message}`;
            return res.redirect(`/orders/${quoteId}`);
        }

        const {processingDate, commissionRate} = externalResult;

        //4. compute commission
        const commissionAmt = computeCommission(quoteAmount, commissionRate);

        //5. save the order records
        const order = await orderModel.create({
            quoteId,
            quoteDiscount,
            quoteAmount,
            commissionAmt,
            commissionRate,
        });

        //6. update the quote status
        await quoteModel.update(quoteId, {
            quote_status: 'ordered',
            ordered_at: new Date(),
            commission_pct: commissionRate,
            commission_total: commissionAmt,
            processing_date: processingDate,
            discount_final: quoteDiscount,
        });

        //7. add to associate commission
        await salesModel.addCommission(quote.associate_id, commissionAmt);

        //8. email the customer
        const items = await quoteItemModel.findByQuote(quoteId);
        await emailService.sendPurchaseOrderConfirmation(quote, items, order);

        req.session.flash_success = `Order #${order.id} placed successfully. Customer emailed`;
        res.redirect('/orders');
    } 
    catch(err) {
        console.error('[orderViewRoutes.submitOrder]', err);
        req.session.flash_error = 'Failed to place order';
        res.redirect(`/orders/${req.params.quoteId}`);
    }
});

module.exports = router;