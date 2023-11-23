'use strict'

// API KEY has duty: save token ( day/month/year ) -> for us manage this key token 

const {model, Schema, Types} = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Apikey';
const COLLECTION_NAME = 'Apikeys'

// Declare the Schema of the Mongo model
var apiKeySchema = new Schema({
    key:{ // key we will generate for api key 
        type:String,
        required:true,
        unique:true
    },
    status:{ // this key is active
        type:Boolean,
        default: true
    },
    permissions:{ // this key has permission
        type:[String],
        required:true,
        enum:['0000', '1111', '2222'],
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = model(DOCUMENT_NAME, apiKeySchema);