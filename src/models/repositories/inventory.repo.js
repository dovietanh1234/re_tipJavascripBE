'use strict'

const { update } = require("lodash");
const { convertObjectIdMongo } = require("../../utils");
const { inventory } = require("../inventory.model");
const { Types } = require('mongoose');

const insertInventory = async ({
    productId, shopId, stock, location = 'unknow'
})=>{
    return await inventory.create({
        inventory_productId: productId,
        inventory_location: location,
        inventory_stock: stock,
        inventory_shopId: shopId //new Types.ObjectId()
    })
}


// write a inventory order function:
const reservationInventory = async ({productId, quantity, cartId})=>{
    const query = {
        inventory_productId: convertObjectIdMongo(productId),
        inventory_stock: {$gte: quantity}//your duty must greater or equal to number they bought
    }, updateSet = { // decrease stock
        $inc: {
            inventory_stock: -quantity // minus the quantity purchased
        },
        $push: {
            inventory_reservations: { // push inform client push in the array
                quantity, // to compare statistics, how many people ordered ... ex: stock 100 products minus to the amount they ordered inside this array how much is left?
                cartId,  // cartId will have all the informs so we dont have to put any more information inside 
                createOn: new Date()
            }
        }
    }, options = {
        upsert: true,
        new: true
    }

    return await inventory.updateOne(query, updateSet, options);
}




module.exports = {
    insertInventory,
    reservationInventory
}