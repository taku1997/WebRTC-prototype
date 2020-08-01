const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');

// router.get('/signup',authController.getSignup);
router.post('/trainer/signup',authController.postSignup);
router.post('/trainer/signin', authController.postSignin);

router.post('/trainee/signup',authController.traineeSignup);
router.post('/trainee/signin',authController.traineeSignin);





module.exports = router;

