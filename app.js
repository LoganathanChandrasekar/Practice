const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const env=require('dotenv'); 
env.config({ path : './config.env' });
const mongoose =require('mongoose')
const app = express();
const Db=process.env.DATABASE

const flash =require('connect-flash')
 const session =require('express-session')
mongoose.connect(Db,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then((conn) => {
    //   console.log(conn);
      console.log('Connected to MongoDB!');
    })
    .catch((err) => {
      console.log('Error connecting to MongoDB:', err);
    });

//bodyparser
app.use(express.urlencoded({extended: false}))
//Express-sessions
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    
}))  
app.use(flash())
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})
app.use(expressLayouts);
app.set('view engine','ejs')
app.use('/users',require('./user'))
app.use('/',require('./index'))
const Port = process.env.PORT||8080;
app.listen(Port,console.log(`Server started on port ${Port}`));