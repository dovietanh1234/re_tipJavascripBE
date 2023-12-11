'use strict'

const { BadRequestError } = require('../../core/error.response');
const { product, electronic, clothing, funiture } = require('../../models/product.model');
const { Types } = require('mongoose');
const {getSelectData, UnGetSelectData} = require('../../utils/index');

// QUERY:
// query findAllDraft_repo
const findAllDrafts_repo = async({ query, limit, skip })=>{
    return await queryProduct({ query, limit, skip });
}

// query findAllPublish_repo
const findAllPublish_repo = async({ query, limit, skip })=>{
    return await queryProduct({ query, limit, skip });
}

// query product 
const queryProduct = async ({query, limit, skip})=>{
    return await product.find(query)
    .populate('product_shop', 'name email -_id') // get related value from user table( name, email) exception _id
    .sort({ updateAt: -1 }) // get element newest
    .skip(skip)
    .limit(limit)
    .lean()
    .exec() // is a phrase that represent: asyn await 
}


// update product:
const updateProductById = async ({ 
    productId,
    payload,
    model,
    isNew = true,
 })=> {
   
     return await model.findByIdAndUpdate(productId,  payload , {
        new: isNew
    });

    // const { modifiedCount } = data.updateOne(payload);
    // return (!modifiedCount)?"update fail please try again *-* ":" Update done your data is alter ";
}



// query search
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

// query find all products: sorting "ctime" newest time -1 to put in the update field 
const findAllProducts = async ({ limit, sort, page, filter, select})=>{
    const skip = (page - 1) * limit;
    const sortBy = sort == 'ctime' ? { updateAt: -1 } : { updateAt: 1 }; // _id: -1 
    const products = await product.find(filter)
                                  .sort( sortBy )
                                  .skip(skip)
                                  .limit(limit)
                                  .select(getSelectData(select)) // .select() only reveive the parameters by object! -> so we will change array into object through .getSelectData() func!
                                  .lean();
    
    return products;                              
}

// unSelect different with select: "Select" if we want to selects 3 fields we will put in the parameters 3 fields  
// "unSelect" it will get a lot product's fields -> exception "_v" (version) field ... so we will write a unSelect method! 
const findProductDetail = async ({ product_id, unSelect }) =>{
    return await product.findById( product_id ).select(UnGetSelectData(unSelect))
}

const findProductDetail_follow_field = async ({ product_id, select }) =>{
    return await product.findById( product_id ).select(getSelectData(select));

    // return await product.findOne( {
    //     _id: product_id
    // } )

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


const checkProductByServer = async ( products ) =>{
    // add more fields in object in array use map:
    return await Promise.all( products.map( async p =>{
        const foundProduct = await findProductDetail({ product_id: p.productId, unSelect: ['__v'] });
        if(foundProduct){
            return {
                price: foundProduct.product_price,
                quantity: p.quantity,
                productId: p.productId
            }
        }
    }) )
}


module.exports = {
    findAllDrafts_repo,
    publishProduct_repo,
    findAllPublish_repo,
    turnOffpublishProduct_repo,
    searchProduct,
    findAllProducts,
    findProductDetail,
    updateProductById,
    findProductDetail_follow_field,
    checkProductByServer
}