'use strict'

const {getSelectData, UnGetSelectData} = require('../../utils/index');
const {convertObjectIdMongo} = require('../../utils/index')

const { cart } = require('../../models/cart.model');

const findCartById = async (cartId) =>{
    return await cart.findOne({
        _id: convertObjectIdMongo(cartId),
        cartState: 'active'
    }).lean();
}

module.exports = {
    findCartById
}