'use strict'

const mongoose = require('mongoose');
const { db: { host, name, port } } = require('../configs/config_mongodb');

const connectString = `mongodb://${host}:${port}/${name}`;
const { countConnect } = require('../helpers/check.connect');
class Database {
    //( use single ton ) init in here -> use stategy pattern to connect mysql mongoseDB or oracle 

    //B1 create constructor:
    constructor(){
        this.connect()
    }

    //B2 create connect:
    connect( type = 'mongodb' ){
        if( 1 === 1 ){
            mongoose.set('debug', true)
            mongoose.set('debug', { color: true })
        }

        mongoose.connect( connectString )
                .then( _ => {
                    console.log(`connected mongoseDB success ${host}:${port}/${name}`);
                    // use when we need to check number connect to server ... 
                    countConnect();
                })
                .catch( err => console.log(`error connect`))
    }

    //B3 write a instance file:
    static getInstance(){
        // if it is not exist -> init variable instance
        if( !Database.instance ){
            Database.instance = new Database();
        }

        return Database.instance
    }
}

//B4 declare for instance connect:
const instanceMongosedb = Database.getInstance(); // call fnc step 3 (init class to use)
module.exports = instanceMongosedb