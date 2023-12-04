'use strict'

const { BadRequestError, NotFoundError } = require('../core/error.response');
const {discount} = require('../models/discount.model');
const { Types } = require('mongoose');
const { convertObjectIdMongo } = require('../utils/index');
const { findAllProducts } = require('../models/repositories/product.repo');
const { findAllDiscountCodesUnSelect, findAllDiscountCodesSelect } = require('../models/repositories/discount.repo');

/*
discount services:
    1 - generator discount code [admin( can create admin's discount ) | shop ( can create shop's discount )]
    2 - get discount amount [user ( when user use this discount we can show for user: how much discount do you get?, is it legal? )]
    3 - get all discount code [User | Shop] 
    4 - verify discount code [User]
    5 - delete discount code [admin | shop]
    6 - cancel discount code [user]
*/

class DiscountService{


    static async createDiscountCode(payload){
        const {
            code, startDate, endDate, isActive, shopId, minOrderValue, 
            aplliesTo, productIds, name, description, type, value, maxValue,
            maxUses, usesCount, maxNumberUsedPerUser, usersUsed
        } = payload;

        // Check time ( this time start to large more time end so ):
        if( new Date() < new Date(startDate) || new Date() > new Date(endDate) ){
            throw new BadRequestError("Discount code has expired");
        } 

        if( new Date(startDate) >= new Date(endDate) ){
            throw new BadRequestError("start date with end date is invalid");
        }

        // create index for discount code:
        // find discount code is exist in DB:
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertObjectIdMongo(shopId) 
            // because shopId we receive in the client's input so we need to convert ObjectId ( in model we declare this type: Schema.Types.ObjectId ... )
        }).lean();

        if(foundDiscount && foundDiscount.discount_isActive) throw new BadRequestError("discount has been exist");

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type, 
            discount_value: value, 
            discount_code: code, 
            discount_startDate: new Date(startDate),
            discount_endDate: new Date(endDate),
            discount_quantityUsed: maxUses,
            discount_numberOfTimeUserUsed: usesCount, 
            discount_userUsed: usersUsed, 
            discount_maxNumberUsedPerUser: maxNumberUsedPerUser,
            discount_minOrderValue: minOrderValue || 0, 
            discount_maxValue: maxValue, 
            discount_shopId: shopId, 
            discount_isActive: isActive,
            discount_applyTo: aplliesTo, 
            discount_productId: aplliesTo === "all"? [] : productIds ,
        })

        return newDiscount;
    }

    static async updateDiscountCode(){
        // we will built ourselves
    }

    // get all discount codes available with products
    // check discount code of each shop
    static async getAllDiscountCodeWithProduct({
        code, shopId, userId, limit, page
    }){
        // create index for discount_code:
        // find discount code is exist in DB:
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertObjectIdMongo(shopId) 
            // because shopId we receive in the client's input so we need to convert ObjectId ( in model we declare this type: Schema.Types.ObjectId ... )
        }).lean();

        if(!foundDiscount || !foundDiscount.discount_isActive) throw new NotFoundError("don't have any discount");

        // reuse module product repo:
        const { discount_applyTo, discount_productId } = foundDiscount;
        let products;

        if(discount_applyTo === "all"){
            // get all products
            products = await findAllProducts({
                filter: {
                    product_shop: convertObjectIdMongo(shopId),
                    isPublished: true
                },
                limit: +limit, // cast the integer type
                page: +page, // cast the integer type
                sort: 'ctime',
                select: [ 'product_name', 'product_price', 'product_thumb' ] 
            });
        }

        if(discount_applyTo === "specify"){
            // get specific products follow id:
            products = await findAllProducts({
                filter: {
                    _id: {$in: discount_productId}, // new syntax "$in" get data "discount_productId" from foundDiscount object
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: [ 'product_name', 'product_price', 'product_thumb' ] 
            });
            
        }

        return products;
    }

    // get all discount code of shop ( get list discount_code by shopId ):
    static async getAllDiscountCodeByShop({
        limit, page, shopId
    }){
        const discounts = await findAllDiscountCodesUnSelect({
            limit: +limit,
            page: +page,
            filter:  {
                discount_shopId: convertObjectIdMongo(shopId),
                discount_isActive: true
            },
            unSelect: ['__v', 'discount_shopId'],
            model: discount
        });

        return discounts;
    }


    




}

