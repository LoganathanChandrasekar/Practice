const express=require('express');
const jwt=require('jsonwebtoken')
const User = require('./UserModel');
const util = require('util')
const sendEmail = require('./email')
const crypto=require('crypto');

const signToken = id =>{
    return jwt.sign({id},process.env.SECRECT_STR,{
        expiresIn:  process.env.LOGIN_EXPIRES
    });
}
//step:1
exports.signup=async (req,res,next)=>{try{
    const newUser= await User.create( req.body);
    const token = signToken(newUser._id);
    const options = {
        maxAge:process.env.LOGIN_EXPIRES,
        httpOnly:true
    }

    res.cookie('jwt',token,options);
    newUser.password=undefined;
    res.status(201).json({
        status:'success',
        token,
        data:{user:newUser}
    })
    
 }
 catch (err) {
        res.status(404).json({
            status: "fail",
            message: err.message
        });
    }
}


exports.login = async (req,res,next)=>{
    try{

    const email =req.body.email;
    const password =req.body.password;

    // const {email, password}=req.body
    //check if user email in the database already
    if(!email || !password){
        const error = new Error('Invalid email and passwords');
        console.log(error.message);
    }
    const user = await User.findOne({ email }).select('+password');

    // const ismatch= await user.comparePasswordDb(password, user.password);
    
    if (!user || !(await user.comparePasswordInDb(password, user.password))) {
        res.status(404).json({
            status: "fail",
            message: "err.message"
        });
    }
    
    const tokene = signToken(user._id);
    res.status(200).json({
        status:'success',
        token:tokene,
    })
 }
 catch (err) {
        res.status(404).json({
            status: "fail",
            message: err.message
        });
    }
}
exports.protect = async(req,res,next)=>{
    /*
        1. Read the token & check if it exist
        2.validate the token
        3.If the user exists
        4.if the user changed password after the token was issued
        5.Allow user to acces route
    */ 
   const testToken =req.headers.authorization;
   let token;
   if(testToken && testToken.startsWith('Bearer')){
         token = testToken.split(' ')[1];
        
    }
    if(!token){
        res.status(401).json({
            status:'fail',
            message:'You are not logged in'
        })
    }
    const decodeedToken = await util.promisify(jwt.verify)(token,process.env.SECRECT_STR)
    console.log("decodeedToken:"+decodeedToken);
   const user= await User.findById(decodeedToken.id)

   if(!user){
    const errorr = new Error('Invalid USER');
    console.log(errorr.message);
   }
   if(await user.isPasswordChanged(decodeedToken.iat)){
          const errorr = new Error('User recently changed password');
          console.log(errorr.message);
   };
   req.user =user;
   next();
}

exports.restrict=(role)=>{
   return(req,res,next)=>{
        if(req.user.role!==role){
            res.status(401).json({
                status:'fail',
                message:'You are not authorized to access this route'
            }) }
    next();
}}
exports.forgotPassword =async(req,res,next)=>{
    /*
        1. Get user based on posted email
        2.Random Rest token
        3.Send the token Back to the user email

    */ 
        const user =await User.findOne({email: req.body.email});
        if(!user){
            return res.status(404).json({
                status:'fail',
                message:'User not found'
            })
        }
    const resetToken=user.createRestToken()
    await user.save({validateBeforeSave:false});
    const resetUrl=`${req.protocol}://${req.get('host')}/users/reset/${resetToken}`
    const message=`You are receiving this email because you (or someone else) has requested a password reset. \n\n
     Please click on the following link to reset your password: 

     ${resetUrl}

     If you did not request this, please ignore this email.`;
     try{
    await sendEmail({
        email:user.email,
        subject:'password change request received',
        message:message  
    })
     res.status(200).json({
        status:'sucess',
        message:'password reset link send to the usr email'
    })}catch(e){
        user.passwordReset=undefined;
        user.passwordResetExp=undefined;
        user.save({validateBeforeSave:false});
        return res.status(500).json({
            status:'fail',
            message:'there was an error sending password'
        })
    }
}
exports.resetPassword =async (req,res,next)=>{
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordReset:token, passwordResetExp:{$gt: Date.now()}})
    if(!user){
        return res.status(404).json({
            status:'fail',
            message:'Invalid token or expired'
        }) 
    }
    user.password =req.body.password;
    user.confirmPassword =req.body.confirmPassword;
    user.passwordReset=undefined;
    user.passwordResetExp=undefined;
    user.passwordChangedAt=Date.now();

    user.save();
    const logintoken = signToken(user._id);
    res.status(201).json({
        status:'success',
        logintoken,
    })
}
