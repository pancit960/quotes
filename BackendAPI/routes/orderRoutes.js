//routes/orderRoutes
//purchase order interaface
const express = require('express');
const orderController = require('../controllers/orderController');
const {authenticate, requireRole} = require('./middleware/auth');

const router = express.Router();

router.use(authenticate);

//create order
router.post('/', orderController.createOrder);

//get by id
router.get('/:quoteId', orderController.getByQuoteId);

//view all if admin/hq
router.get('/admin/all', requireRole('hq', 'admin'), orderController.getAll); 

module.exports = router;