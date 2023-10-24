const Product = require('../Models/productModel');

class apiFeature{

    constructor (query , queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        let keyword = this.queryStr.keyword ? {
            name :{
                $regex:this.queryStr.keyword,
                $options : 'i'
            } 
        } : {};

        this.query.find({...keyword});
        return this; 
    }

    filter() {
        const queryStrCopy = {...this.queryStr};

        const removeFields = ['keyword', 'limit', 'page'];
        removeFields.forEach(field => delete queryStrCopy[field]);
      
        // Convert the modified queryStrCopy into a JSON string
        let queryStr = JSON.stringify(queryStrCopy);
      
        // Replace the specified operators with MongoDB operators
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
      
        // Parse the JSON string back into a JavaScript object
        const filterObject = JSON.parse(queryStr);
      
        // Apply the filter to the query
        this.query = this.query.find(filterObject);
      
        // Return the modified query object
        return this;
    }s

    paginate(resPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage -1)
        this.query.limit(resPerPage).skip(skip);
        return this;
    }    

    
}


module.exports = apiFeature;