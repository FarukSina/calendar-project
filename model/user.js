const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  clientId: {
    type: String,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
