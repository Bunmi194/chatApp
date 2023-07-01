const User = require("../user/user-model");
const jwt = require("jsonwebtoken");
const {
    fetchUserFromDatabase,
    saveUserToDatabase
} = require("../user/user-service");
const jwtSecret = process.env.JWT_SECRET;

exports.createUserOrLogin = async (profile) => {
    try {
        const email = profile.emails[0].value;
        if(!profile || typeof email !== "string") {
            return "Please provide a valid email address";
        }
        const userExists = await fetchUserFromDatabase(email);
        console.log("userExistsOOP: ", userExists);
        if(!userExists.length) {
            console.log("IN")
            //register user
            const newUser = {
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email,
                password: "google",
                isVerified: true
            }
            const user = await saveUserToDatabase(newUser);
            console.log("user: ", user);
            const userId = user._id;
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
                userExists: user
            };
        }
        //login user
        console.log("OUT")
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
        console.log(`ErrorHERE: ${error}`);
        return null;
    }
}