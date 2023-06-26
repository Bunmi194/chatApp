const express = require("express");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const route = express.Router();
const {
  validateInput,
  validateInputLogin,
  validateInputToken,
  validatePassword,
  checkIfUserExists,
  generateEncryptedPassword,
  sendVerificationEmail,
  writeUserToDatabase,
  checkIfUserDoesNotExists,
  authenticateUserDetails,
  authenticateUserToken,
  updateUserRecord,
  validateInputEmailOrId,
  fetchUser,
} = require("./user-controller");

route.post(
  "/register",
  validateInput,
  validatePassword,
  checkIfUserExists,
  generateEncryptedPassword,
  sendVerificationEmail,
  writeUserToDatabase,
  (req, res) => {
    const { token } = req.body;

    return res.status(StatusCodes.CREATED).json({
      message: "Registration Successful",
      token,
    });
  }
);

route.post(
  "/login",
  validateInputLogin,
  checkIfUserDoesNotExists,
  authenticateUserDetails,
  async (req, res) => {
    const { user, email } = req.body;
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
);

route.get(
  "/verify/:token",
  validateInputToken,
  authenticateUserToken,
  updateUserRecord,
  async (_req, res) => {
    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "User verified",
    });
  }
);

//modify to check for token
route.post("/search", validateInputEmailOrId, fetchUser, async (req, res) => {
  const { user } = req.body;
  return res.status(StatusCodes.OK).json({
    status: "success",
    user,
  });
});
const usersRoute = route;
module.exports = usersRoute;
