'use strict'

const {NotFoundError, BadRequestError} = require('../core/error.response');
const { discount } = require('../models/discount.model');
const { findCartById } = require("../models/repositories/checkout.repo");
const { checkProductByServer } = require('../models/repositories/product.repo');
const { getDiscountAmount } = require('../services/discount.service');
const { accquireLock, releaseLock } = require('./redis.service');
const { order } = require('../models/order.model');

class CheckoutService {
     
/*
"cartId": "098767389087584932098",
"userId": "098767389087584932098",
"shop_order_id": [
                        {
                            "shopId": "6561879dfb0e542382ad7dd7",
                            "shopDiscount": [{
                                "shopId": "6561879dfb0e542382ad7dd7",
                                "discountId": "6561879dfb0e542382ad7dd7",
                                codeId: "SHOP-1111"
                            }],
                            "itemProduct": [
                                {
                                    "price": 12,
                                    "quantity": 12.
                                    "productId": "098767389087584932098"
                                }  
                            ]  
                        },
                        {
                            "shopId": "6561879dfb0e542382ad7dd7",
                            "shopDiscount": [{
                                "shopId": "6561879dfb0e542382ad7dd7",
                                "discountId": "6561879dfb0e542382ad7dd7",
                                codeId: "SHOP-1111"
                            }],
                            "itemProduct": [
                                {
                                    "price": 12,
                                    "quantity": 12.
                                    "productId": "098767389087584932098"
                                }  
                            ]  
                        }
 ]

*/

    static async checkOutReview({
        cartId, userId, shop_order_id = []
    }){
        //check cartId exist or not
        const foundCart = await findCartById(cartId);
        if(!foundCart) throw new BadRequestError("not found cart");
        
        const checkoutOrder = {
            totalPrice: 0,
            feeShip: 0,
            totalDiscount: 0,
            totalCheckout: 0
        }, shop_order_id_new = [] // this will contain new value after apply discount voucher ...
        // we will return new order list alter for old order. inside contains price of each product multiple together 

        // caculate total bill:
        for( let i = 0; i < shop_order_id.length; i++ ){
               const { shopId, shopDiscount = [], itemProduct = [] } = shop_order_id[i];

               // check is product valid:
               const checkProductServer = await checkProductByServer(itemProduct);
               console.log("dữ liệu có undefine ko?  " + JSON.stringify(checkProductServer));

               if(!checkProductServer[0]) throw new BadRequestError("order fail! ");

               // total bill
               const checkoutPrice = checkProductServer.reduce((acc, p)=>{ 
                    return acc += (p.quantity * p.price);
               }, 0);

               console.log("tổng số tiền là: " + checkoutPrice);

               // total price before handle -> 
               checkoutOrder.totalPrice += checkoutPrice;

               // push data in the shop_order_id_new contains two additional data fields:
               const itemCheckout = {
                shopId: shopId,
                shopDiscount: shopDiscount,
                priceRaw: checkoutPrice, // money before discount
                priceApplyDiscount: checkoutPrice,
                itemProduct: checkProductServer
               }

               // if shop_discount exist > 0 check is it valid or not ?
               if(shopDiscount.length > 0){
                // if has a discount -> get the amount discount:
                const {totalOrder = 0, discount = 0, totalPrice = 0} = await getDiscountAmount({
                    codeId: shopDiscount[0].codeId, 
                    userId: userId, 
                    shopId: shopId, 
                    products: checkProductServer
                });
                checkoutOrder.totalDiscount += discount;
                if( discount > 0 ){
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount
                }
               }

               // total last checkout:
               checkoutOrder.totalCheckout += itemCheckout.priceApplyDiscount;
               shop_order_id_new.push(itemCheckout);
        }

        // we can save "shop_order_id_new" in temporary collection to checking user status

        return {
            shop_order_id,
            shop_order_id_new,
            checkoutOrder
        }
    }


    static async orderByUser({
        shop_order_id,
        cartId,
        userId, 
        userAddress,
        userPayment
    }){

        const { shop_order_id_new, checkoutOrder } = await CheckoutService.checkOutReview({
            cartId, 
            userId, 
            shop_order_id
        });

        // check again -> use an algorithm flatmap -> get all products -> because it nested together -> we map in an array
        // so after that: we will check this product in the inventory stock is it has any products in stock?

        // step 1: get new array product (apply flatMap):
        const products = shop_order_id_new.flatMap( order =>  order.itemProduct );

        console.log("mảng product mới: " + products);
        const acquireProduct = []

        // apply optimistic lock to check products in inventory stock
        for( let i = 0; i < products.length; i++ ){
            const {productId, quantity} = products[1];
            // we have created the lock on the redis.service.js:
            // apply optimistic lock:
            const keyLock = await accquireLock( productId, quantity, cartId );
            // if something unexpected happens like: product sold out, oversold product ... return notify for customer
            acquireProduct.push(keyLock?true:false ); // we will check later if have any false value send notify for customer
            
            if(keyLock){
               return await releaseLock(keyLock);
            }
        }

        // check if have another product expired or oversold in acquireProduct:
        if( acquireProduct.includes(false) ){
            throw new BadRequestError("some products have updated please return your cart");
        }

        // if all products finished => create new order(we dont create schema order) : 
        const newOrder = await order.create({
            orderUserId: userId,
            orderCheckout: checkoutOrder, 
            orderShipping: userAddress,
            orderPayment: userPayment,
            orderProducts: shop_order_id_new
        });

        // if isert success -> remove all products in cart
        if( newOrder ){
                // remove product in cart
        }   
        return newOrder;
    }

    // func: query orders [users] -> user get total price in order
    static async getOrdersByUser(){

    }

    // get order using Id (User)
    static async getOneOrderByUser(){

    }

   // cancel order by userId
    static async cancelOrderByUser(){

    }

    // update order status -> admin or shop
    static async updateOrderStatusByUser(){
            
    }

}

module.exports = CheckoutService