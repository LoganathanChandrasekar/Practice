const express =require('express')
    const router = express.Router();
    const bcrypt = require('bcryptjs');
    //user model
    const flash =require('connect-flash')
    const session =require('express-session')
    const User = require('./model/user');

    router.route('/login')
    .get((req,res)=>res.render('login'));
    router.route('/register')
          .get((req,res)=>res.render('register'))
          .post( (req,res)=>{
            const{name, email, password, password2}=req.body
            let errors =[];
            if(!name ||!email ||!password ||!password2){
                errors.push({msg:'Please fill all fields'})
            }

            if(password!=password2){
                errors.push({msg:'Passwords do not match'})
            }

            if(password.length<8){
                errors.push({msg:'Password should be at least 8 characters'})
            }

            if(errors.length>0){res.render('register',{
                errors,
                name,
                email,
                password,
                password2
            })}
            else{
                User.findOne({email: email}).then(user =>{
                    if(user){
                        errors.push({msg:'Email already exists'})
                        res.render('register',{
                            errors,
                            name,
                            email,
                            password,
                            password2
                        })
                    }else{
                        //user.create
                    const newUser = new User({
                        name,
                        email,
                        password,
                        confirmPassword:password2
                    })
                    
                   
                  
                        newUser.save()
                        .then(user=>{
                            req.flash('success_msg','You are registered and can now log in')
                            res.redirect('/users/login')
                        }).catch(err=>console.log(err))
        
                }
                
                })
            }})
               
    
    module.exports =router