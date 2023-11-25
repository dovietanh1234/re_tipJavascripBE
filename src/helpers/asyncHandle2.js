'use strict'

const asyncHandle2 = fn =>{
    return (req, res, next) => {
            fn(req, res, next).catch(next);
    };
}

module.exports = {
    asyncHandle2
}