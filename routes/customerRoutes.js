//Author: Riff Talsma
const express = require('express');
const customerController = require('../controllers/customerController');
const {authenticate} = require('./middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', customerController.getAll);
router.get('/search', customerController.search);
router.get('/:id', customerController.getSingle);

module.exports = router;