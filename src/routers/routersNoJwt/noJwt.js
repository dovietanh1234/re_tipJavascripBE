'use strict'

const express = require('express');
const ProductController = require('../../controllers/product.controller');
const accessController = require('../../controllers/access.controller');
const discountController = require('../../controllers/discount.controller');
const checkoutController = require('../../controllers/checkout.controller');
const inventoryController = require('../../controllers/inventory.controller');
const { asyncHandle2 } = require('../../helpers/asyncHandle2');
const { authentication2 } = require('../../auth/authUtils');
const router = express.Router();

//findProductDetail
router.get('/shop/detail/product/:product_id', asyncHandle2(ProductController.findProductDetail));
router.get('/shop/search/:keySearch', asyncHandle2(ProductController.searchProduct));
router.get('/shop/getall/product', asyncHandle2(ProductController.findAllProducts));
// sign up & sign in
router.post('/shop/signup', asyncHandle2(accessController.signUp));
router.post('/shop/login', asyncHandle2(accessController.login));
// discount:
router.post('/shop/applyDiscountCode', asyncHandle2(discountController.applyDiscountCode));
router.get('/shop/getAllDiscountByProductId', asyncHandle2(discountController.getAllDiscountCodeByProductId));

//CHECKOUT:
router.post('/shop/checkout/review', asyncHandle2(checkoutController.checkout));

//INVENTORY:
router.use(authentication2);
router.post('/shop/addInventory',  asyncHandle2(inventoryController.addStock));

module.exports = router;