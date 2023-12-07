'use strict'

const { cart } = require('../models/cart.model');
const { convertObjectIdMongo } = require('../utils/index');
const { BadRequestError, NotFoundError } = require('../core/error.response');
const {findProductDetail} = require('../models/repositories/product.repo');
class CartService{

    // START REPO CART SERVICE
    static async createUserCart({ userId, product }){
        const query = { cartUserId: userId, cartState: 'active' },
        updateOrInsert = {
            $addToSet: {
                cartProducts: product
            }
        }, options = { upsert: true, new: true }

        return await cart.findOneAndUpdate( query, updateOrInsert, options );
    }

    static async updateQuantityCart({ userId, product }){
        const { productId, quantity } = product;
        const query = { 
            cartUserId: userId,  
            'cartProducts.productId': productId,
            cartState: 'active'
        }, updateSet = {
            $inc: {
                'cartProducts.$.quantity': quantity
            }
        }, options = { upsert: true, new: true }


        return await cart.findOneAndUpdate( query, updateSet, options );
    }
    // END CART REPO



// this func ONLY FOR add product
    static async addToCart({ userId, product = {} }){
        // check Do cart exist?
        const userCart = await cart.findOne({ cartUserId: userId });
        if(!userCart){
            // create cart for user:
            return await CartService.createUserCart({ userId, product });
        }

        // if user already has cart but which dont have anny product inside:
        if(userCart.cartProducts.length !== 0){
          //  userCart.cartProducts = [product]; // update cart has a new element in array
          //  return await userCart.save();
        
          console.log("dữ liệu có đi vào đây không? ");
          return userCart.updateOne({
            $push: {
                cartProducts: product
            }
          })
        }

        return await CartService.updateQuantityCart({userId, product});
    }


    /*
        shop_order_id: [
                {
                    shopId,
                    itemProducts: [
                        {
                            quantity,
                            price,
                            shopId,
                            oldQuantity,
                            productId
                        },
                        {
                            quantity,
                            price,
                            shopId,
                            oldQuantity,
                            productId
                        }
                    ],
                    version  // this is optimistic lock and pessimistic lock and distributed lock 

                }
        ]
    */
    static async updateInCart({ userId, shop_order_id }){
        const { productId, quantity, oldQuantity } = shop_order_id[0]?.itemProducts[0]; // ?. underfine or null

        // check product:
        const foundProduct = await findProductDetail({ product_id: productId, unSelect: ['__v']});

        if(!foundProduct) throw new NotFoundError("data is not exist");

        //compare ( productShopId input == productShopId in DB ):

        if(foundProduct.product_shop.toString() !== shop_order_id[0]?.shopId ) throw new NotFoundError("data is not exist");

        if( quantity === 0 ){
            // delete producted:
            if(!foundProduct) throw new NotFoundError("are you sure you want to delete this product, call deleteUserCart to delete ");
        }

        
        console.log("dữ liệu quantity: ", quantity , oldQuantity)
        return CartService.updateQuantityCart({
            userId,
            product: {
                productId, 
                quantity:  quantity - oldQuantity // 2  -  1 increase(1)  |  1  -   2 increase (-1) 
            }
        });

    }


    static async deleteUserCart({userId, productId}){
        const query = { cartUserId: userId, cartState: 'active' },
        updateSet = {
            $pull: { // pull out a product like: delete a product!
                cartProducts: {
                    productId
                }
            }
        }
        //if we want to delete product we need to move this product in history stock delete( to track user behavior )
        // use for this case: after if have a sale this product -> will have a notify sent to client this deleted product is currently on promotion
        const deleteCart = await cart.updateOne(query, updateSet)
        return deleteCart;
    }

    static async getListUserCart({userId}){
        return await cart.findOne({
            cartUserId: userId
        }).lean();
    }


}

module.exports = CartService