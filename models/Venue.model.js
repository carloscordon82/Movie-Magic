const { Schema, model } = require("mongoose");

const venueSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  location: {
    type: String,
  },

  picUrl: {
    type: String,
  },

  layout: {
    type: Number,
  },

  ameneties: [
    {
      type: String,
    },
  ],
});

const Venue = model("Venue", venueSchema);

module.exports = Venue;
