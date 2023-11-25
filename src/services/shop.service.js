'use strict'

const shopModel = require("../models/shop.model")

const findByEmail = async ({email, select = {
   _id: 1, email: 1, password: 1, name: 1, status: 1, roles: 1
}}) => {
    return await shopModel.findOne({email}).select(select).lean();
    // receive the value and transfer for "select" parameter through method ".select()"
    // return a object contain properties's object "select" in parameter...
}

module.exports = {
    findByEmail
}