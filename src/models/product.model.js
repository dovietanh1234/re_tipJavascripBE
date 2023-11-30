'use strict'

const { Schema, model, Types } = require("mongoose")
const slugify = require('slugify');
const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Products'

// model Parent Product:
const productSchema = new Schema({
    product_name: {type: String, required: true},
    product_thumb: { type: String, required: true },
    product_description: String,
    product_slug: String, // additional
    product_price: { type: Number, required: true },
    product_quantity: { type: Number, required: true },
    product_type: { type: String, required: true, enum: ['Electronics', 'Clothing', 'Furniture'] },
    product_shop: {type: Schema.Types.ObjectId, ref: 'Shop'},
    product_attributes: { type: Schema.Types.Mixed, required: true }, // Mixed -> it's mean: accept any types data, everythings kinds are accept
    // additional rateting:
    product_ratingsAverages: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be above 5.0'],
        // rouned to int:
        set:  (val) => Math.round(val * 10)/10 // we will get two numbers so we multiple with 10
    },
    // additional variations( color, GB ... ):
    product_variations: { type: Array, default: [] },
    // additional isDraft, isPublic -> to turn off or turn on product in website:
    // when we crate default -> it's called draft( we dont give names prefixed with "product" ->  bcs this are variables we won't select to show )
    isDraft: { type: Boolean, default: true, index: true, select: false }, // default = true -> it wont public on website 
    isPublished: { type: Boolean, default: false, index: true, select: false }
}, {
    collection: COLLECTION_NAME,
    timestamps: true
})


// Create middleware assign index for product_name & product_description -> to easy search( query ) more:
// create index for search
productSchema.index({ product_name: 'text', product_description: 'text' })

// Before when we built model -> we should write a Middleware handle data Before initial Product model (runs before .save() .create()... ) :
//the term for this is called "webhook (cant hear clearly) ..."
// before .save() or .create() it will go to .pre() first:
productSchema.pre( 'save', function(next){
    this.product_slug = slugify(this.product_name, {lower: true}); // auto fill data for product_slug field
    next();
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