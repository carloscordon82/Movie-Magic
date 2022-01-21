const { Schema, model } = require("mongoose");

const movieSchema = new Schema(
  {
    tmdbId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    releaseDate: String,
    genres: [{ id: String, name: String }],
    overview: {
      type: String,
      required: true,
    },
    backdrop: String,
    poster: String,
  },
  {
    timestamps: true,
  }
);

const Movie = model("Movie", movieSchema);

module.exports = Movie;
