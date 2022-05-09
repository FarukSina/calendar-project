const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  userEmail: {
    type: String,
    required: true,
    unique: true,
  },
  clientId: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
