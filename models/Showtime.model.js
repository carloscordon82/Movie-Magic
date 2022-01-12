const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const showtimeSchema = new Schema({
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
  tickets: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Ticket",
      default: null,
    },
  ],
  time: String,
  date: String,
});

const Showtime = model("Showtime", showtimeSchema);

module.exports = Showtime;
