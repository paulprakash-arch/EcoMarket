const catchAsyncError = require('./catchAsyncError');
const ErrorHandler = require('../utis/errorHandler');
const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');

exports.isAuthenticatedUser = catchAsyncError(async (req,res,next) =>{
    const {token} = req.cookies;
 console.log("User token is" , token)
    if(!token){
         return next(new ErrorHandler("Login first to handle this resource" ,401));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return next(new ErrorHandler("User not found", 404));
        }
        next();
    } catch (err) {
        // Handle token verification errors
        return next(new ErrorHandler("Token verification failed", 401));
    }
})

exports.authorizeUser = (...roles) =>{
  return (req,res,next) =>{
         if(!roles.includes(req.user.role)){            //we can access user proerty in req object  
             console.log(`User role is ${req.user.role}`)        
             return next(new ErrorHandler(`Role ${req.user.role} is not allowed` ,401));
             
         }
         next()
     }
 }

