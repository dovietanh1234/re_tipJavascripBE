'use strict'

const express = require('express');
const ProductController = require('../../controllers/product.controller');
const { asyncHandle2 } = require('../../helpers/asyncHandle2');
const { authentication2 } = require('../../auth/authUtils');
const router = express.Router();


//searchProduct
//router.get('/shop/search/:keySearch', ProductController.searchProduct);

// sign up & sign in

router.use(authentication2);
router.post('/shop/create/product', asyncHandle2(ProductController.createProduct));
router.post('/shop/publish/:id', asyncHandle2(ProductController.publishProduct));
router.post('/shop/turnOff/publish/:id', asyncHandle2(ProductController.turnOffpublishProduct));

//QUERY
router.get('/shop/get/drafts', asyncHandle2(ProductController.getAllDraftsShopId));
router.get('/shop/get/publish', asyncHandle2(ProductController.getAllPublishShopId));

// update product:
router.patch('/shop/update/product/:productId', asyncHandle2(ProductController.updateProduct));


module.exports = router;