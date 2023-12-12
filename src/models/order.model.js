'use strict'
const  { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Order';
const COLLECTION_NAME = 'Orders'

/*

orderCheckout = {
    "totalPrice": 100,
    "totalApplyDiscount": 100,
    "feeship": 20
}

orderShipping = {
    "street": "",
    "city": "",
    "state": "",
    "country": ""
}



*/

var orderSchema = new Schema({
   
    orderUserId: { type:Number, required: true },
    orderCheckout: { type:Object, default: {} }, // order checkout for user
    orderShipping: { type:Object, default: {} }, // inform this order
    orderPayment: { type:Object, default: {} },
    orderProducts: { type: Array, required: true }, // this is: "shop_order_id_new"
    orderTrackingNumber: { type: String, default: '#000012122023' }, // tracking your order ...
    orderStatus: { type: String, enum: ['pending', 'confirmed', 'shipped', 'canceled', 'delivered'], default: 'pending' }
}, {
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifieddOn'
    }
});

//Export the model
module.exports = {
    order: model(DOCUMENT_NAME, orderSchema)
}