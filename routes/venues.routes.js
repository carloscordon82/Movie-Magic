const router = require("express").Router();

const User = require("../models/User.model");
const Movie = require("../models/Movie.model");
const Venue = require("../models/Venue.model");
const Showtime = require("../models/Showtime.model");
const Ticket = require("../models/Ticket.model");

const axios = require("axios");
const isLoggedIn = require("../middleware/isLoggedIn");
const isLoggedOut = require("../middleware/isLoggedOut");

function convertDate(data) {
  let months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  var convertedStartDate = new Date(data);
  var month = months[convertedStartDate.getMonth()];
  var weekDay = days[convertedStartDate.getDay()];
  var day = convertedStartDate.getDate();

  return { day, month, weekDay };
}

router.get("/", (req, res, next) => {
  let today = new Date().toLocaleDateString("en-US", {
    timeZone: "America/New_York",
  });
  Venue.find()
    .then((venues) => {
      venues.forEach((venue) => {
        if (venue.layout === 1) {
          venue.seating = "VIP - Automatic Chairs";
        } else {
          venue.seating = "Standard - Not that great";
        }
      });
      res.render("venues/venues", { venues, today });
    })
    .catch((err) => {
      console.log("Something went wrong", err);
    });
});

router.get("/:venueId/", (req, res, next) => {
  let getDaysArray = function (start, end) {
    for (
      var arr = [], dt = new Date(start);
      dt <= end;
      dt.setDate(dt.getDate() + 1)
    ) {
      let shortDate = new Date(dt).toLocaleDateString("en-US", {
        timeZone: "America/New_York",
      });
      arr.push({ shortDate: shortDate, longDate: convertDate(shortDate) });
    }
    return arr;
  };
  let today = new Date();
  let end = new Date();

  end.setDate(today.getDate() + 10);

  let allDates = getDaysArray(today, end);
  Venue.findById(req.params.venueId)
    .then((venue) => {
      Showtime.find({ venue: req.params.venueId, date: req.query.movieDate })
        .populate("movie")
        .populate("tickets")
        .then((showtimes) => {
          console.log("SHOWS", showtimes);
          let movies = [];
          if (showtimes.length > 0) {
            let current = showtimes[0].movie._id.toString();
            movies = [
              {
                movie: {
                  title: showtimes[0].movie.title,
                  overview: showtimes[0].movie.overview,
                  id: current,
                  poster: showtimes[0].movie.poster,
                  backdrop: showtimes[0].movie.backdrop,
                },
                times: [],
              },
            ];
            let i = 0;
            showtimes.forEach((element) => {
              let avail = 0;
              element.tickets.forEach((ticket) => {
                if (!ticket.occupied) avail++;
              });
              console.log(avail, "AVAIL");
              if (element.movie._id.toString() === current) {
                movies[i]["times"].push({ time: element.time, avail: avail });
              } else {
                i++;
                current = element.movie._id.toString();
                (movies[i] = {
                  movie: {
                    title: element.movie.title,
                    overview: element.movie.overview,
                    id: element.movie._id.toString(),
                    poster: element.movie.poster,
                    backdrop: element.movie.backdrop,
                  },
                  times: [],
                }),
                  //     (movies[i].movie.title = element.movie.title);
                  //   movies[i].movie.id = element.movie._id.toString();
                  movies[i].times.push({ time: element.time, avail: avail });
              }
            });
            movies.forEach((element) => {
              element.times.sort(function (a, b) {
                return +a.time.substr(0, 2) - +b.time.substr(0, 2);
              });
            });
          }

          if (venue.layout === 1) {
            venue.seating = "VIP - Automatic Chairs";
          } else {
            venue.seating = "Standard - Not that great";
          }
          venue.ameneties = venue.ameneties.join(", ");
          let currentDate = req.query.movieDate;
          console.log("MOVIES ", movies);
          res.render("venues/venue-details", {
            venue,
            movies,
            currentDate,
            allDates,
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

module.exports = router;
