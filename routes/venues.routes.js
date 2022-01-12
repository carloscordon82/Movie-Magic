const router = require("express").Router();

const User = require("../models/User.model");
const Movie = require("../models/Movie.model");
const Venue = require("../models/Venue.model");
const Showtime = require("../models/Showtime.model");
const Ticket = require("../models/Ticket.model");

const axios = require("axios");
const isLoggedIn = require("../middleware/isLoggedIn");
const isLoggedOut = require("../middleware/isLoggedOut");

router.get("/", (req, res, next) => {
  let today = new Date().toLocaleDateString("en-US", { timeZone: "UTC" });
  Venue.find()
    .then((venues) => {
      res.render("venues/venues", { venues, today });
    })
    .catch((err) => {
      console.log("Something went wrong", err);
    });
});

router.get("/:venueId/", (req, res, next) => {
  async function display() {
    try {
      await axios
        .get(
          "https://api.themoviedb.org/3/movie/728526?api_key=5474fe63c18c5ac27e78e2d4e61c868c"
        )
        .then((responseFromApi) => {
          // console.log(responseFromApi.data);
        })
        .catch((err) => {
          console.log("ERRORRRRRRRR");
        });
    } catch (err) {
      console.log(err);
    }
    let getDaysArray = function (start, end) {
      for (
        var arr = [], dt = new Date(start);
        dt <= end;
        dt.setDate(dt.getDate() + 1)
      ) {
        arr.push(new Date(dt).toLocaleDateString("en-US", { timeZone: "UTC" }));
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
          .then((showtimes) => {
            console.log("SHOWS", showtimes);
            let movies = [];
            if (showtimes.length > 0) {
              console.log("shouldnt", showtimes);
              let current = showtimes[0].movie._id.toString();
              movies = [
                {
                  movie: {
                    title: showtimes[0].movie.title,
                    id: current,
                    poster: showtimes[0].movie.poster,
                  },
                  times: [],
                },
              ];
              let i = 0;
              showtimes.forEach((element) => {
                if (element.movie._id.toString() === current) {
                  movies[i]["times"].push(element.time);
                } else {
                  i++;
                  console.log("Progress", element);
                  current = element.movie._id.toString();
                  (movies[i] = {
                    movie: {
                      title: element.movie.title,
                      id: element.movie._id.toString(),
                      poster: element.movie.poster,
                    },
                    times: [],
                  }),
                    //     (movies[i].movie.title = element.movie.title);
                    //   movies[i].movie.id = element.movie._id.toString();
                    movies[i].times.push(element.time);
                }
              });
              movies.forEach((element) => {
                element.times.sort(function (a, b) {
                  return +a.substr(0, 2) - +b.substr(0, 2);
                });
              });
            }
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
  }
  display();
});

module.exports = router;
