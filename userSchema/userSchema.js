import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'

// Define the User schema
const userSchema = new mongoose.Schema({
  name : {
      type: String,
      required: [true, 'Please enter name']
  },
  email:{
      type: String,
      required: [true, 'Please enter email'],
      unique: true,
      
  },
  password: {
      type: String,
      required: [true, 'Please enter password'],
  },
  role :{
      type: String,
      default: 'user'
  },
  resetPasswordToken: String,
  resetPasswordTokenExpire: Date,
  createdAt :{
      type: Date,
      default: Date.now
  }
})
  const generateJwtToken=(id)=>{
    return jwt.sign(
        {id},
        'secretkey'
    )
  }
  
  const User = mongoose.model('User', userSchema);
  export {User, generateJwtToken}