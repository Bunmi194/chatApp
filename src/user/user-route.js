const express = require("express");
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
  register,
  login,
  verifyUser,
  searchUser
} = require("./user-controller");

route.post(
  "/register",
  validateInput,
  validatePassword,
  checkIfUserExists,
  generateEncryptedPassword,
  sendVerificationEmail,
  writeUserToDatabase,
  register
);

route.post(
  "/login",
  validateInputLogin,
  checkIfUserDoesNotExists,
  authenticateUserDetails,
  login
);

route.get(
  "/verify/:token",
  validateInputToken,
  authenticateUserToken,
  updateUserRecord,
  verifyUser
);

route.post("/search", validateInputEmailOrId, fetchUser, searchUser);
const usersRoute = route;
module.exports = usersRoute;
