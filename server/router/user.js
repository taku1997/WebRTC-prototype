const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

router.get('/getTrainee',userController.getTrainee);
router.get('/getTrainer',userController.getTrainer);

module.exports = router;

