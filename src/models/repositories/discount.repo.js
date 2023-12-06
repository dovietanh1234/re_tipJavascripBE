'use strict'

const {getSelectData, UnGetSelectData} = require('../../utils/index');
const {convertObjectIdMongo} = require('../../utils/index')

const findAllDiscountCodesUnSelect = async({
    limit = 50, page = 1, sort = 'ctime', filter, unSelect, model
}) => {

    const skip = (page - 1) * limit;
    const sortBy = sort == 'ctime' ? { updateAt: -1 } : { updateAt: 1 }; // _id: -1 
    const document = await model.find(filter)
                                  .sort( sortBy )
                                  .skip(skip)
                                  .limit(limit)
                                  .select(UnGetSelectData(unSelect)) // .select() only reveive the parameters by object! -> so we will change array into object through .getSelectData() func!
                                  .lean();
    
    return document;    
}

const findAllDiscountCodesSelect = async({
    limit = 50, page = 1, sort = 'ctime', filter, select, model
}) => {

    const skip = (page - 1) * limit;
    const sortBy = sort == 'ctime' ? { updateAt: -1 } : { updateAt: 1 }; // _id: -1 
    const document = await model.find(filter)
                                  .sort( sortBy )
                                  .skip(skip)
                                  .limit(limit)
                                  .select(getSelectData(select)) // .select() only reveive the parameters by object! -> so we will change array into object through .getSelectData() func!
                                  .lean();
    
    return document;    
}

const checkDiscountExist = async ({model, code, shopId}) => {
    return await model.findOne({
        discount_code: code,
        discount_shopId: convertObjectIdMongo(shopId) 
        // because shopId we receive in the client's input so we need to convert ObjectId ( in model we declare this type: Schema.Types.ObjectId ... )
    }).lean();
}


module.exports = {
    findAllDiscountCodesUnSelect,
    findAllDiscountCodesSelect,
    checkDiscountExist
}