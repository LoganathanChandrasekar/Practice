const express=require('express')
let app=express();
app.use(express.json());
const User=require('../model/user');
exports.createUser= async (req,res)=>{
    try{
        const createi= await User.create(req.body);
        res.status(201).json({
            status:'success',
            data:{user:createi}
        }); 
    }catch(err){ 
        res.status(404).json({
        status:"fail",
        message:err.message
    })};
}
