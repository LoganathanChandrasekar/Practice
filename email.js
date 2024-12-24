const nodemailer = require('nodemailer');
const sendEmail = async(option)=>{
/*
       create at ransporter
    */ 
   const transporter = nodemailer.createTransport({
        host: process.env.EMALL_HOST,
        port:process.env.EMALL_PORT,
        // secure:false,
        auth:{
            user:process.env.EMALL_USER,
            pass:process.env.EMALL_PASSWORD 
        }
   })
   const emailOptions ={
    from:'Suppot-Admin<support@it.com>',
    to:option.email,
    subject:option.subject,
    text:option.message
}
await transporter.sendMail(emailOptions)
}

module.exports = sendEmail;