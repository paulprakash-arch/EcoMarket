class ErrorHandler extends Error {
    constructor(message , statusCode){
        super(message)
        this.statusCode = statusCode;
        // this.next = next;
        Error.captureStackTrace(this , ErrorHandler)
    }
}

module.exports = ErrorHandler;