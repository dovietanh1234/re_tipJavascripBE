'use strict'

const apiKeyModel = require("../models/apiKey.model")
const crypto = require('crypto');
const findById = async ( key ) => {

    // pretend try to insert a value in DB to check:
    // const newKey = await apiKeyModel.create({ key: crypto.randomBytes(64).toString('hex'), permissions: ['0000']});
    // console.log("apiKey: " + newKey);


    const objectKey = await apiKeyModel.findOne({key, status: true}).lean();
    return objectKey;
}


module.exports = {
    findById
}

/*
=> file service to work with model (DATABASE)
*/