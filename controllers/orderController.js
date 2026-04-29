//Author: Riff Talsma
//Order controller will handle purchase order interface
//convert sanctioned quote to purchase order, submit to external system, email customer
const quoteModel = require('../models/quoteModel');
const itemModel = require('../models/quoteItemModel');
const orderModel = require('../models/orderModel');
const salesModel = require('../models/salesModel');
const emailService = require('../services/emailService');
const externalOrderService = require('../services/externalOrderService');
const {computeOrderPricing} = require('../util/pricing');
const {computeCommissionData} = require('../util/commission');

//get /orders/quoteId
async function getByQuoteId(req, res) {
    try {
        const order = await orderModel.findByQuoteId(req.params.quoteId);

        if(!order) {
            return res.status(404).json({success: false, message: 'Could not find purchase order for this quote'});
        }
        res.json({success: true, data: order});
    }
    catch(err) {
        console.error('[orderController.getByQuoteId]', err);
        res.status(500).json({success: false, message: 'Could not get any purchase orders'});
    }
}

//get /admin/orders
async function getAll(req, res) {
    try{
        const order = await orderModel.findAll();
        res.json({success: true, data: order});
    }
    catch(err) {
        console.error('[orderController.getAll]', err);
        res.status(500).json({success: false, message: 'Could not retrieve all purchase orders'});
    }
}

//post /orders
async function createOrder(req, res) {
    try {
        const {quoteId, finalDiscount = 0} = req.body;

        if(!quoteId) {
            return res.status(400).json({success: false, message: 'quoteId is required for order creation'});
        }

        //validation errors
        const quote = await quoteModel.findById(quoteId);
        if(!quote) {
            return res.status(404).json({success:false, message: 'Could not find quote'});
        }
        if(quote.quote_status !== 'sanctioned') {
            return res.status(409).json({success: false, message: 'Only quotes that are sanctioned can be ordered'});
        }
        const existingOrder = await orderModel.findByQuoteId(quoteId);
        if(existingOrder) {
            return res.status(409).json({success: false, message: 'Quote already has an order'});
        }

        //compute order prce
        const orderPricing = computeOrderPricing(quote.final_total, finalDiscount);
        
        //call external system
        let external;
        try {
            external = await externalOrderService.submitOrder({
                quoteId: quote.id,
                associateId: quote.associate_id,
                customerId: quote.customer_id,
                finalTotal: orderPricing.quote_amount,
                discountAmount: orderPricing.quote_discount
            });
        }
        catch(err) {
            console.error('[External Order Service Error]', err.message);
            return res.status(502).json({success: false, message: err.message});
        }

        //calculate commission
        const commission = computeCommissionData(orderPricing.quote_amount, external.quoteUpdate.commission_pct);
        //update quotes table
        await quoteModel.update(quoteId, {
            ...external.quoteUpdate, //processing_date, commission_pct and all other items
            commission_total: commission.commission_total,
            quote_status: 'ordered'
        });
        //Insert into orderdb
        const orderRecord = {
            quote_id: quoteId, ...orderPricing,
            commission_amt: commission.commission_amt,
            commission_rate: commission.commission_rate
        };
        const order = await orderModel.create(orderRecord);
        //update associate commission
        await salesModel.addCommission(quote.associate_id, commission.commission_amt);

        //email customer!
        const items = await itemModel.findByQuote(quoteId);

        await emailService.sendPurchaseOrderConfirmation(quote, items, {...orderRecord, processing_date: external.quoteUpdate.processing_date});
        //success!!
        res.status(201).json({success: true, data: order});
    }
    catch(err) {
        console.error('[orderController.createOrder]', err);
        res.status(500).json({success: false, message: 'Could not create the purchase order'});
    }
}

module.exports = {getByQuoteId, getAll, createOrder};