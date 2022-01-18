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
  var month = months[convertedStartDate.getMonth() + 1];
  var weekDay = days[convertedStartDate.getDay()];
  var day = convertedStartDate.getDate();

  return { day, month, weekDay };
}

router.get("/", (req, res, next) => {
  let today = new Date().toLocaleDateString("en-US", {
    timeZone: "America/New_York",
  });
  Movie.find()
    .then((movies) => {
      console.log("TODAY", today);
      res.render("movies/movies", { movies, today });
    })
    .catch((err) => {
      console.log("Something went wrong", err);
    });
});

router.get("/:movieId/", (req, res, next) => {
  let trailer = "";
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
  console.log("TRY", allDates);
  Movie.findById(req.params.movieId)
    .then((movie) => {
      axios
        .get(
          `https://api.themoviedb.org/3/movie/${movie.tmdbId}?api_key=5474fe63c18c5ac27e78e2d4e61c868c&append_to_response=videos`
        )
        .then((responseFromApi) => {
          axios
            .get(
              `https://api.themoviedb.org/3/movie/${movie.tmdbId}/credits?api_key=5474fe63c18c5ac27e78e2d4e61c868c&append_to_response=videos`
            )
            .then((responseFromApiCredits) => {
              responseFromApi.data.videos.results.forEach((element) => {
                if (element.type === "Trailer")
                  trailer = `https://www.youtube.com/embed/${element.key}`;
              });
              console.log(
                "RESPONSE FOR MOVIE ID",
                responseFromApiCredits.data.cast.slice(0, 6)
              );

              Showtime.find({
                movie: req.params.movieId,
                date: req.query.movieDate,
              })
                .populate("venue")
                .populate("tickets")
                .then((showtimes) => {
                  showtimes.sort(function (a, b) {
                    if (a.venue.name < b.venue.name) return -1;
                    if (a.venue.name > b.venue.name) return 1;
                    return 0;
                  });

                  let currentDate = req.query.movieDate;
                  let show = [];
                  if (showtimes.length > 0) {
                    let current = showtimes[0].venue._id.toString();
                    show = [
                      {
                        venue: {
                          name: showtimes[0].venue.name,
                          location: showtimes[0].venue.location,
                          id: current,
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
                      if (element.venue._id.toString() === current) {
                        show[i]["times"].push({
                          time: element.time,
                          avail: avail,
                        });
                      } else {
                        i++;
                        current = element.venue._id.toString();
                        (show[i] = {
                          venue: {
                            name: element.venue.name,
                            location: element.venue.location,
                            id: element.venue._id.toString(),
                          },
                          times: [],
                        }),
                          //     (show[i].venue.name = element.venue.name);
                          //   show[i].venue.id = element.venue._id.toString();
                          show[i].times.push({
                            time: element.time,
                            avail: avail,
                          });
                      }
                    });
                    show.forEach((element) => {
                      element.times.sort(function (a, b) {
                        return +a.time.substr(0, 2) - +b.time.substr(0, 2);
                      });
                    });
                  }
                  //TEST

                  //TEST
                  console.log("PASSING ", {
                    movie,
                    show,
                    currentDate,
                    trailer,
                  });
                  res.render("movies/movie-detail", {
                    movie,
                    show,
                    currentDate,
                    allDates,
                    trailer,
                    allData: responseFromApi.data,
                    cast: responseFromApiCredits.data.cast.slice(0, 6),
                  });
                })

                .catch((err) => {
                  next(err);
                });
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
