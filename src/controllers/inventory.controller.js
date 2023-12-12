'use strict'

const { CREATED, OK } = require("../core/success.response");
const InventoryService = require('../services/inventory.service');

class InventoryController{

    addStock = async (req, res, next)=>{
        new OK({
            message: 'create inventory product success',
            metadata: await InventoryService.addStockToInventory(req.body)
        }).send(res);
    }

}

module.exports = new InventoryController();