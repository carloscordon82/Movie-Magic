const router = require("express").Router();

const User = require("../models/User.model");
const Movie = require("../models/Movie.model");
const Venue = require("../models/Venue.model");
const Showtime = require("../models/Showtime.model");
const Ticket = require("../models/Ticket.model");

const isLoggedIn = require("../middleware/isLoggedIn");
const isLoggedOut = require("../middleware/isLoggedOut");
const { render } = require("express/lib/response");

const saltRounds = 10;
router.get("/change/:oldId/:newId", isLoggedIn, (req, res, next) => {
  Ticket.findByIdAndUpdate(req.params.oldId, {
    occupied: false,
    user: null,
    paymentId: "",
  })
    .then((oldTicket) => {
      console.log("OLD TICKET", oldTicket);
      console.log("new ID", req.params.newId);

      Ticket.findByIdAndUpdate(req.params.newId, {
        occupied: true,
        user: req.session.user._id,
        paymentId: oldTicket.paymentId,
      })
        .then((newTicket) => {
          User.updateOne(
            { username: req.session.user.username },
            {
              $pullAll: {
                tickets: [req.params.oldId],
              },
            }
          )
            .then((result2) => {
              User.updateOne(
                { username: req.session.user.username },
                {
                  $push: {
                    tickets: [req.params.newId],
                  },
                }
              )
                .then((result3) => {
                  console.log("MADE IT");
                  res.redirect("/user/tickets");
                })
                .catch((err) => {
                  next(err);
                });
            })
            .catch((err) => {
              next(err);
            });
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
});
router.get("/change-seats/:movieId/:venueId", isLoggedIn, (req, res, next) => {
  let seat = false;
  User.findById(req.session.user._id)
    .populate("tickets")
    .then((found) => {
      found.tickets.forEach((element) => {
        console.log("FOUND", element.seatNumber, req.query.seat);

        if (element.seatNumber === req.query.seat) seat = true;
      });
      if (seat) {
        Showtime.find({
          venue: req.params.venueId,
          movie: req.params.movieId,
          time: req.query.movieTime,
          date: req.query.movieDate,
        })
          .populate("tickets")
          .populate("movie")
          .then((seats) => {
            console.log("SEATS", seats);
            if (seats.length === 0) {
              res.render("seats/change-seats", {
                errorMessage: "No seats found",
              });
              return;
            }
            seats[0].tickets.forEach((element, i) => {
              console.log("checking", element);
              if (element.seatNumber === req.query.seat) {
                element.you = true;
              } else {
                element.you = false;
              }
            });
            //   allSeats = seats[0].tickets;

            let row1 = seats[0].tickets.slice(0, 8);
            console.log(row1);
            let row2 = seats[0].tickets.slice(8, 16);
            let row3 = seats[0].tickets.slice(16, 24);
            let row4 = seats[0].tickets.slice(24, 32);
            let row5 = seats[0].tickets.slice(32, 40);
            let row6 = seats[0].tickets.slice(40, 48);
            allSeats = { row1, row2, row3, row4, row5, row6 };
            // console.log("ALL SEATS", seats);
            // allSeats[2].occupied = true;
            let data = {
              allSeats,
              venue: req.params.venueId,
              movie: req.params.movieId,
              time: req.query.movieTime,
              date: req.query.movieDate,
              seats,
              seat: req.query.seat,
            };
            res.render("seats/change-seats", data);
          })
          .catch((err) => {
            next(err);
          });
      } else {
        res.render("seats/change-seats", {
          errorMessage: "Invalid Seat",
        });
        return;
      }
    })
    .catch((err) => {
      next(err);
    });
});
router.get("/:movieId/:venueId", isLoggedIn, (req, res, next) => {
  Showtime.find({
    venue: req.params.venueId,
    movie: req.params.movieId,
    time: req.query.movieTime,
    date: req.query.movieDate,
  })
    .populate("tickets")
    .populate("movie")
    .then((seats) => {
      console.log("SEATS", seats);
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
      // console.log("ALL SEATS", seats);
      // allSeats[2].occupied = true;
      let data = {
        allSeats,
        venue: req.params.venueId,
        movie: req.params.movieId,
        time: req.query.movieTime,
        date: req.query.movieDate,
        seats,
      };
      res.render("seats/seats", data);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
