const passport = require("passport");
const express = require("express");
const route = express.Router();
require("../auth/google");

const GOOGLE_REDIRECT = process.env.GOOGLE_REDIRECT;

route.get(
  "/auth/google",
  function (req, res, next) {
    console.log("GOOGLE_REDIRECT: ", GOOGLE_REDIRECT);
    console.log(`Loading API library`);
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

route.get(
  "/google",
  function (req, res, next) {
    console.log("Handling Google callback URL...");
    next();
  },
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    console.log("Request: ", req);
    const token = req.user.token;
    //userExists = req.user.userExists;
    const email = req.user.userExists[0].email;
    const firstName = req.user.userExists[0].firstName;
    const lastName = req.user.userExists[0].lastName;
    const id = req.user.userExists[0]._id;
    // console.log("Response: ", res);
    //token and some other details
    if(token){
        return res.redirect(`${GOOGLE_REDIRECT}/?token=${token}&email=${email}&firstName=${firstName}&lastName=${lastName}&id=${id}`);
    }
    return res.redirect(`${GOOGLE_REDIRECT}`);
  }
);

const googleRoute = route;
module.exports = googleRoute;
