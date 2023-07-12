import express from "express"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import { User, generateJwtToken} from "../userSchema/userSchema.js";
import sendMail from "../controllers/mail.js";


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
        console.log(user)
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
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
  
    try {
      // Check if the user exists in the database
      const user = await User.findOne({email})
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Generate a random token for password reset
      const resetToken = Math.random().toString(36).substring(7);
      user.resetToken = resetToken;
      user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
      //Create reset url
      const resetUrl = ` http://localhost:3000/password/reset/${resetToken}`;

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

// Route for the password reset form
router.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
  
    try {
      // Find the user with the matching reset token
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(404).json({ error: 'Invalid or expired token' });
      }
  
      // Render the password reset form
      res.send(`
        <form action="/reset-password/${token}" method="post">
          <input type="password" name="password" placeholder="New Password" required>
          <button type="submit">Reset Password</button>
        </form>
      `);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


// Route for updating the password
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
  
    try {
      // Find the user with the matching reset token
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(404).json({ error: 'Invalid or expired token' });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Update the user's password and clear the reset token
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
  
      // Save the updated user in the database
      await user.save();
  
      return res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

export const userRouter = router