'use strict'

const { CREATED, OK } = require("../core/success.response");
const discountService = require("../services/discount.service");

class DiscountController{ 

    createDiscount = async (req, res, next)=>{
        new OK({
            message: 'create discount code success',
            metadata: await discountService.createDiscountCode({
                ...req.body,
                shopId: req.user.UserId
            })
        }).send(res);
    }


    getAllDiscountCodeByProductId = async (req, res, next)=>{
        new OK({
            message: 'all of the discount code can apply for this product: ',
            metadata: await discountService.getAllDiscountCodeWithProduct({
                ...req.body
            })
        }).send(res);
    }

    getAlldiscountCodeOfShopId = async (req, res, next)=>{
        new OK({
            message: 'get all of the discount code of shop successfully',
            metadata: await discountService.getAllDiscountCodeByShop({
                ...req.body,
                shopId: req.user.UserId
            })
        }).send(res);
    }


    applyDiscountCode = async (req, res, next)=>{
        new OK({
            message: 'apply this discount success',
            metadata: await discountService.getDiscountAmount({
                ...req.body
            })
        }).send(res);
    }

    // this funcs test later:
    deleteDiscountCode = async (req, res, next)=>{
        new OK({
            message: 'delete success',
            metadata: await discountService.deleteDiscountCode({
                ...req.body,
                shopId: req.user.UserId
            })
        }).send(res);
    }

    cancelDiscountCode = async (req, res, next)=>{
        new OK({
            message: 'cancel success',
            metadata: await discountService.cancelDiscountCode({
                ...req.body,
                shopId: req.user.UserId
            })
        }).send(res);
    }


    /*
        createDiscount = async (req, res, next)=>{
        new OK({
            message: 'create success',
            metadata: await discountService.cancelDiscountCode(req.body)
        }).send(res);
        }

    */

 }

 module.exports = new DiscountController();