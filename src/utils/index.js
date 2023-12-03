'use strict'

// lodash symbolized like "_"

const _ = require('lodash');

const getInfoData = ( { fields = [], object = {} } )=>{
return _.pick(object, fields);
};

// for first object
const removeUndefineObject = obj =>{
    Object.keys(obj).forEach( k => {
        if( obj[k] == null ){
            delete obj[k]
        }
        // else if( obj[k] && typeof obj[k] === 'object' ){
        //     removeUndefineObject(obj[k]);
        // }
    })
    return obj;
}

// if object nested together:
 /*
                    const a = {
                        c: 1,
                        e: {
                            b: 1,
                            g: 2
                        }
                    }
                    this syntax will transfer my data:
                    {     c: 1,
                         `e.b`: 1,
                         `e.g`: 2
                    }

*/
const upadateNestedObjectParser = obj =>{
    const final = {};
    
    // check this key in Object:
    Object.keys(obj || {}).forEach( k => {
        // if this type element == 'object' and which isn't a array 
        if( typeof obj[k] === 'object' && !Array.isArray(obj[k]) ){
            console.log( "kiểu dữ liệu của nó là: " + typeof obj[k]);
            const response = upadateNestedObjectParser(obj[k]);

            // looping the child object! 
            Object.keys(response || {}).forEach( a => {
                // save nested value in final: ` {e.g: 2} `
                final[`${k}.${a}`] = response[a]; // -> product_attributes.brand = 'Guccy'
            });
        }else{
            final[k] = obj[k];
        }
    });
    

    return final;
}



// method has pemission change array into object contains many key-value:
// ex: ['a', 'b'] => {a = 1, b = 1}
const getSelectData = (select = []) => {
    return Object.fromEntries( select.map( value => [value, 1] ) ) // map to change value input
}

const UnGetSelectData = (select = []) => {
    return Object.fromEntries( select.map( value => [value, 0] ) ) // map to change value input
}

// the func just chose the object and get the fields in object throught parameter
module.exports = {
    getInfoData,
    getSelectData,
    UnGetSelectData,
    removeUndefineObject,
    upadateNestedObjectParser
}