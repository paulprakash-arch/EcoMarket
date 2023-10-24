const express = require("express");
const path = require("path");
const multer = require('multer');
const router = express.Router();
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads/product');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });


const { getProducts, getSingleProduct, sellProduct, updateProduct, deleteProduct, adminProducts, getmyAds } = require("../Controllers/productController");
const { isAuthenticatedUser } = require("../middleware/authenticate");

router.route('/products').get( isAuthenticatedUser, getProducts);             
router.route('/product/:id').get( isAuthenticatedUser, getSingleProduct);
router.route('/products/myads').get( isAuthenticatedUser , getmyAds);
//Admin Routes
router.route('/admin/products').get(adminProducts);
router.route('/products/new').post( isAuthenticatedUser,upload.array('images'), sellProduct);
router.route('/product/update/:id').put( isAuthenticatedUser,upload.array('images'), updateProduct);
router.route('/product/delete/:id').delete( isAuthenticatedUser,deleteProduct);
module.exports = router;