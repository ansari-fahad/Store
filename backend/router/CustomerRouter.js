const express = require('express');
const router = express.Router();
const customerController = require('../controller/CustomerController');

router.get('/', customerController.getCustomers);

module.exports = router;
