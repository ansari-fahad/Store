const express = require('express');
const router = express.Router();
const productController = require('../controller/ProductController');

router.get('/', productController.getProducts);

module.exports = router;
