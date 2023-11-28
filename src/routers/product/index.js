'use strict'

const express = require('express');
const ProductController = require('../../controllers/product.controller');
const { asyncHandle2 } = require('../../helpers/asyncHandle2');
const { authentication2 } = require('../../auth/authUtils');
const router = express.Router();


// sign up & sign in
router.use(authentication2);
router.post('/shop/create/product', asyncHandle2(ProductController.createProduct));

module.exports = router;