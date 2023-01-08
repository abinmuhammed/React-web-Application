const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  Name : String,
  email : String,
  password : String
});

module.exports = mongoose.model("users", userSchema);
