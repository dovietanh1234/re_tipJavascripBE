'use strict'

const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const SALT = process.env.SALT || 10;
const { db: { R0001, R0002, R0003, R0004 } } = require('../configs/config_role');
const keyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, forbidError } = require("../core/error.response");

class AccessService {
    // write sign up:
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


}

module.exports = AccessService;
