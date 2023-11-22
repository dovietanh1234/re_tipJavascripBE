'use strict'

//!dmbgum -> generate schema for we are not write code:

const mongoose = require('mongoose'); // Erase if already required
const  { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'Shop';
const COLLECTION_NAME = 'Shops'

// Declare the Schema of the Mongo model
var shopSchema = new Schema({
    name:{
        type:String,
        trim: true,
        maxLength: 158
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim: true
    },
    password:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum: ['active', 'inactive'],  
        default:'inactive',
    },
    verify:{
        type:Schema.Types.Boolean, // we've verified this shop
        required:false,
    },
    roles:{
        type: Array, // this shop has permission to access resources in server 
        default: []
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = model(DOCUMENT_NAME, shopSchema);