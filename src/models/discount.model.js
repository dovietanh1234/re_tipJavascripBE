'use strict'

// use stric giảm rò rỉ bộ nhớ trong node js:
const {model, Schema} = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Discount';
const COLLECTION_NAME = 'Discounts'

var DiscountSchema = new Schema({
    discount_name: { type: String, required: true },
    discount_description: { type: String, required: true },
    discount_type: { type: String, default: "fixed_amount" }, // percentage
    discount_value: { type: Number, required: true }, // ex: fixed_amount = 10k vnd -> if another discount price -> for shop write in
    discount_code: {type: String, required: true}, 
    discount_startDate: {type: Date, required: true},
    discount_endDate: {type: Date, required: true},
    discount_quantityUsed: { type: Number, required: true }, // how many discount will be release
    discount_numberOfTimeUserUsed: { type: Number, required: true }, // number of times user used this discount 
    discount_userUsed: { type: Array, default: [] }, // who is the person used this discount?
    discount_maxNumberUsedPerUser: { type: Number, required: true },// Maximum number used per user ... 
    discount_minOrderValue: { type: Number, required: true }, // min order value
    discount_shopId: {type: Schema.Types.ObjectId, ref: 'Shop'}, // shop'id discount
    discount_isActive: { type: Boolean, default: true }, // this discount is active or not
    discount_applyTo: { type: String, required: true, enum: ['all', 'specify'] }, // this discount apply for all products in shop or secify product in shop?
    discount_productId: { type: Array, default: [] }, // if this discount apply for specify product in shop ... transfer product's id in this field
    







    /* inventory_productId: { type: Schema.Types.ObjectId, ref: 'Product' }, // reference to product collection
    inventory_location: {type: String, default: 'unknow' },
    inventory_stock: { type: Number, required: true }, // inventory quantity
    inventory_shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
    inventory_reservations: { type: Array, default: [] },*/
    
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = {
    inventory: model(DOCUMENT_NAME, DiscountSchema),

};