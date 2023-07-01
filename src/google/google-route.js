const passport = require("passport");
const express = require("express");
const route = express.Router();
require("./google-auth");

const GOOGLE_REDIRECT = process.env.GOOGLE_REDIRECT;

route.get(
  "/auth/google",
  function (req, res, next) {
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

route.get(
  "/google",
  function (req, res, next) {
    next();
  },
  passport.authenticate("google", { failureRedirect: `${GOOGLE_REDIRECT}/` }),
  function (req, res) {
    // Successful authentication, redirect home.
    console.log("req.user: ", req.user)
    const token = req.user.token;
    const email = req.user.userExists[0]? req.user.userExists[0].email : req.user.userExists.email;
    const firstName = req.user.userExists[0]? req.user.userExists[0].firstName : req.user.userExists.firstName;
    const lastName = req.user.userExists[0]? req.user.userExists[0].lastName : req.user.userExists.lastName;
    const id = req.user.userExists[0]? req.user.userExists[0]._id : req.user.userExists._id;
    //token and some other details
    if (token) {
      return res.redirect(
        `${GOOGLE_REDIRECT}/?token=${token}&email=${email}&firstName=${firstName}&lastName=${lastName}&id=${id}`
      );
    }
    return res.redirect(`${GOOGLE_REDIRECT}`);
  }
);

const googleRoute = route;
module.exports = googleRoute;
