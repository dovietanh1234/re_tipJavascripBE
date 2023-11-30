'use strict'

// lodash symbolized like "_"

const _ = require('lodash');

const getInfoData = ( { fields = [], object = {} } )=>{
return _.pick(object, fields);
};

// method has pemission change array into object contains many key-value:
// ex: ['a', 'b'] => {a = 1, b = 1}
const getSelectData = (select = []) => {
    return Object.fromEntries( select.map( value => [value, 1] ) ) // map to change value input
}

const UnGetSelectData = (select = []) => {
    return Object.fromEntries( select.map( value => [value, 0] ) ) // map to change value input
}

// the func just chose the object and get the fields in object throught parameter
module.exports = {
    getInfoData,
    getSelectData,
    UnGetSelectData
}