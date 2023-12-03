'use strict'

const { CREATED, OK, SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");
const ProductService_V2 = require("../services/productLevelX.service");

class ProductController{

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

// turn on publish Product
    publishProduct = async (req, res, next)=>{
        new SuccessResponse({
            message: 'TURN ON PRODUCT SUCCESS',
            metadata: await ProductService_V2.publishProductByShop( {
                product_shop: req.user.UserId,
                product_id: req.params.id
            } ), 
        }).send(res);
    }

//turnOffpublishProductByShop
// turn off publish Product
turnOffpublishProduct = async (req, res, next)=>{
    new SuccessResponse({
        message: 'TURN OFF PRODUCT SUCCESS',
        metadata: await ProductService_V2.turnOffpublishProductByShop( {
            product_shop: req.user.UserId,
            product_id: req.params.id
        } ), 
    }).send(res);
}

    //QUERY:
    // query all drafts from userId:
    getAllDraftsShopId = async (req, res, next)=>{
        new SuccessResponse({
            message: 'Get list drafts of shopId',
            metadata: await ProductService_V2.findAllDraftsForShop({ product_shop: req.user.UserId }),
        }).send(res);
    } 

    getAllPublishShopId = async (req, res, next)=>{
        new SuccessResponse({
            message: 'Get list Publish of shopId',
            metadata: await ProductService_V2.findAllPublishForShop({ product_shop: req.user.UserId }),
        }).send(res);
    } 

    searchProduct = async (req, res, next)=>{
        console.log("dữ liệu có đi vào đây ko? " + req.params.keySearch);
        new OK({
            message: 'search product success!',
            metadata: await ProductService_V2.searchProduct(req.params),
        }).send(res);
    }
    
    // get all products:
    findAllProducts = async (req, res, next)=>{
        new OK({
            message: 'find all products success!',
            metadata: await ProductService_V2.findAllProducts(req.params),
        }).send(res);
    }

    // get product detail: findProductDetail
    findProductDetail = async (req, res, next)=>{
        new OK({
            message: 'find all products success!',
            metadata: await ProductService_V2.findProductDetail(req.params),
        }).send(res);
    }

    //UPDATE PRODUCT PATCH:
    updateProduct = async( req, res, next ) => {
        new SuccessResponse({
            message: 'UPDATE PRODUCT SUCCESS',
            metadata: await ProductService_V2.updateProduct( {productId: req.params.productId, payload: req.body} ),
        }).send(res);
    }



}

module.exports = new ProductController();
/*
use technique "spread operator" to spread old data in parameters and Add new data to any field needed
*/