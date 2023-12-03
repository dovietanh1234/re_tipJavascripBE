'use strict'


const {model, Schema, Types} = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Inventory';
const COLLECTION_NAME = 'Inventories'

// inventory:
var InventorySchema = new Schema({
    
    inventory_productId: { type: Schema.Types.ObjectId, ref: 'Product' }, // reference to product collection
    inventory_location: {type: String, default: 'unknow' },
    inventory_stock: { type: Number, required: true }, // inventory quantity
    inventory_shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
    inventory_reservations: { type: Array, default: [] }, // when client add to cart we will save this data in here!
    /*when we order -> we will subtract the quanity in stock, when client payment we will delete invetory_reservation to preserves Integrity in the database */

}, {
    timestamps: true,
    collection: COLLECTION_NAME
});




//Export the model
module.exports = {
    inventory: model(DOCUMENT_NAME, InventorySchema),

};