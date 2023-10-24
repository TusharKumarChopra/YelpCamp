const express = require('express');
const router = express.Router();
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');


//to group same routes with different requests
router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.registerUser));

router.route('/login')
    .get(users.renderLoginForm)
    .post(storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: 'login'}) ,catchAsync(users.loginUser))

router.get('/logout', users.userLogout);


module.exports = router ;