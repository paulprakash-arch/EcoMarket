const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required : [true , "Please enter name"]
    },
    email :{
        type:String,
        required :[true , "Please enter email"],
        unique:true,
        validate : [validator.isEmail , "Please enter valid email"]

    },
    password:{
        type:String,
        required:[true , "Please enter your password"],
        maxlength:[8 , "Password cannot exceed 8 characters"],
        select:false
    },
    avatars: [
        {
            avatar: {
                type: String,
                required: true,
            }
        }
    ],
    role:{
        type :String,
        enum:['admin' , 'user'],
        default :'user'
    },
   
        doorNumber: {
            type: String,
        },
        city: {
            type: String,
            required: [true, "Please enter your city"]
        },
        state: {
            type: String,
            required: [true, "Please enter your state"]
        },
    
    phoneNumber:{
        type:String,
        required:[true , "Please enter your phone number"]
    },
    otp:String,
    otpExpiration :Date,
    resetPasswordToken : String,
    resetPasswordTokenExpire:Date,
    created:{
        type:Date,
        default:Date.now()
    }
})

userSchema.pre('save' , async function(next){
    if(!this.isModified('password')){                                                
        next();
    }
    this.password = await bcrypt.hash(this.password , 10);
})

// const mongoose = require('mongoose');
// const userSchema = new mongoose.Schema({
//     name: String,
//     email: String,
//     // ... other fields
//   });
  
//   // Define an instance method
//   userSchema.methods.sayHello = function () {
//     return `Hello, my name is ${this.name} and my email is ${this.email}.`;
//   };
  
//   const User = mongoose.model('User', userSchema);
  
//   // Create a user document
//   const newUser = new User({
//     name: 'John Doe',
//     email: 'john@example.com',
//   });
  
//   // Call the instance method on the document
//   console.log(newUser.sayHello()); // Output: Hello, my name is John Doe and my email is john@example.com.

userSchema.methods.getJwtToken = function (){
    return jwt.sign({id : this.id} , process.env.JWT_SECRET , {
        expiresIn : process.env.JWT_EXPIRES_TIME                        //sign(payload,secretkey,options)
    })
}

userSchema.methods.isValidPassword = async function(enteredpassword){
    return bcrypt.compare(enteredpassword , this.password)  //bcrypt.compare(password , ouiiouyuy76565354#45^%$#)
}

userSchema.methods.getresetToken =  function() {
    const token = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    this.resetPasswordTokenExpire = Date.now() + 30*60*1000;
    return token;
}

let model = mongoose.model('User' , userSchema);
module.exports = model;
  