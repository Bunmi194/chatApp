const express = require('express');
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
require("dotenv").config();
const { registerUserZod, loginUserZod, verifyToken, verifyEmailOrId } = require("./user-auth");
const { fetchUserFromDatabase, saveUserToDatabase, fetchUserFromDatabaseAndUpdate } = require("./user-service");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = process.env.SALT_ROUNDS;
const APP_NAME = process.env.APP_NAME;
const JWT_SECRET = process.env.JWT_SECRET;
console.log("ENV: ", JWT_SECRET, APP_NAME, SALT_ROUNDS)
const { sendMail } = require("../utils/email");
const { emailContentFunction } = require("../utils/emailContent");

const validateInput = (req, res, next) => {
    try {
        //validate input
        const error = registerUserZod.safeParse(req.body);
        if (error.success === false) {
          return res.status(StatusCodes.BAD_REQUEST).send({
            success: false,
            message: error.error.issues[0].message,
          });
        }
        return next();
    }catch (error){
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
};

const validateInputLogin = (req, res, next) => {
    try {
        console.log("VALIDATE")
        //validate input
        const error = loginUserZod.safeParse(req.body);
        if (error.success === false) {
          return res.status(StatusCodes.BAD_REQUEST).send({
            success: false,
            message: error.error.issues[0].message,
          });
        }
        return next();
    }catch (error){
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
};

const validateInputToken = (req, res, next) => {
    try {
        //validate input
        const error = verifyToken.safeParse(req.params);
        if (error.success === false) {
          return res.status(StatusCodes.BAD_REQUEST).send({
            success: false,
            message: error.error.issues[0].message,
          });
        }
        return next();
    }catch (error){
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
};

const validateInputEmailOrId = (req, res, next) => {
    try {
        //validate input
        const error = verifyEmailOrId.safeParse(req.body);
        if (error.success === false) {
          return res.status(StatusCodes.BAD_REQUEST).send({
            success: false,
            message: error.error.issues[0].message,
          });
        }
        return next();
    }catch (error){
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
};

const validatePassword = (req, res, next) => {
    const { password, confirmPassword } = req.body;
    try {
        //validate password
        if(password !== confirmPassword){
            return res.status(StatusCodes.UNAUTHORIZED).json({
              message: "Passwords do not match",
            });
          }
        return next();
    }catch (error){
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
};

const checkIfUserExists = async (req, res, next) => {
    const { email } = req.body;
    try {
        //check if user exists
        const userExists = await fetchUserFromDatabase(email);
        if (userExists.length) {
            return res.status(StatusCodes.CONFLICT).json({
                message: "User already exists",
            });
        }
        return next();
    }catch (error){
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
};

const checkIfUserDoesNotExists = async (req, res, next) => {
    const { email } = req.body;
    console.log("USEREXISTS")
    try {
        //check if user does not exists
        const userExists = await fetchUserFromDatabase(email);
        if (!userExists[0]) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Invalid email or password",
            });
        }
        req.body.user = userExists;
        return next();
    }catch (error){
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
};

const generateEncryptedPassword = async (req, res, next) => {
    const { password, firstName, lastName, email } = req.body;
    try {
        //register the user
        const salt = await bcrypt.genSalt(Number(SALT_ROUNDS));
        const encryptedPassword = await bcrypt.hash(password, salt);
        const user = {
            firstName,
            lastName,
            email,
            password: encryptedPassword,
        };
        req.body.user = user;
        return next();
    }catch (error){
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
};

const sendVerificationEmail = async (req, res, next) => {
    const { email } = req.body;
    try {
        //send verification email to registered user
        const subject = `${APP_NAME} Email Verification`;
        const token = jwt.sign(
        {
            email,
        },
        JWT_SECRET
        );
        const emailContent = emailContentFunction(APP_NAME, token);
        const sendVerificationEmail = await sendMail(email, subject, emailContent);
        req.body.token = token;
        return next();
    }catch (error){
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
};

const writeUserToDatabase = async (req, res, next) => {
    const { user } = req.body;
    try {
        const registerUser = await saveUserToDatabase(user);
        if (!registerUser) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Please try again later",
            });
        }
        return next();
    }catch (error){
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
};

const authenticateUserDetails = async (req, res, next) => {
    const { user, password } = req.body;
    console.log("AUTHENTICATE")
    try {
        const userId = user[0]._id;
        const authenticateUser = await bcrypt.compare(
        password,
        user[0].password
        );
        if (!user[0].isVerified) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Please verify your email",
            });
        }
        //authenticate the user
        if (!authenticateUser) {
            return res.status(StatusCodes.FORBIDDEN).json({
                message: "Invalid email or password",
            });
        }
        return next();
    }catch (error){
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
};

const authenticateUserToken = async (req, res, next) => {
    const { token } = req.params;
    try {
        const userEmail = jwt.verify(token, JWT_SECRET);
        const userExists = await fetchUserFromDatabase(userEmail.email);
        if (!userExists[0]._id) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            status: "failed",
            message: "No valid token",
        });
        }
        req.body.user = userExists;
        return next();
    }catch (error){
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
};

const updateUserRecord = async (req, res, next) => {
    const { user } = req.body;
    try {
        const updatedRecord = await fetchUserFromDatabaseAndUpdate(
            user[0]._id,
            {
              isVerified: true,
            }
          );
          if (!updatedRecord) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
              status: "failed",
              message: "Please try again",
            });
          }
        return next();
    }catch (error){
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
};
const fetchUser = async (req, res, next) => {
    const { email, id } = req.body;
    try {
        const token = req.headers.authorization.split(" ")[1];
        let user;
        const verifyToken = jwt.verify(token, JWT_SECRET);
        if(!verifyToken || !verifyToken.userId){
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "UNAUTHORIZED"
            })
        }
        if(email){
          user = await fetchUserFromDatabase(email, verifyToken.userId);
        }
        if(id){
          user = await fetchUserFromDatabase(id, verifyToken.userId);
        }
        if (!user[0]) {
          return res.status(StatusCodes.NOT_FOUND).json({
            message: "User might not exist or you are trying an invalid search",
          });
        }
        req.body.user = user;
        return next();
    }catch (error){
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
};

const register = (req, res) => {
    const { token } = req.body;

    return res.status(StatusCodes.CREATED).json({
        message: "Registration Successful",
        token,
    });
      
};

const login = async (req, res) => {
    const { user, email } = req.body;
    console.log("LOGIN")
    const userId = user[0]._id;
    try {
      const token = jwt.sign(
        {
          email,
          userId,
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      return res.status(StatusCodes.OK).json({
        status: "success",
        message: "Login successful",
        token,
        user,
      });
    } catch (error) {
      console.log("Error: ", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: "failed",
        message: "Please try again",
      });
    }
  }

const verifyUser = async (_req, res) => {
    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "User verified",
    });
  }

const searchUser = async (req, res) => {
    const { user } = req.body;
    return res.status(StatusCodes.OK).json({
      status: "success",
      user,
    });
}

module.exports = {
    validateInput,
    validateInputLogin,
    validateInputToken,
    validatePassword,
    validateInputEmailOrId,
    checkIfUserExists,
    generateEncryptedPassword,
    sendVerificationEmail,
    writeUserToDatabase,
    checkIfUserDoesNotExists,
    authenticateUserDetails,
    authenticateUserToken,
    updateUserRecord,
    fetchUser,
    register,
    login,
    verifyUser,
    searchUser
}