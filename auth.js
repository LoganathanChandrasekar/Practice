const express=require('express');
const authRouter=require('./authRouter');
const Router=express.Router();
Router.route('/signup').post(authRouter.signup);
Router.route('/login').post(authRouter.login);
Router.route('/forgot').post(authRouter.forgotPassword);
Router.route('/reset/:token').patch(authRouter.resetPassword);

module.exports=Router;