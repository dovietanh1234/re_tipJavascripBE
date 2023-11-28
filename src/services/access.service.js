'use strict'

const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const SALT = process.env.SALT || 10;
const { db: { R0001, R0002, R0003, R0004 } } = require('../configs/config_role');
const keyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, forbidError, unAuthorizedError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const KeyTokenService = require("./keyToken.service");

class AccessService {
    // write method sign up:
    static signUp = async ({name, email, password}) => {
        try{
            
            //step 1: check email exist on server:
           const holdShop = await shopModel.findOne({email}).lean(); // .lean() -> help query fast more ... return pure js object 

            //step 2: handle wrong case first:
            if(holdShop){
                // if throw error -> controller dismiss the try catch
                throw new BadRequestError("Error! shop already exist");
            }

            const passwordHash = await bcrypt.hash(password, 10);

            // step 3: if it isn't exist on server -> create it
            const newShop = await shopModel.create({
                name: name, 
                email: email, 
                password: passwordHash, 
                roles: R0001
            })

            // step 4: if create success -> create refresh token & access token
            if( newShop ){

                const privateKey = crypto.randomBytes(64).toString('hex'); // convert to hexadecimal 'hex'
                const publicKey = crypto.randomBytes(64).toString('hex');

                // if exist {privateKey, publicKey} save publicKey in collection KeyStore in DB:
                const key_store = await keyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey: publicKey,
                    privateKey: privateKey
                });

                if(!key_store){
                    throw new BadRequestError("Error! something error!");
                }

                // if all of above conditions are met -> create a pair tokens:
                //( accessToken && refrehsToken ) we push to the user -> for make success processs

                const tokens = await createTokenPair({ UserId: newShop._id, email: email, roles:  R0001}, // payloads will have:
                    publicKey, // buffer
                    privateKey // buffer
                );

                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({fields: ['_id', 'name', 'email'], object: newShop}), // use lodash
                        tokens
                    },
                    status: 'created successfully'
                }
            }

            throw new BadRequestError("Error! create account fail! pls try again");
            

        }catch(error){
         //   const a = error.toString();
            throw new forbidError(error);
        }
    }

    // write method login & logout in service:
    static login = async ({email, password, refreshToken = null})=>{
        /*
        1. check email in DB 
        2. compare password's user with password's DB 
        3. create new access token & refresh token -> save in DB
        4. return data( tokens & informs )
        */

        //b1 check email (write a service to check email):
        const foundShop = await findByEmail({email});
        if(!foundShop)throw new BadRequestError("shop not registed");

        //b2. compare password's user with password's DB:
        const match = bcrypt.compare( password, foundShop.password )
        if(!match) throw new unAuthorizedError("password or email wrong try again!");

        //3. create new access token & refresh token -> save in DB:
        const privateKey = crypto.randomBytes(64).toString('hex'); // convert to hexadecimal 'hex'
        const publicKey = crypto.randomBytes(64).toString('hex');

        const tokens = await createTokenPair(
            { UserId: foundShop._id, email: email, roles:  R0001}, // payloads will have:
            publicKey, // toString('hex')
            privateKey // buffer('hex')
        );

        // create KeyToken:
        await KeyTokenService.createKeyToken({
            // save privateKey & publicKey in DB & refreshToken in DB to check Security ...
            // if someone use again refresh token -> this guy will be lock and block ...
            userId: foundShop._id, 
            publicKey: publicKey, 
            privateKey: privateKey, 
            refreshToken: tokens.refreshToken
        })


        return {
            code: 200,
            metadata: {
                shop: getInfoData({fields: ['_id', 'name', 'email'], object: foundShop}), // use lodash
                tokens
            },
            status: 'login successfully'
        }

    }

    // write a method logout( auth for owner... )
    static logout = async (keyStore)=>{
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        console.log('delete delKey: ' + delKey);
        return delKey;
    }

    // WRITE refresh-token Handle func | VERSION 1:
    static handleRefreshToken = async (refreshToken)=>{
        //B1 check this token is used before:
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken);

        //B2 if the refreshToken had exist in DB( its mean which used ) -> send this refreshToken in suspection list
        if(foundToken){
            // decode refresh-token -> to know: who are you
            const {UserId, email} = await verifyJWT(refreshToken, foundToken.privateKey);
            console.log("print data of refresh token: ", UserId, email);

            // when we know this userId ( system will know this userId has been leaked or hacked )
            // disable all access-token & refresh-token of these userId in KeyStore ( remove tokens )
            await KeyTokenService.deleteKeyById(UserId);
            throw new forbidError("something wrong was happen!! please login again");
        }

        //if refreshToken is not exist in DB:
        //B3  Write a func to search this refreshToken, which is using or not:
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
        if(!holderToken) throw new unAuthorizedError("shop did not register"); // if present this code isn't use

        //B4 if we found refresh-token is using on system! we'll give it access for:
        // verify is token legal: 
        const {UserId, email} = await verifyJWT(refreshToken, holderToken.privateKey);
        console.log("print data is using present:  ", UserId, email);
        // check had email this user exist in DB:
        const foundShop = await findByEmail({email});
        if(!foundShop) throw new unAuthorizedError("shop not found"); 

        // B5 return new TOKENS update new tokens -> save old tokens in tokens used list:
        const tokens = await createTokenPair({ UserId: UserId, email: email, roles:  R0001}, // payloads will have:
        holderToken.publicKey, // still keep the old public key in DB
        holderToken.privateKey // still keep the old private key in DB
    );
        // ".lean()" must use in case return a object and render for client 
        // update new tokens: dismiss "lean()" in holderToken -> must to update data
        await holderToken.updateOne({
            refreshToken: tokens.refreshToken,
            $push: {
                refreshTokensUsed: refreshToken // this refreshToken parameter has been used to create new TOKENS
            }
        })

      return {
            user: {UserId, email},
            tokens
      }  
    } 

    // UPDATE VERSION 2 OPTIMISE AND SORT MORE:
    static handleRefreshToken2 = async ({refreshToken, user, keyStore})=>{
        //B1 decode object "user", which has been handled and assigned in middleware:
       const {UserId, email} = user;
        // B2 check if the refreshToken had exist in DB( its mean which used ) -> send this refreshToken in suspection list
        if(keyStore.refreshTokensUsed.includes(refreshToken)){
            await KeyTokenService.deleteKeyById(UserId);
            throw new forbidError("something wrong was happen!! please login again");
        }

         //if refreshToken is not exist in DB:
        //B3  Write a func to search this refreshToken, which is using or not:
        if(keyStore.refreshToken !== refreshToken)throw new unAuthorizedError("shop did not register");
        
        //B4 check had email this user exist in DB:
        const foundShop_mdlw = await findByEmail({email});

        if(!foundShop_mdlw) throw new unAuthorizedError("shop not found");

        //create tokens
        const tokens_mdlw = await createTokenPair({ UserId: UserId, email: email, roles:  R0001}, // payloads will have:
        keyStore.publicKey, // still keep the old public key in DB
        keyStore.privateKey // still keep the old private key in DB
        );

        await keyStore.updateOne({
            refreshToken: tokens_mdlw.refreshToken,
            $push: {
                refreshTokensUsed: refreshToken // this refreshToken parameter has been used to create new TOKENS
            }
        })

      return {
            user,
            tokens_mdlw
      } 
    } 

}

module.exports = AccessService;
