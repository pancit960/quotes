const express = require('express');
const quoteController = require('../controllers/quoteController');
const{authenticate, requireRole} = require('./middleware/auth');

const router = express.Router();
router.use(authenticate);

//associate interface
router.get('/', quoteController.getMyQuotes);
router.get('/:id', quoteController.getOne);
router.post('/', quoteController.create);
router.put('/:id', quoteController.updateEmail);
router.post('/:id/finalize', quoteController.finalize);

//line items
router.post('/:id/items', quoteController.addItem);
router.put('/:id/items/:itemId', quoteController.updateItem);
router.delete('/:id/items/:itemId', quoteController.deleteItem);

//secret notes
router.post('/:id/notes', quoteController.addNote);

//HQ interface
router.get('/hq/finalized', requireRole('hq', 'admin'), quoteController.getFinalizedQuotes);
router.put('/hq/:id', requireRole('hq', 'admin'), quoteController.hqUpdateQuote);

module.exports = router;

