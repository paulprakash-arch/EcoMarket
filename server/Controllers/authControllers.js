const User = require('../Models/userModel');
const errorHandler = require('../utis/errorHandler');
const catchAsyncError = require('../middleware/catchAsyncError');
const sendToken = require('../utis/jwt');
const ErrorHandler = require('../utis/errorHandler');
const accountSid = "AC1f6babd792d27ce93b855a4c3c1179e9";
const authToken = "f4d24da64a15e6ed6cdbbb6ba7564564";
const verifySid = "VA10f03ac8987cbb2157c9525286895c18"; // Create a Verify Service in Twilio

const client = require("twilio")(accountSid, authToken);

const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
}
// Function to generate OTP
exports.generateotp = catchAsyncError(async(req,res,next) =>{
  const {phoneNumber} = req.body;

    const otp = generateOtp();
        console.log(otp);
        // Send OTP to the user's phone number
        await client.verify.v2.services(verifySid)
        .verifications.create({ to: phoneNumber, channel: "sms" });

         // Prompt the user to enter the OTP
         res.status(200).json({
            success: true,
            message: "OTP generated and sent to your phone number. Please enter the OTP to complete registration."
        });        
});

exports.registration = catchAsyncError(async (req, res, next) => {
  const { name, email, password, city,state,phoneNumber,otp } = req.body;
  const enteredotp = otp;
    try{
        const verification_check = await client.verify.v2.services(verifySid)
             .verificationChecks.create({ to: phoneNumber, code: enteredotp });
    
             if (verification_check.status !== "approved") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid OTP. Please enter a valid OTP.",
                    twilioError: verification_check.error,
                });
        }
    // const { name, email, password, city,state,phoneNumber } = req.body;
     
    const BASE_URL = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
         const images = [];

        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                let url = `${BASE_URL}/uploads/product/${file.originalname}`;
               req.body.images.push({ image: url });
            });
            req.body.images = images;
        }
 
        // OTP is valid, continue with user registration
        const user = await User.create(
          // name,
          // email,
          // password,
          //     city,
          //     state,
          // phoneNumber,
          // avatar,
          req.body
      );

        sendToken(user, 201, res);
        console.log("Register successfully");
    } catch (err) {
        console.log("Error in registering ser:", err);
        return res.status(500).json({
            success: false,
            message: "Error in registering the user"
        });
    }
});


//API - api/v1/auth/login
exports.loginUser = catchAsyncError(async(req,res,next) =>{
    const {email,password} = req.body;
    console.log("Login request recieved" , email);
    if(!email ||!password){
      console.log("Invalid request");
        return next(new ErrorHandler("Please enter email or password" , 400));
    }
    const user = await User.findOne({email}).select('+password');
    // console.log('User found from login' , user)
    if(!user ||!(await user.isValidPassword(password))){
      console.log("Invalid email or password", user ? user.email : 'User not found');
      return next(new ErrorHandler("Invalid email or password" , 400 ));
    }
console.log("Login successfully");
    sendToken(user ,201,res);
});

//API -api/v1/auth/logout
exports.logout = (req,res,next) =>{
    res.cookie('token' , null, {
        expires :new Date(Date.now()),
        httpOnly:true
    }).status(200).json({
        success:true,
        message:"Logout successfully"
    })
    console.log("Logout successfully");
};

//Get user profile
exports.getUserProfile = catchAsyncError(async (req,res,next) =>{
    const user =await User.findById(req.user.id);          //req.user is in authenticate.js oru flow va varuthu anga irunthu inga
    res.status(200).json({
     success:true,
     user
    })                               
   });

//Update user profile
exports.updateProfile =catchAsyncError(async(req,res,next) =>{
  try{
    let newData ={
        name  : req.body.name,
        email  : req.body.email,
          city : req.body.city,
        state : req.body.state
        
    }
    console.log( "NEWDATA ", newData);
    let avatar;
  let BASE_URL = process.env.BACKEND_URL;
if(process.env.NODE_ENV ==='production'){
  BASE_URL = `${req.protocol}://${req.get('host')}`
}
  if(req.file){
    avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`
    newUserData ={...newUserData,avatar}
  }
    const user = await User.findByIdAndUpdate(req.user.id ,newData,{
        new :true,
        runValidators:true,
    });

    if (!user) {
      // Handle the case where the user is not found
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json({
        success:true,
        user,
        message:"Profile updated successfully"
    })
  } catch(error){
    // Handle other potential errors, such as validation errors or database issues
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
})

//Admin get user
exports.getUser=catchAsyncError(async(req,res,next) =>{
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`There is no such user with this ${req.params.id}` , 401));
      }
    res.status(200).json({
        success:true,
        user
    })
})
//Admin Update user
exports.updateUser =  catchAsyncError(async(req,res,next) =>{
    const newUserData = {
      name:req.body.name,
      email:req.body.email,
      role:req.body.role
    }
   const user = await User.findByIdAndUpdate(req.params.id , newUserData,{
      new:true,
      runValidators:true,
    })
  
    res.status(200).json({
      success:true,
      user
    })
  })
  
  //Admin deleteuser
  exports.deleteUser =catchAsyncError(async(req,res,next) =>{
    const user = await User.findById(req.params.id);
    if(!user){
      return next(new ErrorHandler(`There is no such user with this ${req.params.id}` , 401));
    }
    await user.deleteOne();
    res.status(200).json({
      success:true,
      message: "User is deleted"
    })
  });

  //Admin get all users
exports.getAllUsers = catchAsyncError(async(req,res,next) =>{
    const users = await User.find();
    res.status(200).json({
      success:true,
      users
    })
  })



