'use strict'

const express = require('express');
const { apiKey, checkPermissionForApiKey } = require('../auth/checkAuthen');
const router = express.Router();
//const ProductController = require('../controllers/product.controller')
//const discountController = require('../controllers/discount.controller');
//check apiKey:
router.use(apiKey);
//check permission(this key has permission to access our system BE):
router.use(checkPermissionForApiKey); // put the key '0000' in the parameter

//router.post('/shop/applyDiscountCode', discountController.applyDiscountCode);
// import routers:

router.use('/v1/api', require('./routersNoJwt/noJwt'));
router.use('/v1/api', require('./cart/index'));
//router.get('/shop/search/:keySearch', ProductController.searchProduct);
router.use('/v1/api', require('./access/index'));
router.use('/v1/api', require('./product/index'));
router.use('/v1/api', require('./discount/index'));



// if has error in above routers -> 2 router under will catch error and render a common error 
// router handle error: ( this is middleware so manage error func will has 4 parameters to identify with another func)

router.use( (req, res, next)=>{
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

router.use((error, req, res, next)=>{
    // comon error:
    const statusCode = error.status || 500 ;
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        stack: error.stack, // add to know where is the fail happen:
        message: error.message || 'internal server error'
    });
});


module.exports = router;