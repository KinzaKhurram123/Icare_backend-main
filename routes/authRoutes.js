const express = require('express');
const { registerUser, loginUser, forgetPassword, conformationPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forget_password', forgetPassword)
router.post('/checkOTP', conformationPassword)
router.post('/reset_password', resetPassword)

module.exports = router;
