'use strict'

'use strict'

//!dmbgum -> generate schema for we are not write code:
const  { model, Schema } = require('mongoose');


/*
field cartProducts like:
[
    {
        productId,
        shopId,
        quantity,
        name, // meaning we dont neccessarily need to include this field in here BUT we need to check if on the transfer data to server
        price // something crash happen or hacker impact we will check "name", "price" in this field with data "name", "price" on server
              // OR sometime the price has been toggle -> we will get the price at this time for server save data!
    }
]
*/

const DOCUMENT_NAME = 'Cart';
const COLLECTION_NAME = 'Carts'

// Declare the Schema of the Mongo model
var cartSchema = new Schema({
    cartState:{
        type:String,
        required: true,
        enum: ['active', 'completed', 'failed', 'pending'],
        default: 'active'
    },
    cartProducts:{
        type:Array,
        required:true,
        default: []
    },
    cartCountProduct:{ // get number of products in cart
        type:Number,
        default:0
    },
    cartUserId:{
        type:String,
        required: true
    }
}, {
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifieddOn'
    }
});

//Export the model
module.exports = {
    cart: model(DOCUMENT_NAME, cartSchema)
}