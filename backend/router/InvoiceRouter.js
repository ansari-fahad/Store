const express = require('express');
const router = express.Router();
const invoiceController = require('../controller/InvoiceController');

router.get('/:id', invoiceController.generateInvoicePDF);

module.exports = router;
