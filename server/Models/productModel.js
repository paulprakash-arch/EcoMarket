const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required :[true , "Please enter product name"],
        trim:true,
        maxlength:[100 , "Product name cannot exceed 100 characters"]
    },
    price:{
        type:String,
        default: 0.0,
    },
    description:{
        type:String,
        required:[true , "Please enter product description"]
    },
    expirydate:{
        type:String,
        required:[true , "Please enter expiry date"],
        index:{expireAfterSeconds:0}
    },
    images: [
        {
            image: {
                type: String,
                required: true,
            }
        }
    ],
    
    
       user:{
            _id: mongoose.Schema.Types.ObjectId,
            name :String,
            email:String,
            phoneNumber : String
            
    },

    category:{
        type:String,
        required:[true , "Please enter category"],
        enum:{
            values :[
                'Vegetables',
                'Fruits',
                'DairyProducts',
                'StarchyFood'
            ],
            message: "Please select valid category"
        }
    },
    seller:{
        type:String,
        required:[true , "Please enter Product seller"]
    },
    stock :{
        type:Number,
        required :[true, "Please enter product stock"],
        min: [0, "Stock must be a positive number"],
    },
        doorNumber: {
            type: String,
            required: [true, "Please enter your door number"]
        },
        city: {
            type: String,
            required: [true, "Please enter your city"]
        },
        state: {
            type: String,
            required: [true, "Please enter your state"]
        }
},
{ timestamps: true }
) 
// productSchema.index({expirydate :1} , {expireAfterSeconds:0});
let schema = mongoose.model('Product' , productSchema)
module.exports = schema;