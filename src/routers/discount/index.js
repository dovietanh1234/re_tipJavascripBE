'use strict'

const express = require('express');
const discountController = require('../../controllers/discount.controller');
const { asyncHandle2 } = require('../../helpers/asyncHandle2');
const { authentication2 } = require('../../auth/authUtils');
const router = express.Router();

router.use(authentication2);
router.post('/shop/createDiscount', asyncHandle2(discountController.createDiscount));
router.post('/shop/getAllDiscountByShopId', asyncHandle2(discountController.getAlldiscountCodeOfShopId));


module.exports = router;