import nodemailer from "nodemailer"

const sendMail = async options =>{
    
      // Send the password reset link to the user's email
      const transporter = nodemailer.createTransport({
        // Configure your email provider here
        service: 'gmail',
        auth: {
          user: 'prasathvj17@gmail.com',
          pass: 'muwebjswafsbmjjq',
        },
      });
      const mailOptions = {
        from: 'prasathvj17@gmail.com',
        to: options.email,
        subject: 'Password Reset',
        text: options.message
      };
      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ error: 'Failed to send email' });
        }
        return res.status(200).json({ message: 'Email sent successfully' });
      });
}

export default sendMail;