const User = require("../models/users");
const jwt = require("jsonwebtoken");
const {
    fetchUserFromDatabase,
    saveUserToDatabase
} = require("./users");
const jwtSecret = process.env.JWT_SECRET;

exports.createUserOrLogin = async (profile) => {
    try {
        const email = profile.emails[0].value;
        if(!profile || typeof email !== "string") {
            return "Please provide a valid email address";
        }
        const userExists = await fetchUserFromDatabase(email);
        if(!userExists) {
            //register user
            const newUser = {
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email,
                password: "",
                isVerified: true
            }
            const user = await saveUserToDatabase(newUser);
            return user;
        }
        //login user
        const userId = userExists[0]._id;
        const token = jwt.sign(
            {
              email,
              userId,
            },
            jwtSecret,
            { expiresIn: "24h" }
          );
        return {
            token,
            userExists
        }
    } catch (error) {
        console.log(`Error: ${error}`);
        return null;
    }
}