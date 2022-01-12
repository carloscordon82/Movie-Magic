const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const ticketSchema = new Schema({
  venue: {
    type: mongoose.Types.ObjectId,
    ref: "Venue",
    default: null,
  },
  movie: {
    type: mongoose.Types.ObjectId,
    ref: "Movie",
    default: null,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    default: null,
  },
  seatNumber: String,
  occupied: Boolean,
  time: String,
  date: String,
});

const Ticket = model("Ticket", ticketSchema);

module.exports = Ticket;
