'use strict'

const { constant } = require('lodash');
const { BadRequestError } = require('../core/error.response');
const { findById } = require('../services/apiKey.service');

const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization'
}

const permisions = {
    COMMON: '0000',
    STAFF: '1111',
    ADMIN: '2222'
}

// middleware check this router has api key?
const apiKey = async (req, res, next)=>{
    try{
        // check in headers does key exist in here:
        const key = req.headers[HEADER.API_KEY]?.toString();

        if( !key ){
            return res.status(403).json({
                message: 'forbidden error',
            });
        }

        // write a middleware to check does it exist in my DB
        // check object key:
        const objKey = await findById(key);

        if(!objKey){
            return res.status(403).json({
                message: 'forbidden error',
            });
        }

        // if objKey exist in DB
    // *Nếu API key hợp lệ, đối tượng tương ứng với API key đó sẽ được gán vào yêu cầu để sử dụng trong các xử lý tiếp theo: 
        req.objKey = objKey; 


        return next();

    }catch(error){
        throw new BadRequestError("error exception");
    }
}

// middleware check apiKey has permission?
const checkPermissionForApiKey = async (req, res, next) =>{
            if( !req.objKey.permissions  ){
            return res.status(403).json({
                message: 'you dont have permission',
            });
        }
                // is permission legal:
        const validPermission = req.objKey.permissions.includes(permisions.COMMON);
        if( !validPermission ){
            return res.status(403).json({
                message: 'you dont have permission',
            });
        }

        return next();
}

// middleware handle error: ( "fn" from controller send in the parameter for middleware ... )
/*const asyncHandle = async (req, res, next) =>{

    const child_asyncHandle = fn =>{
        return fn(req, res, next).catch(next);
    }
}*/

const asyncHandle = fn =>{
    return (req, res, next) => {
            fn(req, res, next).catch(next);
    };
}



module.exports = {
    apiKey,
    checkPermissionForApiKey,
    asyncHandle
}