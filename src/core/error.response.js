'use strict'

// self-define errors for the application:
const statusCode = {
    BADREQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOTFOUND: 404,
    METHODNOTALLOW: 405,
    CONFLICT: 409,
    SERVERERROR: 500,
    NOTIMPLEMENTED: 501,
    SERVICEUNVAILABLE:503
}

const reasonStatusCode = {
    BADREQUEST: 'your request is decline',
    UNAUTHORIZED: 'you are not login ',
    FORBIDDEN: 'your request get forbid by server',
    NOTFOUND: 'not found data',
    METHODNOTALLOW: 'this method is not support on website',
    CONFLICT: 'conflict error happen',
    SERVERERROR: 'server error pls try again',
    NOTIMPLEMENTED: 'server is not support this HTTP method',
    SERVICEUNVAILABLE:'error server'
}

// inherit class error:
class ErrorResponse extends Error{
    constructor(message, status){
        super(message),
        this.status = status
    }
}

// inherit class ErrorResponse -> to handle my error:
class conflictRequestError extends ErrorResponse{
    constructor( message = reasonStatusCode.CONFLICT, statusCode = 409 ){
        super(message, statusCode);
    }
}

class NotFoundError extends ErrorResponse{
    constructor( message = reasonStatusCode.NOTFOUND, statusCode = 404 ){
        super(message, statusCode);
    }
}


class BadRequestError extends ErrorResponse{
    constructor( message = reasonStatusCode.BADREQUEST, statusCode = 400 ){
        super(message, statusCode);
    }
}

class unAuthorizedError extends ErrorResponse{
    constructor( message = reasonStatusCode.UNAUTHORIZED, statusCode = 401 ){
        super(message, statusCode);
    }
}

class forbidError extends ErrorResponse{
    constructor( message = reasonStatusCode.FORBIDDEN, statusCode = 403 ){
        super(message, statusCode);
    }
}


// export any error if we need like( conflict, not found ... ):
module.exports = {
    conflictRequestError,
    NotFoundError,
    BadRequestError,
    unAuthorizedError,
    forbidError
}
