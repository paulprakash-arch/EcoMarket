const Product = require('../Models/productModel');
const ErrorHandler = require('../utis/errorHandler');
const apiFeature = require('../utis/apiFeature');
const catchAsyncError = require('../middleware/catchAsyncError');
const User = require('../Models/userModel');
//API - api/v1/products
exports.getProducts = catchAsyncError(async (req, res, next) => {
    try {
        const resPerPage = 4;
        const user = req.user; // Assuming that req.user contains the data to search for
      
       const loggedUserId = user._id;
      // Check if the user object exists and has the 'address' property
      if (user) {
        const city = user.city;
        console.log( "User city is",city);
  
        // Create a new apiFeature instance with the Product.find() query
        const query = new apiFeature(Product.find(), req.query);
  console.log( "User id" ,user._id);
  console.log(loggedUserId);
 
        if (city) {
          query.query.find({ 'city': city });
        }
        // Exclude products belonging to the logged-in user
        query.query.find({ 'user._id': { $ne: loggedUserId } });

        // Chain search and filter methods
        query.search().filter();
  
        // Filter by 'city' if available
  
        const countQuery = query.query.clone();
        const filterProductsCount = await countQuery.countDocuments({});
        const totalProductsCount = await Product.countDocuments({});
        const productsCount = filterProductsCount !== totalProductsCount ? filterProductsCount : totalProductsCount;
  
        const products = await query.paginate(resPerPage).query;

        res.status(200).json({
          success: true,
          count: productsCount,
          resPerPage,
          products,
        });
      } else {
        // Handle the case where 'user' or 'user.address' is null
        res.status(400).json({
          error: "User information is missing or incomplete",
        });
      }
    } catch (error) {
      console.error("Error in getting products", error);
      next(error);
    }
  });
  
  

//API - to get filtered products may be use
exports.getfilteredProducts =catchAsyncError(async(req,res,next) =>{
    const resPerPage = "5";
    let buildQuery =() =>{
        return new apiFeature(Product.find() , req.query).search().filter();
    }
    const products = await buildQuery().paginate(resPerPage).query;
}
)

//API - api/v1/product/:id
exports.getSingleProduct =async(req,res,next) =>{
    const id = req.params.id;
    const product =await Product.findById(id);

    if(!product){
        return new ErrorHandler("Product not found" , 404 , next)
    }
    res.status(200).json({
        success:true,
        product
    });
}

//API - api/v1/products/new
exports.sellProduct = catchAsyncError(async (req, res, next) => {
    console.log("in server");
        const BASE_URL = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
         const images = [];

        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                let url = `${BASE_URL}/uploads/product/${file.originalname}`;
               req.body.images.push({ image: url });
            });
            req.body.images = images;
        }
            req.body.user = {
                _id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                phoneNumber: req.user.phoneNumber
            };

            const products = await Product.create(req.body);
            res.status(200).json({
                success: true,
                products
            });
         
});


//API - api/v1/products/myads
exports.getmyAds = catchAsyncError(async(req,res,next) =>{
    const ads = await Product.find({'user._id':req.user.id});
    console.log(req.user.id);

    if(ads.length === 0){
        return next(new ErrorHandler("Ads not found"  ,404));
    }
    console.log(ads);

    res.status(200).json({
        success: true,
        ads
    })
})

//API - api/v1/product/update/:id
exports.updateProduct = async(req,res,next) =>{
    let product = await Product.findById(req.params.id);

     //uploading images
  let images = []

  //if images not cleared we keep existing images
  if(req.body.imagesCleared === 'false' ) {
      images = product.images;
  }
  let BASE_URL = process.env.BACKEND_URL;
  if(process.env.NODE_ENV === "production"){
      BASE_URL = `${req.protocol}://${req.get('host')}`
  }

  if(req.files.length > 0) {
      req.files.forEach( file => {
          let url = `${BASE_URL}/uploads/product/${file.originalname}`;
          images.push({ image: url })
      })
  }


  req.body.images = images;
    if(!product){
        return res.status(404).json({
            success :false,
            message : "Product not Found"
        })
    }

    product = await Product.findByIdAndUpdate(req.params.id , req.body,{
        new : true,
        runValidators : true
    })

    res.status(200).json({
        success : true,
        product
    })
}

//API - api/v1/product/delete/:id
exports.deleteProduct = async(req , res , next) =>{
    let product = await Product.findById(req.params.id);

    if(!product){
        return res.status(404).json({
            success : fail,
            message : "Product not found"
        })
    }
    await product.deleteOne();

    res.status(200).json({
        success : true,
        message : "Product Deleted successfully"
    })
}

//API - api/v1/admin/products
exports.adminProducts =catchAsyncError(async(req,res,next) =>{
    const products = await  Product.find();
    const totalProductsCount = await Product.countDocuments({});

    res.status(200).json({
        success:true,
        count : totalProductsCount,
        products
    })
})





