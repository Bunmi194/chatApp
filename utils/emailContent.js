require("dotenv").config();
const CLIENTURL = process.env.CLIENTURL;
const emailContentFunction = (appName, token) => {
  return `<!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${appName}</title>
    <style>
      /* CSS styles for the email */
      body {
        font-family: Arial, sans-serif;
        background-color: #f2f2f2;
        margin: 0;
        padding: 0;
      }
      
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      
      .logo {
        max-width: 150px;
      }
      
      .content {
        margin-bottom: 30px;
      }
      
      .button {
        display: inline-block;
        background-color: #007bff;
        color: #ffffff !important;
        padding: 12px 20px;
        text-decoration: none;
        border-radius: 4px;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://res.cloudinary.com/dsc6pgrgv/image/upload/v1684321877/send-mail_f50vp9.png" alt="Chat App Logo" class="logo">
      </div>
      <div class="content">
        <h2>Welcome to ${appName}!</h2>
        <p>Thank you for signing up. Please click the button below to verify your account and get started.</p>
        <p><a href="`+CLIENTURL+`/verify/?token=${token}" class="button">Verify Account</a></p>
      </div>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Best regards,<br>${appName} Team</p>
    </div>
  </body>
  </html>
  `
}
module.exports = {
  emailContentFunction
}
