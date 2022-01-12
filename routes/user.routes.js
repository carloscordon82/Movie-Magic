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

router.get("/dashboard", isLoggedIn, (req, res, next) => {
  console.log("HIT ROUTE");

  User.findById(req.session.user._id)
    .populate("tickets")
    .then((data) => {
      res.render("user/dashboard", data);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
