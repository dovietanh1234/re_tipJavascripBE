'use strict'

const { product, clothing, electronic, funiture } = require('../models/product.model');
const { BadRequestError } = require('../core/error.response');

// our mission is: write a design pattern ( like videos has been leanerd before factory pattern )

// STEP 1: Define a factory class to create Product:  
class ProductFactory{
    /* 
    we will classify by word: "type"( clothing, furniture, electornic ) 
    "payload" contains our product's data
    */

    // use static method for easy use:
    // create a func to create Product:
    static async createProduct(type, payload){

        // use swich to handle "type":
        switch(type){
            case 'Electronic':
                return new Electronic(payload).createProduct(); 
            case 'Clothing':
                return new Clothing(payload).createProduct();
            case 'Furniture':
                return new Funiture(payload).createProduct();
            default: 
                throw new BadRequestError(`invalid product type ${type}`);
        }

    }
}

//STEP 2: Create parent Product class:
class Product{
    // constructor -> will contain common parameters like: (name, thumb, quantity ... )
    constructor({ 
        product_name, 
        product_thumb, 
        product_description,
        product_price,
        product_quantity,
        product_type,
        product_shop,
        product_attributes
     }){
        this.product_name = product_name,
        this.product_thumb = product_thumb,
        this.product_description = product_description,
        this.product_price = product_price,
        this.product_quantity = product_quantity,
        this.product_type = product_type,
        this.product_shop = product_shop,
        this.product_attributes = product_attributes
    }

    // create new Product:
    async createProduct(){
        return await product.create(this);  // create "this" above parameters in constructor!
    }
}


//STEP 3: define pre-class! child class extends from parent class above( like: clothing class extends Product, electronic class extends Product...  )
class Clothing extends Product{
    // there we only inherit by key word super() -> and not to write again properties ... 

    // override method:
    async createProduct(){

        //firstly we will save newClothing ( create child Class atribute first ) :
        const newClothing = await clothing.create(this.product_attributes); //"Schema.Types.Mixed" in model
        if(!newClothing) throw new BadRequestError("clothing create fail! please try again");

        //secondly we create parent class Product  ( create Parent Class atribute after ):
        //Bcs we inherit Product class | parent Product class symbolize by keyword "super()" -> help us avoid duplicate code!
        const newProduct = await super.createProduct();
        if(!newProduct) throw new BadRequestError("Product create fail! please try again");

        //thirdly return a parent Product class is filfull (object)
        return newProduct;
    }
}

// imitate class clothing to create class electronic:
class Electronic extends Product{
    // there we only inherit by key word super() -> and not to write again properties ... 

    // override method:
    async createProduct(){

        //firstly we will save newClothing ( create child Class atribute first ) :
        const newElectronic = await electronic.create(this.product_attributes); //"Schema.Types.Mixed" in model
        if(!newElectronic) throw new BadRequestError("electronic create fail! please try again");

        //secondly we create parent class Product  ( create Parent Class atribute after ):
        //Bcs we inherit Product class | parent Product class symbolize by keyword "super()" -> help us avoid duplicate code!
        const newProduct = await super.createProduct();
        if(!newProduct) throw new BadRequestError("Product create fail! please try again");

        //thirdly return a parent Product class is filfull (object)
        return newProduct;
    }
}


// imitate class electonic to create class furniture:
class Funiture extends Product{
    // there we only inherit by key word super() -> and not to write again properties ... 

    // override method:
    async createProduct(){

        //firstly we will save newClothing ( create child Class atribute first ) :
        const newFuniture = await funiture.create(this.product_attributes); //"Schema.Types.Mixed" in model
        if(!newFuniture) throw new BadRequestError("funiture create fail! please try again");

        //secondly we create parent class Product  ( create Parent Class atribute after ):
        //Bcs we inherit Product class | parent Product class symbolize by keyword "super()" -> help us avoid duplicate code!
        const newProduct = await super.createProduct();
        if(!newProduct) throw new BadRequestError("Product create fail! please try again");

        //thirdly return a parent Product class is filfull (object)
        return newProduct;
    }
}


module.exports = ProductFactory;