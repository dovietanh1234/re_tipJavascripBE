'use strict'

const { BadRequestError } = require('../../core/error.response');
const { product, electronic, clothing, funiture } = require('../../models/product.model');
const { Types } = require('mongoose');

// QUERY
const findAllDrafts_repo = async({ query, limit, skip })=>{
    return await queryProduct({ query, limit, skip });
}

//findAllPublish_repo
const findAllPublish_repo = async({ query, limit, skip })=>{
    return await queryProduct({ query, limit, skip });
}


const queryProduct = async ({query, limit, skip})=>{
    return await product.find(query)
    .populate('product_shop', 'name email -_id') // get related value from user table( name, email) exception _id
    .sort({ updateAt: -1 }) // get element newest
    .skip(skip)
    .limit(limit)
    .lean()
    .exec() // is a phrase that represent: asyn await 
}

const searchProduct = async ({  keySearch })=>{
    const regexSearch = new RegExp(keySearch);
    // to easy query for result -> we need to assign index for userName & description:
    const results = await product.find({ 
        isPublished: true,
        $text: { $search: regexSearch }}, 
        {score: { $meta: 'textScore' } })
        .sort({score: { $meta: 'textScore' } }).lean();
    return results;
}




// CRUD:

// PUT turn on publish product:
const publishProduct_repo = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({ 
        product_shop: new Types.ObjectId(product_shop), // bcs we query in other table so we need to cast data to it running
        _id: new Types.ObjectId(product_id)
     })

     if(!foundShop) throw new BadRequestError("the product is not found");

     // update to public data if we found product:
     const { modifiedCount } = await foundShop.updateOne({ 
        isDraft: false,
        isPublished: true
     });

     // modifiedCount -> boolean: 0 or 1
     return modifiedCount; 
}

// PUT: turn off publish product By shopId
const turnOffpublishProduct_repo = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({ 
        product_shop: new Types.ObjectId(product_shop), // bcs we query in other table so we need to cast data to it running
        _id: new Types.ObjectId(product_id)
     })

     if(!foundShop) throw new BadRequestError("the product is not found");

     // update to public data if we found product:
     const { modifiedCount } = await foundShop.updateOne({ 
        isDraft: true,
        isPublished: false
     });

     // modifiedCount -> boolean: 0 or 1
     return modifiedCount; 
}

module.exports = {
    findAllDrafts_repo,
    publishProduct_repo,
    findAllPublish_repo,
    turnOffpublishProduct_repo,
    searchProduct
}