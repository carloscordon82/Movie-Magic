const router = require("express").Router();
const seatsDefault = require("../config/seatsDefault");
const timesDefault = require("../config/timesDefault");

const User = require("../models/User.model");
const Movie = require("../models/Movie.model");
const Venue = require("../models/Venue.model");
const Showtime = require("../models/Showtime.model");
const Ticket = require("../models/Ticket.model");
const mongoose = require("mongoose");

const isLoggedIn = require("../middleware/isLoggedIn");
const isLoggedOut = require("../middleware/isLoggedOut");

const saltRounds = 10;

router.get("/", (req, res, next) => {
  let today = new Date().toLocaleDateString("en-US", {
    timeZone: "America/New_York",
  });
  Movie.find()
    .then((movies) => {
      movies.forEach((element, i) => {
        movies[i].odd = i % 2;
        console.log("odd", element.odd);
      });
      console.log("MOVIES", movies[0].odd);
      res.render("index", { movies, today });
    })
    .catch((err) => {
      console.log("Something went wrong", err);
    });
});

router.put("/test", (req, res, next) => {
  console.log("test hit", req.body);
  res.json("");
});

module.exports = router;
