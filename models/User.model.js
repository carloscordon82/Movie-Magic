const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },

  password: String,

  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  tickets: [{ type: mongoose.Types.ObjectId, ref: "Ticket" }],

  isAdmin: Boolean,
});

const User = model("User", userSchema);

module.exports = User;
