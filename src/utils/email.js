const nodemailer = require("nodemailer");
require("dotenv").config();
const USER_EMAIL = process.env.USER_EMAIL;
const EMAIL_PASSWORD = process.env.PASS;
const SERVICE = process.env.SERVICE;

const configOptions = {
  host: "smtp.gmail.com",
  service: SERVICE,
  port: 587,
  secure: false,
  auth: {
    user: USER_EMAIL,
    pass: EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
};
const sendMail = async (email, subject, html) => {
  try {
    const transport = nodemailer.createTransport(configOptions);
    const emailStatus = await transport.sendMail({
      from: USER_EMAIL,
      to: email,
      subject: subject,
      html: html,
    });
    return emailStatus;
  } catch (error) {
    console.log(`Email not sent: ${error}`);
    throw new Error("Could not send email");
  }
};
module.exports = {
  sendMail,
};
