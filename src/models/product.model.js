'use strict'

const { Schema, model, Types } = require("mongoose")

const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Products'

// model Parent Product:
const productSchema = new Schema({
    product_name: {type: String, required: true},
    product_thumb: { type: String, required: true },
    product_description: String,
    product_price: { type: Number, required: true },
    product_quantity: { type: Number, required: true },
    product_type: { type: String, required: true, enum: ['Electronics', 'Clothing', 'Furniture'] },
    product_shop: {type: Schema.Types.ObjectId, ref: 'Shop'},
    product_attributes: { type: Schema.Types.Mixed, required: true } // Mixed -> it's mean: accept any types data, everythings kinds are accept
}, {
    collection: COLLECTION_NAME,
    timestamps: true
})


// model child Clothing:
const clothingSchema = new Schema({
    brand: { type: String, require: true },
    size: String, // size will be have a lot of sizes... but now we still design basic -> so we will secify that only one size is used
    material: String,
    product_shop: {type: Schema.Types.ObjectId, ref: 'Shop'}
}, {
    collection: 'Clothes',
    timestamps: true
})

// model child Electronics:
const electronicSchema = new Schema({
    manifacturer: { type: String, require: true },
    model: String, // size will be have a lot of sizes... but now we still design basic -> so we will secify that only one size is used
    color: String,
    product_shop: {type: Schema.Types.ObjectId, ref: 'Shop'}
}, {
    collection: 'Electronics',
    timestamps: true
})

// model child Furniture:
const funitureSchema = new Schema({
    manifacturer: { type: String, require: true },
    origin: String, // size will be have a lot of sizes... but now we still design basic -> so we will secify that only one size is used
    material: String,
    product_shop: {type: Schema.Types.ObjectId, ref: 'Shop'}
}, {
    collection: 'Funitures',
    timestamps: true
})


module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    clothing: model('Clothing', clothingSchema),
    electronic: model('Electronic', electronicSchema),
    funiture: model('Funiture', funitureSchema)
};