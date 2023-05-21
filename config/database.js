const mongoose = require('mongoose');
require("dotenv").config();
const URI = process.env.MONGODB_URI;

const connectDB = () => {
    mongoose.connect(URI).then(()=> {
        console.log('Database connection established')
    }).catch(err => console.log(err));
}

module.exports = connectDB