const express = require('express');
const router = express.Router();

const videoController = require('../controllers/video');

router.post('/postVideo',videoController.videoPost);

module.exports = router;
