'use strict'

const JWT = require('jsonwebtoken');

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

module.exports = {
    createTokenPair
}

/*
 payload: contains information carried from one system to another throught TOKEN ...  
 privateKey not save in the DB -> its used once time when we SIGN IN or LOGIN SUCCESS -> it will push to Browser ...

*/