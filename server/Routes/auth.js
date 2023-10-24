const express = require('express');
const multer = require('multer');
const path = require('path');

const upload = multer({storage:multer.diskStorage({
    destination :function(req,file,cb){
        cb(null,path.join(__dirname ,'..',`uploads/user`))
    },
    filename:function(req,file,cb){
        cb(null , file.originalname)
    }
})})




const { registration, loginUser, logout, generateotp, getUserProfile, updateProfile, updateUser, getUser, getAllUsers, deleteUser } = require('../Controllers/authControllers');
const { isAuthenticatedUser, authorizeUser } = require('../middleware/authenticate');

const router = express.Router();
router.route('/generateotp').post(generateotp);
router.route('/register').post(upload.single('avatar'),registration);
router.route('/login').post(loginUser);
router.route('/logout').get(logout);
router.route('/myprofile').get(isAuthenticatedUser,  getUserProfile);
router.route('/updateprofile').put( isAuthenticatedUser,upload.single('avatar'), updateProfile);

//Admin
router.route('/admin/users').get(isAuthenticatedUser , authorizeUser('admin'), getAllUsers); 
router.route('/admin/user/:id').get(isAuthenticatedUser , authorizeUser('admin'), getUser); 
router.route('/admin/user/:id').put(isAuthenticatedUser , authorizeUser('admin'), updateUser); 
router.route('/admin/user/:id').delete(isAuthenticatedUser , authorizeUser('admin'), deleteUser); 
module.exports = router;