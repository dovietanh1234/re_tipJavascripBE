'use strict'


const { reject } = require('lodash');
const { resolve } = require('path');
const redis = require('redis');
// use promise file của node js is "Util" -> this will help us not to callback!
const { promisify } = require('util');
const { reservationInventory } = require('../models/repositories/inventory.repo');

// call "createClient" -> to create a redis server:
const redisClient = redis.createClient(); // if we call ".createClient()" auto default connect to port 6379
/*
    "const redisClient = redis.createClient(); " -> if we connect to another port so we must to config inside.
*/


// create a async await file throught:
// this "promisify" has mission to change a function to a async await function promise
// we will take advantage of it to do what we want 
const pexpire = promisify(redisClient.pExpire).bind(redisClient);

// use setexpire -> if it is exist => we will set value for it
//               ->  if it is not exist => we wont set value for it

const setnxAsync = promisify(redisClient.setNX).bind(redisClient);

// write a lock function:
// we will create a key to lock -> when someone want to buy this product
// this func will create a key and give for the firstly person 
// first person when guy perform all actives( order done, check inventory stock done... ) done!
// return this key for behind person... 
const accquireLock = async( productId, quantity, cartId ) =>{
    const key = `lock_v2023_${productId}`
    
    // if person dont get the key at this time -> that person will to wait -> we will set that guy: how many time that guy must to wait
    const reTryTime = 10; // for accept 10 times to try get the key
    // set time create lock how many second?
    const expireTime = 3000;

    // 10 times to get key:
    for( let i = 0; i < reTryTime; i++ ){
        // create a key, who is the guy will get the key... they will be accepted to order ...
        const result = await setnxAsync(key, expireTime);
        console.log("create key if success = 1 if not  = 0" + result);

        if( result === 1 ){
            // manipulate with inventory:
            const isReversation = await reservationInventory({
                productId, quantity, cartId
            });
            if(isReversation.modifiedCount){ // if > 0 -> update valid 
                // set this key expired ( expire in 3 seconds ):
                await pexpire(key, expireTime);
                return key; // key will release in 3s 
            }

            return null;
        }else{
            // if fail to save key or create -> call promise 0.05s callback again by promise
            await new Promise( (resolve, reject)=> setTimeout(resolve, 50) ); 
        }
    }

}

// function release lock for behind people:
const releaseLock = async keylock => {
    const deleteAsyncKey = promisify(redisClient.del).bind(redisClient); //
    return deleteAsyncKey(keylock);
}



module.exports = {
    accquireLock,
    releaseLock
}

/*
    if first person has a key and on the mission -> so next person perform will be try 10 times to get the key ... 
    so first person done!  -> will be return key for next person ... next person 10 times try to get the key.
*/