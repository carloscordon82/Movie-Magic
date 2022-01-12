const router = require("express").Router();

const User = require("../models/User.model");
const Movie = require("../models/Movie.model");
const Venue = require("../models/Venue.model");
const Showtime = require("../models/Showtime.model");
const Ticket = require("../models/Ticket.model");

const isLoggedIn = require("../middleware/isLoggedIn");
const isLoggedOut = require("../middleware/isLoggedOut");

const saltRounds = 10;

router.get("/:movieId/:venueId", isLoggedIn, (req, res, next) => {
  Showtime.find({
    venue: req.params.venueId,
    movie: req.params.movieId,
    time: req.query.movieTime,
    date: req.query.movieDate,
  })
    .populate("tickets")
    .then((seats) => {
      console.log("SEATS", seats.length === 0);
      if (seats.length === 0) {
        res.render("seats", {
          errorMessage: "No seats found",
        });
        return;
      }
      //   allSeats = seats[0].tickets;
      let row1 = seats[0].tickets.slice(0, 8);
      let row2 = seats[0].tickets.slice(8, 16);
      let row3 = seats[0].tickets.slice(16, 24);
      let row4 = seats[0].tickets.slice(24, 32);
      let row5 = seats[0].tickets.slice(32, 40);
      let row6 = seats[0].tickets.slice(40, 48);
      allSeats = { row1, row2, row3, row4, row5, row6 };
      console.log("ALL SEATS", row6);
      // allSeats[2].occupied = true;
      let data = {
        allSeats,
        venue: req.params.venueId,
        movie: req.params.movieId,
        time: req.query.movieTime,
        date: req.query.movieDate,
      };
      res.render("seats/seats", data);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
