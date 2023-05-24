const passport = require("passport");
const { createUserOrLogin } = require("../controllers/google");
require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(new GoogleStrategy({
    clientID: '438019500256-bedaq8kmin6s0inlm66s7tge856fkq8k.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: `${process.env.APP_URL}v1/strategy/google`
  },
  async function(accessToken, refreshToken, profile, done) {
    console.log("here")
    // console.log("profile: ", profile);
    const result = await createUserOrLogin(profile);
    // console.log("result: ", result);
    // const result = profile;
    // const newProfile = {
    //     ...profile,
    //     token: "my-token",
    // }
    //check if user exists in the database
    //if user exists in the database create token and send
    return done(null, result);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


//check end
