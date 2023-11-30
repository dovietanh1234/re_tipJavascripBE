'use strict'

// THIS has disadvantages: if we dont understand the architechture, we won't able to control it

const { product, clothing, electronic, funiture } = require('../models/product.model');
const { BadRequestError } = require('../core/error.response');
const { findAllDrafts_repo, 
        publishProduct_repo, 
        findAllPublish_repo, 
        turnOffpublishProduct_repo, 
        searchProduct
       } = require('../models/repositories/product.repo');

class ProductFactory{
    // Apply Strategy Pattern in here:
    static productRegistry = {  } // this object contains Key-class

    //STEP 1 create productRegistry's object has key-value (system method's are used to save new child class in variable "productRegistry")
    static registerProductType( type, classRef ){  // key: Electronics, Furniture, Clothing  - value: Clothing class, Electronic class...
        // "type" like "Electronics, Furniture, Clothing" 
        // so each time there is a new module we will add in:
        ProductFactory.productRegistry[type] = classRef; // create key-value for productRegistry object
    }
    // after create productRegistry's object had key-value


    //STEP 2 create Product: ( client's method are used to get the child class from variable "productRegistry" )
     static async createProduct(type, payload){
        const productClass = ProductFactory.productRegistry[type]; // Get the value of productRegistry object through key "type"
        if(!productClass) throw BadRequestError(`invalid product type ${type}`);
        // after we got the value "productClass" -> we initialize an object to perform the next step 
        return new productClass(payload).createProduct();
    }

//CREATE OTHER METHODS WORK WITH PRODUCT MODEL IN FACTORY:

    //POST PUT DELETE GET:
    
    //method 1: PUT( update ) publish a product by a seller:
    static async publishProductByShop({product_shop, product_id}){
        return await publishProduct_repo({ product_shop, product_id });
    }

    //method 2: PUT( update ) turn off publish a product by a seller turn on draft:
    static async turnOffpublishProductByShop({product_shop, product_id}){
        return await turnOffpublishProduct_repo({ product_shop, product_id });
    }



    //QUERY:

    // Method 1: Get a list of the seller's draf:
    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }){
        const query = { product_shop, isDraft: true };
        return await findAllDrafts_repo({query, limit, skip});
    }

    //Method 2: get a list of the seller's publish:
    static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }){
        const query = { product_shop, isPublished: true };
        return await findAllPublish_repo({query, limit, skip});
    }

    //Method 3: query search by publish:
    static async searchProduct({keySearch}){
        console.log('key search: ' + keySearch);
        return await searchProduct({keySearch});
    }


}

class Product{
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

    async createProduct(product_id){
        return await product.create({
            ...this, 
            _id: product_id
        });  
    }
}

class Clothing extends Product{
    async createProduct(){
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        }); 
        if(!newClothing) throw new BadRequestError("clothing create fail! please try again");
        const newProduct = await super.createProduct(newClothing._id);
        if(!newProduct) throw new BadRequestError("Product create fail! please try again");
        return newProduct;
    }
}

class Electronic extends Product{
    async createProduct(){
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        }); 
        if(!newElectronic) throw new BadRequestError("electronic create fail! please try again");
        const newProduct = await super.createProduct(newElectronic._id);
        if(!newProduct) throw new BadRequestError("Product create fail! please try again");
        return newProduct;
    }
}

class Funiture extends Product{
    async createProduct(){
        const newFuniture = await funiture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        }); 
        if(!newFuniture) throw new BadRequestError("funiture create fail! please try again");
        const newProduct = await super.createProduct(newFuniture._id);
        if(!newProduct) throw new BadRequestError("Product create fail! please try again");
        return newProduct;
    }
}

// REGISTER PRODUCT TYPE: ( save data in object "productRegistry" )
ProductFactory.registerProductType("Electronics", Electronic);
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Furniture", Funiture);
// if there is a new product we will add more in here ...


module.exports = ProductFactory;