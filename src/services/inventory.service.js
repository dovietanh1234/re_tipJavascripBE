'use strict'

const {NotFoundError, BadRequestError} = require('../core/error.response');
const { discount } = require('../models/discount.model');
const { findProductDetail } = require("../models/repositories/product.repo");
const { checkProductByServer } = require('../models/repositories/product.repo');
const { getDiscountAmount } = require('../services/discount.service');
const { accquireLock, releaseLock } = require('./redis.service');
const { order } = require('../models/order.model');
const { inventory } = require('../models/inventory.model');

class InventoryService {
    // service to create incoming shipments: like: if we rund out of products we will enter new incoming shipments
    static async addStockToInventory({
        stock,
        productId,
        shopId,
        location = 'Ha Noi',
    }){
        const product = await findProductDetail({ product_id: productId, unSelect: ['__v'] });
        if(!product) throw new NotFoundError("product is not exist");

        const query = {
            inventory_shopId: shopId,
            inventory_productId: productId
        }, updateSet = {
            $inc: {
                inventory_stock: stock
            },
            $set: {
                inventory_location: location
            }
        }, options = {
            upsert: true,
            new: true
        }

        return await inventory.findOneAndUpdate(query, updateSet, options);
    }

    
}

module.exports = InventoryService