'use strict'

// lodash symbolized like "_"

const _ = require('lodash');

const getInfoData = ( { fields = [], object = {} } )=>{
return _.pick(object, fields);
};

// the func just chose the object and get the fields in object throught parameter
module.exports = {
    getInfoData
}