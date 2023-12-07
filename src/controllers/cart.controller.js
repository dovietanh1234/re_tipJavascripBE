'use strict'

const { CREATED, OK } = require("../core/success.response");
const cartService = require('../services/cart.service');

class cartController{
    //addToCart
    createCart = async (req, res, next)=>{
        new OK({
            message: 'create cart success',
            metadata: await cartService.addToCart(req.body)
        }).send(res);
    }


    updateCart = async (req, res, next)=>{
        new OK({
            message: 'successfully manipulation',
            metadata: await cartService.updateInCart(req.body)
        }).send(res);
    }

    //deleteUserCart
    deleteCart = async (req, res, next)=>{
        new OK({
            message: 'delete success',
            metadata: await cartService.deleteUserCart(req.body)
        }).send(res);
    }

    listCart = async (req, res, next)=>{
        new OK({
            message: 'get list cart success',
            metadata: await cartService.getListUserCart(req.body)
        }).send(res);
    }

}


module.exports = new cartController();

