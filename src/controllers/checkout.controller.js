'use strict'

const { CREATED, OK } = require("../core/success.response");
const checkoutService = require('../services/checkout.service');

class checkoutController{

    checkout = async (req, res, next)=>{
        new OK({
            message: 'checkout success',
            metadata: await checkoutService.checkOutReview(req.body)
        }).send(res);
    }

}

module.exports = new checkoutController();