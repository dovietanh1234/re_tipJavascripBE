'use strict'

const {getSelectData, UnGetSelectData} = require('../../utils/index');

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

module.exports = {
    findAllDiscountCodesUnSelect,
    findAllDiscountCodesSelect
}