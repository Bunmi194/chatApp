const passport = require("passport");
const { createUserOrLogin } = require("./google-controller");
require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: `${process.env.APP_URL}/v1/strategy/google`
  },
  async function(accessToken, refreshToken, profile, done) {
    const result = await createUserOrLogin(profile);
    return done(null, result);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
