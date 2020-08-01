const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

router.get('/getTrainee',userController.getTrainee);

module.exports = router;

