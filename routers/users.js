import express from "express"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import { User, generateJwtToken} from "../userSchema/userSchema.js";
import sendMail from "../middlewares/mail.js";
import crypto from 'crypto'


const router = express.Router();
//user Signin
router.post("/signup",async(req, res)=>{
    try {
        
        let user = await User.findOne({email:req.body.email})
        if(user) return res.status(400).json({data:"Given email already exist"})

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            // const hashUser = await {...req.body, password:hashedPassword}
             user = await new User({
                name : req.body.name,
                email : req.body.email,
                password : hashedPassword  
            }).save()

            const token = generateJwtToken(user._id)
            res.status(200).json({ 
            user,
            message:"succesfully signed in",
            token:token
            });           
        
        
    } catch (error) {
        console.log(error)
        res.status(500).json({data:"Internal Server error"})
    }
})

//users Login
router.post("/login", async(req, res)=>{
    try {
        //is user eamil valid
        const user = await User.findOne({email:req.body.email})
        if(!user){
            return res.status(400).json({data:"Invalid User Email or Password"})
        }
        //is user password valid
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        )
        if(!validPassword){
            return res.status(400).json({data:"Invalid User Email or Password"})
        }

        const token = generateJwtToken(user._id)
        res.status(200).json({
            user,
            message:"succesfully logged in",
            token:token
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({data:"Internal Server error"})
    }
});

// Route for the forget password page
router.post('/forgot/password', async (req, res) => {
    const { email } = req.body;
  
    try {
      // Check if the user exists in the database
      const user = await User.findOne({email})
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Generate a random token for password reset
      const resetToken = user.getResetToken();
      await user.save()
      //Create reset url
      const resetUrl = ` http://localhost:3000/reset/password/${resetToken}`;

      const message = `Your password reset url is as follows \n\n 
      ${resetUrl} \n\n If you have not requested this email, then ignore it.`;

      // Save the reset token in the database
      await user.save();
      sendMail({ 
        email: user.email,
        subject: "Password Recovery",
        message
      })
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email}`
    })
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


// Route for password reset & updating the password
router.post('/reset/password/:token', async (req, res) => {
  const resetPasswordToken = req.params.token
  console.log(resetPasswordToken)
    try {
      // Find the user with the matching reset token
      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(404).json({ error: 'Invalid or expired token' });
      }
      
      if( req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match'));
      }
      // Hash the new password
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
  
      // Update the user's password and clear the reset token
      user.password = hashedPassword; 
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpire = undefined;
  
      // Save the updated user in the database
      await user.save(); 
      const token = generateJwtToken(user._id)
        res.status(200).json({
            user,
            message:" password reset succesful",
            token:token
        })
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

export const userRouter = router