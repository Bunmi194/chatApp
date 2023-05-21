const User = require("../models/users");

const saveUserToDatabase = async (user) => {
  const newUser = new User(user);
  return newUser
    .save(user)
    .then((user) => {
      return user;
    })
    .catch((error) => {
      console.log("Error on save to DB", error);
      return null;
    });
};

const fetchUserFromDatabase = async (userEmailOrId) => {
  console.log("userEmailOrId: ", userEmailOrId);
  console.log("userEmailOrId.includes('@'): ", userEmailOrId.includes("@"));
  if (userEmailOrId.includes("@")) {
    //fetch by email
    return User.find({ email: userEmailOrId })
      .then((user) => {
        return user;
      })
      .catch((err) => {
        console.error(err);
        return null;
      });
  }
  //fetch by id
  return User.find({ _id: userEmailOrId })
    .then((user) => {
      return user;
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
};

const fetchUserFromDatabaseAndUpdate = async (id, userObject) => {
  return User
  .findByIdAndUpdate(id, userObject)
    .then((user) => {
      return user;
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
};

const fetchAllUsers = async () => {
  User.find()
    .then((users) => {
      return users;
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
};

module.exports = {
  saveUserToDatabase,
  fetchUserFromDatabase,
  fetchAllUsers,
  fetchUserFromDatabaseAndUpdate,
};
