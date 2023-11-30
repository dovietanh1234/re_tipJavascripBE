'use strict'

const express = require('express');
const ProductController = require('../../controllers/product.controller');
const accessController = require('../../controllers/access.controller');
const { asyncHandle2 } = require('../../helpers/asyncHandle2');
const router = express.Router();

//findProductDetail
router.get('/shop/detail/product/:product_id', asyncHandle2(ProductController.findProductDetail));
router.get('/shop/search/:keySearch', asyncHandle2(ProductController.searchProduct));
router.get('/shop/getall/product', asyncHandle2(ProductController.findAllProducts));
// sign up & sign in
router.post('/shop/signup', asyncHandle2(accessController.signUp));
router.post('/shop/login', asyncHandle2(accessController.login));

module.exports = router;