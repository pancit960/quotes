/**
 * routes/adminRoutes.js
 * Administrative interface — sales associate CRUD + quote search/delete.
 */

const express = require('express');
const salesAssociateController = require('../controllers/salesAssociateController');
const quoteController = require('../controllers/quoteController');
const orderController = require('../controllers/orderController');
const {authenticate, requireRole} = require('./middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(requireRole('admin'));

//sales associate manager
router.get('/associates', salesAssociateController.getAll);
router.get('/associates/:id', salesAssociateController.getSingle);
router.post('/associates', salesAssociateController.create);
router.put('/associates/:id', salesAssociateController.update);
router.delete('/associates/:id', salesAssociateController.remove);

//quote search/managing
router.get('/quotes', quoteController.adminSearch);   // ?status=&dateFrom=&dateTo=&salesAssociateId=&legacyCustomerId=
router.delete('/quotes/:id', quoteController.adminDelete);

//all orders
router.get('/orders', orderController.getAll);

module.exports = router;