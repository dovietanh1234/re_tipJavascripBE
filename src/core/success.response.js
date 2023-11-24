'use strict'

const statusCode1 = {
    OK: 200,
    DELETESUCCESS: 204,
    CREATESUCCESS: 201,
    ACCEPTED: 202
}

const reasonStatusCode1 = {
    OK: "success",
    DELETESUCCESS: "delete success",
    CREATESUCCESS: "create success",
    ACCEPTED: "your request is accepted"
}

class SuccessResponse {
    
    constructor({message, statusCode = 201, reasonStatusCode = reasonStatusCode1.OK, metadata = {}}){
        this.message = !message ? reasonStatusCode : message,
        this.status = statusCode,
        this.metadata = metadata 
    }

    // write a func in class:
    send(res, headers = {}){
        return res.status(this.status).json(this);
    }
}

class OK extends SuccessResponse{
    constructor({message, metadata}){
        super({message, metadata})
    }
}

class CREATED extends SuccessResponse{
    constructor({message, statusCode = 201, reasonStatusCode = reasonStatusCode1.CREATESUCCESS ,metadata, options = {}}){
        super({message, statusCode, reasonStatusCode,metadata});
        this.options = options;
    }
}

module.exports = {
    OK,
    CREATED
}