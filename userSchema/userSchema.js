import mongoose from "mongoose";
import jwt from "jsonwebtoken"

// Define the User schema
const userSchema = new mongoose.Schema({
    name:
     {type: String, 
    required: false},
    email: 
    { type: String,
      required: true },
    password: 
    { type: String, 
      required: true },
    resetToken: String,
    resetTokenExpiration: Date,
  });
  const generateJwtToken=(id)=>{
    return jwt.sign(
        {id},
        'secretkey'
    )
  }
  
  const User = mongoose.model('User', userSchema);
  export {User, generateJwtToken}