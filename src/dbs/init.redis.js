'use strict'

const redis = require('redis');

// connect to default port redis in docker:
const client = redis.createClient({
    port: 6379,
    host: '127.0.0.1'
})

// check redis have been connected to pool:
client.on('connect', ()=>{
    console.log('redis connected success');
});

module.exports = client;

/*
save 1 value:
nếu có thì tăng giá trị nếu ko có thì ko lưu:
...
const getIpUser = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
console.log('du lieu print ra la: ' + req.headers['x-forwarded-for'] + '  '+ req.connection.remoteAddress);
// ta sẽ vứt cái ip này vào cache để xem nó đã thực hiện request bao nhiêu lần rồi! 
 const numRequest = await incr(getIpUser)
...


increase 1 value of key:
const incr = async key =>{
    try {
        const result = await client.incr(key);
        return result;
    } catch (err) {
        throw err;
    }
}
*/