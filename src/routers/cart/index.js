'use strict'

const express = require('express');
const cartController = require('../../controllers/cart.controller');
const { asyncHandle2 } = require('../../helpers/asyncHandle2');
const { authentication2 } = require('../../auth/authUtils');
const router = express.Router();

//router.use(authentication2);
router.get('/shop/cart/getall', asyncHandle2(cartController.listCart));
router.post('/shop/cart/create', asyncHandle2(cartController.createCart));
router.post('/shop/cart/update',  asyncHandle2(cartController.updateCart)); //updateCart
router.post('/shop/cart/delete',  asyncHandle2(cartController.deleteCart));


module.exports = router;