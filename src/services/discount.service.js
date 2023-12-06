'use strict'

const { BadRequestError, NotFoundError } = require('../core/error.response');
const {discount} = require('../models/discount.model');
const { Types } = require('mongoose');
const { convertObjectIdMongo } = require('../utils/index');
const { findAllProducts } = require('../models/repositories/product.repo');
const { 
    findAllDiscountCodesUnSelect, 
    findAllDiscountCodesSelect,
    checkDiscountExist
} = require('../models/repositories/discount.repo');

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

        // this check we should use Builder pattern to check fault for detail:

        // Check time ( this time start to large more time end so ):
        if( new Date(startDate) > new Date(endDate) || new Date() > new Date(endDate) ){
            throw new BadRequestError("Discount code has expired");
        } 

        if( new Date(startDate) >= new Date(endDate) ){
            throw new BadRequestError("start date with end date is invalid");
        }

        // create index for discount code:
        // find discount code is exist in DB:
        const foundDiscount = await checkDiscountExist({model: discount, code, shopId});

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
    // get product's code when we enter the discount code we can get list discount product ( this discount apply for product )
    static async getAllDiscountCodeWithProduct({
        code, shopId, userId, limit, page
    }){
        // create index for discount_code:
        // find discount code is exist in DB:
        const foundDiscount = await checkDiscountExist({model: discount, code, shopId});

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




    /*
    apply discount code:
    params: product's order

    products: [{
        productId,
        shopId,
        quantity,
        name,
        price
    },
    {
        productId,
        shopId,
        quantity,
        name,
        price
    }]
    */
    static async getDiscountAmount({
        codeId, userId, shopId, products 
    }){
        const foundDiscount = await checkDiscountExist({ model: discount, code: codeId, shopId });

        if( !foundDiscount )throw new NotFoundError('dont have any discount');

        // use destructuring get paremeters in discount:
        const {
            discount_isActive,
            discount_quantityUsed,
            discount_startDate,
            discount_endDate,
            discount_minOrderValue,
            discount_maxNumberUsedPerUser,
            discount_userUsed,
            discount_type,
            discount_value
        } = foundDiscount;

        if(!discount_isActive) throw new BadRequestError("discount is invalid");
        if(!discount_quantityUsed) throw BadRequestError("run out of discount"); // check number discount remain if (quantity == 0) => run out of discount

        if( new Date() < new Date(discount_startDate) || new Date() > new Date(discount_endDate) ) throw new BadRequestError("discount expired!");

        // check this discount just use for orders has minimum on 1** ( if shop set min order discount ) 
        let totalOrder = 0;
        if(discount_minOrderValue > 0){
            // get total this Order (if we get total price in total products we use method:  "reduce()" to get faster ):
            totalOrder = products.reduce( (acc, product) =>{
                return acc + (product.quantity * product.price );
            }, 0);

            if(totalOrder < discount_minOrderValue ) throw new BadRequestError(`discount required a minimum order value ${discount_minOrderValue}`);
        } 

        // check case: if each person just only receive a discount:
        if( discount_maxNumberUsedPerUser > 0 ){
            const userUsedDiscount = discount_userUsed.filter( user => user.userId === userId ); // remember this line!
            if( userUsedDiscount.length > 0 ){
                if( userUsedDiscount.length >= discount_maxNumberUsedPerUser ){
                    throw new BadRequestError("this discount is limit! you have used this discount more than once  ");
                }
            }   
        }

        // computing the discount amount: if discount_type = "fixed_amount" -> follow fixed_amount( discount_value )
        // if  discount_type !== 'fixed_amount' get follow the percent input through "discount_value"
        // ex: discount_type === 'fixed_amount' -> discount_value = 10.000vnd (discount 10k vnd)
        //     discount_type !== 'fixed_amount'  -> discount_value = 5% ( discount 5% ) 
        const amount = discount_type === 'fixed_amount'? discount_value : totalOrder * (discount_value / 100);

        return {
            totalOrder: totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount
        }

        

    }


    
    // delete data ( when we delete something this data will transfer to other database like history database )
    static async deleteDiscountCode({ shopId, codeId }){

        // before we delete we need to check is this discount available anywhere?

        const delete_element = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertObjectIdMongo(shopId)
        })
        return delete_element;
    }

    static async cancelDiscountCode( {codeId, shopId, userId} ){
        const foundDiscount = await checkDiscountExist({
            model: discount,
            code: codeId,
            shopId
        });

        if(!foundDiscount) throw NotFoundError("discount is not exist");

        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_userUsed: userId
            },
            $inc: {
            discount_quantityUsed: 1, // return the original discount amount ...
            discount_numberOfTimeUserUsed: -1, // return used discount amount = 0   
            }
        })

        return result;

    }

}

module.exports = DiscountService;