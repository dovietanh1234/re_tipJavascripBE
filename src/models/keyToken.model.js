'use strict'

//!dmbgum -> generate schema for we are not write code:

const mongoose = require('mongoose'); // Erase if already required
const  { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'Key';
const COLLECTION_NAME = 'Keys'

// Declare the Schema of the Mongo model
var keyTokenSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        required: true,
        ref: 'Shop'
    },
    publicKey:{
        type:String,
        required:true
    },
    privateKey:{
        type:String,
        required:true
    },
    refreshTokensUsed:{
        type:Array, default: [] // refresh token was used
    },
    refreshToken:{ // refresh token present!
        type:String,
        required:true
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = model(DOCUMENT_NAME, keyTokenSchema);