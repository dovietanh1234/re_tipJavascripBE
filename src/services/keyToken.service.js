'use strict'

const { filter, update } = require("lodash");
const keyTokenModel = require("../models/keyToken.model");
const { Types } = require('mongoose');


class KeyTokenService {
// write  function create token:
static createKeyToken = async ({userId, publicKey, privateKey, refreshToken}) =>{
    try{
      // level xxx: use method automic in DB ( it can hanldes 2 activities in only a call )
      // b1: declare options use for method automic:
        const filter = {user: userId}, update = {
            publicKey: publicKey,
            privateKey: privateKey,
            refreshTokensUsed: [], // alter model "keyTokenModel"
            refreshToken: refreshToken
        }, options = { upsert: true, new: true };

        //b2: run automic func: (if not found we will create if it was exist we want update) 
        // the comand demand the "options" -> options auto check if it's new -> will insert | if it has been exist we will update 
        const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options)

        return tokens ? tokens.publicKey : null;
        
    }catch(error){
        return error;
    }
}

static findByUserId = async (userId)=>{
    // if we put the string it will never find -> force type for data: 
    //findOne({user: userId}) --> findOne({user: Types.ObjectId(userId) })
    return await keyTokenModel.findOne({user: new Types.ObjectId(userId) });
}

static removeKeyById = async (id)=>{
    return await keyTokenModel.deleteOne(id); // if error there will be error happen
}

//func: find refresh token 
static findByRefreshTokenUsed = async (refreshToken)=>{
    // if refresh token was exist in array:
    return await keyTokenModel.findOne({ refreshTokensUsed: refreshToken }).lean();
}

// delete token's key func:
static deleteKeyById = async (userId)=>{
    return await keyTokenModel.deleteOne({user: new Types.ObjectId(userId) }); // if had error -> alter this code to "user: new Types.ObjectId(userId)"
}

// find refresh token is using present in DB:
static findByRefreshToken = async (refreshToken)=>{
    // if refresh token was exist in array:
    return await keyTokenModel.findOne({ refreshToken });
}


}

module.exports = KeyTokenService; // because use static function so web just export a class ( not a new instance's class )