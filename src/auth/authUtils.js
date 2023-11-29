'use strict'

const JWT = require('jsonwebtoken');
const {asyncHandle2} = require('../helpers/asyncHandle2');
const { BadRequestError, unAuthorizedError, NotFoundError } = require('../core/error.response');
const { findByUserId } = require('../services/keyToken.service');
const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization',
    CLIENT_ID: 'x-client-id',
    REFRESH_TOKEN: 'refreshtoken'
}

// CREATE ACCESS TOKEN & REFRESH TOKEN THROUGHT PAIR KEY!
const createTokenPair = async (payload, publicKey, privateKey)=>{
    try{
        //step 1: create access token throught privateKey: (payload like values we want push in the token: id, email, role ...)
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: '2 days'
        })

        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: '7 days'
        })

        // write another function is: verified and use token ... 
        JWT.verify(accessToken, publicKey, (error, decode)=>{
            if( error ){
                console.log("error verify::: ", error.message);
            }else{
                console.log("decode success", decode);
            }
        })
        // just verify accessToken & not verify refresh token OK
        
        return {accessToken, refreshToken}
    }catch(error){
        return error;
    }
}

const authentication = asyncHandle2(async (req, res, next)=>{
    // B1. check userId missing???
    const userId = req.headers[HEADER.CLIENT_ID];
    if( !userId ) throw new unAuthorizedError("invalid request");

    // B2. get access token:
    const keyStore = await findByUserId(userId);
    if( !keyStore ) throw new NotFoundError("userId not found");

    // B3. verify token (logout client must to transfer the refresh token to logout) : 
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if( !accessToken ) throw new unAuthorizedError("token is not found");


     // try-catch only use in case we handle many logics ...
    try{
        // B4. check user in DB:
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        
        // B5. check keyStore with userId:
        if(userId != decodeUser.UserId)throw new unAuthorizedError("invalid user");

        // B6. return next(); reassign the object User for object req (ex: req.keyStore.name or req.keyStore.email ...)
        req.keyStore = keyStore;

        return next();
    }catch(error){
        throw new BadRequestError(`${error}`);
    }
});

const authentication2 = asyncHandle2(async (req, res, next)=>{
    // B1. check userId missing???
    const userId = req.headers[HEADER.CLIENT_ID];
    if( !userId ) throw new unAuthorizedError("invalid request");

    // B2. get access token:
    const keyStore = await findByUserId(userId);
    if( !keyStore ) throw new NotFoundError("userId not found");

    // [additional new]: check refresh-token in headers:
    if( req.headers[HEADER.REFRESH_TOKEN] ){
        try{
            const refreshToken = req.headers[HEADER.REFRESH_TOKEN];
            // B4. check user in DB:
            const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
            
            // B5. check keyStore with userId:
            if(userId != decodeUser.UserId)throw new unAuthorizedError("invalid user");
            
            // B6. return next(); reassign the object User for object req (ex: req.keyStore.name or req.keyStore.email ...)
            req.keyStore = keyStore;

            // [additional new]: assign 2 values to the object:
            req.user = decodeUser;
            req.refreshToken = refreshToken;
            
            // [additional new]: after got a refreshToken -> return next() to run controller handle
            return next();
        }catch(error){
            throw new BadRequestError(`${error}`);
        }
    }

    // B3. verify token (logout client must to transfer the refresh token to logout) : 
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if( !accessToken ) throw new unAuthorizedError("token is not found");


     // try-catch only use in case we handle many logics ...
    try{
        // B4. check user in DB:
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        
        // B5. check keyStore with userId:
        if(userId != decodeUser.UserId)throw new unAuthorizedError("invalid user");

        req.user = decodeUser;
        // B6. return next(); reassign the object User for object req (ex: req.keyStore.name or req.keyStore.email ...)
        req.keyStore = keyStore;

        return next();
    }catch(error){
        throw new BadRequestError(`${error}`);
    }
});


// function verify refresh-token:
const verifyJWT = async (token, KeySecret)=>{
    return await JWT.verify(token, KeySecret);
}


module.exports = {
    createTokenPair,
    authentication,
    verifyJWT, 
    authentication2
}

/*
 payload: contains information carried from one system to another throught TOKEN ...  
 privateKey not save in the DB -> its used once time when we SIGN IN or LOGIN SUCCESS -> it will push to Browser ...

*/