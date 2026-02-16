const express = require('express');
const router = express.Router();
const salesOrderController = require('../controller/SalesOrderController');

router.post('/', salesOrderController.createSalesOrder);
router.get('/', salesOrderController.getSalesOrders);

module.exports = router;
