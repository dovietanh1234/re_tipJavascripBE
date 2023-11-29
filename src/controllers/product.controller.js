'use strict'

const { CREATED, OK, SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");
const ProductService_V2 = require("../services/productLevelX.service");

class ProductController{
    /*createProduct = async (req, res, next)=>{
        const { UserId } = req.user;
        new SuccessResponse({
            message: 'create Product success',
            metadata: await ProductService.createProduct( req.body.product_type, {
                ...req.body,
                product_shop: req.user.UserId
            } ),
        }).send(res);
    }*/

    // update ProductService version comply with the SOLID principal and apply stategy pattern:
    createProduct = async (req, res, next)=>{
        new SuccessResponse({
            message: 'create Product success',
            metadata: await ProductService_V2.createProduct( req.body.product_type, {
                ...req.body,
                product_shop: req.user.UserId
            } ),
        }).send(res);
    }

}

module.exports = new ProductController();
/*
use technique "spread operator" to spread old data in parameters and Add new data to any field needed
*/