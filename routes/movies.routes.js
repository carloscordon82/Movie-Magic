const router = require("express").Router();

const User = require("../models/User.model");
const Movie = require("../models/Movie.model");
const Venue = require("../models/Venue.model");
const Showtime = require("../models/Showtime.model");
const Ticket = require("../models/Ticket.model");

const axios = require("axios");
const isLoggedIn = require("../middleware/isLoggedIn");
const isLoggedOut = require("../middleware/isLoggedOut");

const saltRounds = 10;

router.get("/", (req, res, next) => {
  let today = new Date().toLocaleDateString("en-US", { timeZone: "UTC" });
  Movie.find()
    .then((movies) => {
      res.render("movies/movies", { movies, today });
    })
    .catch((err) => {
      console.log("Something went wrong", err);
    });
});

router.get("/:movieId/", (req, res, next) => {
  async function display() {
    try {
      await axios
        .get(
          "https://api.themoviedb.org/3/movie/728526?api_key=5474fe63c18c5ac27e78e2d4e61c868c"
        )
        .then((responseFromApi) => {})
        .catch((err) => {});
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
    Movie.findById(req.params.movieId)
      .then((movie) => {
        Showtime.find({ movie: req.params.movieId, date: req.query.movieDate })
          .populate("venue")
          .then((showtimes) => {
            let currentDate = req.query.movieDate;
            let show = [];
            if (showtimes.length > 0) {
              let current = showtimes[0].venue._id.toString();
              show = [
                {
                  venue: { name: showtimes[0].venue.name, id: current },
                  times: [],
                },
              ];
              console.log("shouldnt", showtimes);

              let i = 0;
              showtimes.forEach((element) => {
                if (element.venue._id.toString() === current) {
                  show[i]["times"].push(element.time);
                } else {
                  i++;
                  current = element.venue._id.toString();
                  (show[i] = {
                    venue: {
                      name: element.venue.name,
                      id: element.venue._id.toString(),
                    },
                    times: [],
                  }),
                    (show[i].venue.name = element.venue.name);
                  show[i].venue.id = element.venue._id.toString();
                  show[i].times.push(element.time);
                }
              });
              show.forEach((element) => {
                element.times.sort(function (a, b) {
                  return +a.substr(0, 2) - +b.substr(0, 2);
                });
              });
            }
            console.log("PASSING ", { movie, show, currentDate });
            res.render("movies/movie-detail", {
              movie,
              show,
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
