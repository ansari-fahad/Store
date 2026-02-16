const express = require('express');
const router = express.Router();
const invoiceImageController = require('../controller/InvoiceImageController');

router.get('/:id', invoiceImageController.generateInvoiceImage);

module.exports = router;
