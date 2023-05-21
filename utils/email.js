const nodemailer = require('nodemailer');
require("dotenv").config();
const userEmail = process.env.USEREMAIL;
const emailPass = process.env.PASS;
const service = process.env.SERVICE;

const configOptions = {
	host: 'smtp.gmail.com',
	service: service,
	port: 587,
	secure: false,
	auth: {
		user: userEmail,
		pass: emailPass
	},
	tls: {
		rejectUnauthorized: false
	}
};
const sendMail = async (email, subject, html) => {
	try {
		const transport = nodemailer.createTransport(configOptions);
		const emailStatus = await transport.sendMail({
			from: userEmail,
			to: email,
			subject: subject,
			html: html
		});
        console.log("emailStatus: ", emailStatus);
        return emailStatus;
	} catch (error) {
		console.log('Email not sent');
		console.log(error);
	}
};
module.exports = {
	sendMail
};
