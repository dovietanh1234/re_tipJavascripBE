'use strict'
const mongoose = require('mongoose');
const os = require('os');
const process = require('process');
const _SECOND = 5;
const BYTE = 1024;

//COUNT NUMBER
const countConnect = () => {
    const numConnection = mongoose.connections.length;
    console.log(`number of connection: ${numConnection}`);
}

//CHECK OVERLOAD CONNECT( số lượng quá tải )
const checkOverload = () => {
    setInterval( ()=>{
        const numConnection = mongoose.connections.length;
        const numCores = os.cpus().length; // inform about core -> how many space remaining
        const memoryUsage = process.memoryUsage().rss; //how many memory is using

        // example maximum number of connections based on number of cores (ex: my computer can bear 5 cores( core / 5 connection ))
        const maxConnection = numCores * 5; // my lap has beared 40 connection

        console.log(`Active connection: ${numConnection}`);

        // number memory remaining:
        console.log(`memory usage: ${memoryUsage / BYTE / BYTE} MB`);

        // server is overload 40 connection:
        if( numConnection > maxConnection ){
            console.log(`connection overload detechted!`);
        }
    }, _SECOND); //monitor every 5 seconds after 5s we have been checking number connect to server!
}


module.exports = {
    countConnect,
    checkOverload
}

// check to show how many connect to server