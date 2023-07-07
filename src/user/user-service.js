const User = require("./user-model");

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

const fetchUserFromDatabase = async (userEmailOrId, currentUserId) => {
  if (userEmailOrId.includes("@")) {
    // fetch by email excluding the current user
    return User.find({ email: userEmailOrId, _id: { $ne: currentUserId } })
      .then((user) => {
        return user;
      })
      .catch((err) => {
        console.error(err);
        return null;
      });
  }
  
  // fetch by id excluding the current user
  return User.find({ _id: userEmailOrId, _id: { $ne: currentUserId } })
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
