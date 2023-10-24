//npm install -g npm@10.1.0
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const removeExpiredProducts = require('./removeExpiredProducts');
const products = require('./Routes/product');
const auth = require('./Routes/auth');
const fs =require('fs');

const cookieParser = require('cookie-parser');
const path = require('path');
dotenv.config({path:path.join(__dirname ,"config/config.env")});


app.use(express.json({limit:'1000mb'}));
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

// Create the 'uploads' directory if it doesn't exist
// const uploadPath = path.join(__dirname, 'uploads', 'product');
// console.log(uploadPath);
// fs.mkdirSync(uploadPath, { recursive: true });
app.use('/uploads' , express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1' , products);
app.use('/api/v1/auth' , auth);

if(process.env.NODE_ENV='production'){
  app.use (express.static(path.join(__dirname , '../client/build')));
  app.get("*" , (req,res) =>{
    res.sendFile(path.resolve(__dirname , '../client/build/index.html'))
  })
}

app.use((err, req, res, next) => {
    // Handle the error here, e.g., send an error response
    res.status(err.statusCode || 500).json({
      error: err.message || "Internal Server Error"
    })

    if (process.env.NODE_ENV === "development") {
        res.status(err.statusCode).json({
          success: false,
          message: err.message,
          stack: err.stack,
          error: err,
        });
      }
    
      if (process.env.NODE_ENV === "production") {
        let message = err.message;
        let error = new Error(message);
    
        if (err.name === "ValidationError") {
          message = Object.values(err.errors).map((value) => value.message);
          err.statusCode = 400;
        }
    
        if (err.name === "CastError") {
          message = `Resource not Found ${err.path}`;
          err.statusCode = 400;
        }
    
        if (err.code === 11000) {
          message = `Duplicate ${Object.keys(err.keyValue)} error`;
          err.statusCode = 400;
        }
    
        if (err.name === "JSONWebTokenError") {
          message = "JSON web token is invalid. Try again";
          err.statusCode = 400;
        }
        
        if (err.name === "TokenExpiredError") {
          message = "JSON web token is expired. Try again";
          err.statusCode = 400;
        }
    
        res.status(err.statusCode).json({
          success: false,
          message: message || "Internal Server Error",
        })
    }
  });
setInterval(removeExpiredProducts , 24*60*60*1000); //run this function every 24 hours

module.exports = app;