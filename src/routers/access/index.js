'use strict'

const express = require('express');
const accessController = require('../../controllers/access.controller');
const { asyncHandle2 } = require('../../helpers/asyncHandle2');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();


// sign up & sign in
router.post('/shop/signup', asyncHandle2(accessController.signUp));
router.post('/shop/login', asyncHandle2(accessController.login));



// write a func authen for logout ( whether it's itself or not ... ):
router.use(authentication);
router.post('/shop/logout', asyncHandle2(accessController.logout));
router.post('/shop/refreshToken', asyncHandle2(accessController.handleRefreshToken));

module.exports = router;