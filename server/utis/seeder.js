const products = require ('../data/products.json');
const Product = require('../Models/productModel');
const dotenv = require('dotenv');
const connectDatabase = require('../config/database');

dotenv.config({path:'server/config/config.env'});
connectDatabase();

const seedProducts = async() =>{
    try{
        await Product.deleteMany();
        console.log("Product deleted");
        await Product.insertMany(products);
        console.log("Product added");
    } catch(e){
        console.log(e);
    }
    process.exit();
}

seedProducts();