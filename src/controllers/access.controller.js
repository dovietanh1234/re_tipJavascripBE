'use strict'

const { CREATED } = require("../core/success.response");
const accessService = require("../services/access.service");



class AccessController{


    // create func:
    signUp = async (req, res, next)=>{

        return new CREATED({
            message: 'register OK',
            metadata: await accessService.signUp(req.body),
            options: {     // get an example: if we want to add a field in data return:
                limit: 10
            }
        }).send(res);
          //  return res.status(200).json( await accessService.signUp(req.body) );
    }


}


module.exports = new AccessController();