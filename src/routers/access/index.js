'use strict'

const express = require('express');
const accessController = require('../../controllers/access.controller');
const { asyncHandle } = require('../../auth/checkAuthen');
const router = express.Router();


// sign up 
router.post('/shop/signup', asyncHandle(accessController.signUp));
router.post('/shop/login', asyncHandle(accessController.login));


module.exports = router;