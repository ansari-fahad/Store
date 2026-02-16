const express = require('express');
const router = express.Router();
const urlShortenerController = require('../controller/UrlShortenerController');

router.post('/shorten', urlShortenerController.getShortUrl);

module.exports = router;
