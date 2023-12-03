'use strict'

// THIS has disadvantages: if we dont understand the architechture, we won't able to control it

const { product, clothing, electronic, funiture } = require('../models/product.model');
const { BadRequestError } = require('../core/error.response');
const { findAllDrafts_repo, 
        publishProduct_repo, 
        findAllPublish_repo, 
        turnOffpublishProduct_repo, 
        searchProduct,
        findAllProducts,
        findProductDetail,
        updateProductById,
        findProductDetail_follow_field,
       } = require('../models/repositories/product.repo');
const { removeUndefineObject, upadateNestedObjectParser } = require('../utils');
const { insertInventory } = require('../models/repositories/inventory.repo');


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
        return new productClass(payload).createProduct(); // new Clothing({ payloads }).createProduct()
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

    //Method 3: update PRODUCT PATCH:
    static async updateProduct({productId, payload}){

        const data = await findProductDetail_follow_field({product_id: productId, select: ['product_type'] });
        const productClass = ProductFactory.productRegistry[data.product_type]; // Get the value of productRegistry object through key "type"
        if(!productClass) throw BadRequestError(`invalid product type ${data.product_type}`);

        return new productClass(payload).UpdateProduct_class(productId);
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
        return await searchProduct({keySearch});
    }

    //Method 4: select * from products:
    static async findAllProducts({ limit = 50, sort = 'ctime', page = 1, filter = {isPublished: true} }){ //sorting "ctime" sort flow newest time
        return await findAllProducts({limit, sort, page, filter, select: [ 'product_name', 'product_price', 'product_thumb' ]})
    }

    //Method 5: select detail product:
    static async findProductDetail({product_id}){
        return await findProductDetail({product_id, unSelect: ['__v']}); // if we dont want to get some fields jusst put in there likes: unSelect: ['__v', 'product_shop']
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
        const newProduct =  await product.create({
            ...this, 
            _id: product_id
        });  

        if(newProduct){
            insertInventory({
                productId: product_id, 
                shopId: this.product_shop, 
                stock: this.product_quantity
            })
            return newProduct;
        }
        return false;

    }

    // update product:
    async updateProduct_pc(productId, payload){
        //productId: productId, payload: objectParams, model: product
        return await updateProductById({ productId, payload, model: product });
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

    //UPDATE Put product:
    async UpdateProduct_class( productId ){
        //1: remove null or undefine fields ...
        //2: check where will we update:
        //3: if we dont find the value want to update -> we just alter parent product ( go alter child product first -> parent product )
        
      const updateNest = upadateNestedObjectParser(this)
        const objectParams = removeUndefineObject(updateNest);


        // const { product_attributes, ...object_2  } = objectParams;
        // console.log("dữ liệu mới nè! " + JSON.stringify(product_attributes) + "dữ liệu mưới tiếp nè: " + JSON.stringify(object_2));


        if(this.product_attributes){
            // update child first:
            await updateProductById({ productId: productId, payload: objectParams, model: clothing });
        }

        const updateProduct = await super.updateProduct_pc(productId, objectParams);
        return updateProduct;
    }
}



class Electronic extends Product{
    async createProduct(){
        const newClothing = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        }); 
        if(!newClothing) throw new BadRequestError("clothing create fail! please try again");
        const newProduct = await super.createProduct(newClothing._id);
        
        if(!newProduct) throw new BadRequestError("Product create fail! please try again");
        return newProduct;
    }

    async UpdateProduct_class( productId ){
      const updateNest = upadateNestedObjectParser(this)
        const objectParams = removeUndefineObject(updateNest);
        if(this.product_attributes){
            await updateProductById({ productId: productId, payload: objectParams, model: electronic });
        }
        const updateProduct = await super.updateProduct_pc(productId, objectParams);
        return updateProduct;
    }
}

class Funiture extends Product{
    async createProduct(){
        const newClothing = await funiture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        }); 
        if(!newClothing) throw new BadRequestError("clothing create fail! please try again");
        const newProduct = await super.createProduct(newClothing._id);
        
        if(!newProduct) throw new BadRequestError("Product create fail! please try again");
        return newProduct;
    }

    async UpdateProduct_class( productId ){
      const updateNest = upadateNestedObjectParser(this)
        const objectParams = removeUndefineObject(updateNest);
        if(this.product_attributes){
            // update child first:
            await updateProductById({ productId: productId, payload: objectParams, model: funiture });
        }

        const updateProduct = await super.updateProduct_pc(productId, objectParams);
        return updateProduct;
    }
}

// REGISTER PRODUCT TYPE: ( save data in object "productRegistry" )
ProductFactory.registerProductType("Electronics", Electronic);
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Furniture", Funiture);
// if there is a new product we will add more in here ...


module.exports = ProductFactory;