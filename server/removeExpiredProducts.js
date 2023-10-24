const mongoose = require('mongoose');
const Product = require('./Models/productModel');

async function removeExpiredProducts () {
    try{
        const currentDate = new Date();

        const expiredProducts = await Product.find({expirydate : {$lt: currentDate}});

        for(const product of expiredProducts){
            await product.remove();
            console.log(`Removed expired product : ${product.name}`);
        }
    } catch (err){
        console.log("Error removing expired products :" ,err)
    }
}

module.exports = removeExpiredProducts;