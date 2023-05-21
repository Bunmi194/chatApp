const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const appName = process.env.APP_NAME;
const saltRounds = process.env.SALT_ROUNDS;
const jwtSecret = process.env.JWT_SECRET;
const bcrypt = require("bcrypt");
const { registerUserZod, loginUserZod } = require("../auth/user");
const {
  saveUserToDatabase,
  fetchUserFromDatabase,
  fetchAllUsers,
  fetchUserFromDatabaseAndUpdate,
} = require("../controllers/users");
const { sendMail } = require("../utils/email");
const { emailContentFunction } = require("../utils/emailContent");
console.log("jwtSecret: ", jwtSecret);
console.log("appName: ", appName);
const route = express.Router();

route.post("/register", async (req, res) => {
  //validate input
  const error = registerUserZod.safeParse(req.body);
  //check if the user is already registered
  const { email, password, confirmPassword, firstName, lastName } = req.body;
  try {
    if (error.success === false) {
      return res.status(400).send({
        success: false,
        message: error.error.issues[0].message,
      });
    }
    if(password !== confirmPassword){
      return res.status(403).json({
        message: "Passwords do not match",
      });
    }
    const userExists = await fetchUserFromDatabase(email);
    if (userExists.length) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    //register the user
    const salt = await bcrypt.genSalt(Number(saltRounds));
    console.log("salt: ", salt);
    const encryptedPassword = await bcrypt.hash(password, salt);
    const user = {
      firstName,
      lastName,
      email,
      password: encryptedPassword,
    };
    //send verification email to registered user
    const subject = `${appName} Email Verification`;
    const token = jwt.sign(
      {
        email,
      },
      jwtSecret
    );
    const emailContent = emailContentFunction(appName, token);
    const sendVerificationEmail = await sendMail(email, subject, emailContent);
    //send status
    if (sendVerificationEmail) {
      const registerUser = await saveUserToDatabase(user);
      if (!registerUser) {
        return res.status(500).json({
          message: "Internal Server Error",
        });
      }
      return res.status(201).json({
        message: "Registration Successful",
        token,
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
    });
  } catch (e) {
    console.log("Error: ", e);
    return res.status(403).json({
      status: "failed",
      message: "Bad Request",
    });
  }
});

route.post("/login", async (req, res) => {
  //validate input
  const error = loginUserZod.safeParse(req.body);
  //check if the user exists
  const { email, password } = req.body;
  try {
    if (error.success === false) {
      return res.status(400).send({
        success: false,
        message: error.error.issues[0].message,
      });
    }
    const userExists = await fetchUserFromDatabase(email);
    if (!userExists[0]) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }
    const userId = userExists[0]._id;
    const authenticateUser = await bcrypt.compare(
      password,
      userExists[0].password
    );
    if (!userExists[0].isVerified) {
      return res.status(401).json({
        status: "401 Unauthorized",
        message: "Please verify your email",
      });
    }
    //authenticate the user
    if (!authenticateUser) {
      return res.status(403).json({
        message: "Invalid email or password",
      });
    }
    //send status
    const token = jwt.sign(
      {
        email,
        userId,
      },
      jwtSecret,
      { expiresIn: "24h" }
    );
    return res.status(200).json({
      status: 'success',
      message: "Login successful",
      token,
      userExists,
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(403).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
});

route.get("/verify/:token", async (req, res) => {
  //validate
  const token = req.params.token;
  try {
    const userEmail = jwt.verify(token, jwtSecret);
    const userExists = await fetchUserFromDatabase(userEmail.email);
    if (!token || typeof token !== "string" || !userExists[0]._id) {
      return res.status(403).json({
        status: "failed",
        message: "No valid token",
      });
    }
    //update record
    const updatedRecord = await fetchUserFromDatabaseAndUpdate(
      userExists[0]._id,
      {
        isVerified: true,
      }
    );
    if (!updatedRecord) {
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "User verified",
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(403).json({
      status: "failed",
      message: "Bad Request",
    });
  }
});
//modify to check for token
route.post("/search", async (req, res) => {
  try {
    const { email, id } = req.body;
    if (!email && !id) {
      return res.status(400).json({
        message: "Invalid email or id",
      });
    }
    let user;
    if(email){
      if(typeof email !== "string"){
        return res.status(400).json({
          message: "Invalid email",
        });
      }
      user = await fetchUserFromDatabase(email);
    }
    if(id){
      if(typeof id !== "string"){
        return res.status(400).json({
          message: "Invalid user id",
        });
      }
      user = await fetchUserFromDatabase(id);
    }
    console.log("user: ", user);
    if (!user[0]) {
      return res.status(404).json({
        message: "No such user",
      });
    }
    return res.status(200).json({
      status: "success",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
});
const usersRoute = route;
module.exports = usersRoute;
