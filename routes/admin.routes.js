const router = require("express").Router();
const seatsDefault = require("../config/seatsDefault");
const timesDefault = require("../config/timesDefault");

const User = require("../models/User.model");
const Movie = require("../models/Movie.model");
const Venue = require("../models/Venue.model");
const Showtime = require("../models/Showtime.model");
const Ticket = require("../models/Ticket.model");
const mongoose = require("mongoose");
const axios = require("axios");

const isLoggedIn = require("../middleware/isLoggedIn");
const isLoggedOut = require("../middleware/isLoggedOut");
const isAdminLoggedIn = require("../middleware/isAdminLoggedIn");

const saltRounds = 10;

router.get("/", isAdminLoggedIn, (req, res, next) => {
  res.redirect("admin/manage-movies");
});

router.get("/manage-movies", (req, res, next) => {
  Movie.find()
    .then((movies) => {
      let steps = [];
      movies.forEach((element, i) => {
        steps.push(Showtime.find({ movie: element._id }));
      });
      Promise.all(steps).then((values) => {
        values.forEach((showtimes, i) => {
          movies[i].shows = showtimes.length;
          let seats = 0;
          showtimes.forEach((showtime) => {
            showtime.tickets.forEach((ticket) => {
              if (!ticket.occupied) seats++;
            });
          });

          movies[i].seats = seats;
          let date = new Date(movies[i].createdAt);
          const [month, day, year] = [
            date.getMonth(),
            date.getDate(),
            date.getFullYear(),
          ];
          const [hour, minutes] = [date.getHours(), date.getMinutes()];
          movies[i].createdDate = `${month + 1}/${day}/${year}`;
          movies[i].createdTime = `${hour}:${minutes}`;
          console.log("PROMISES", movies[i].title, movies[i].seats);
        });
        res.render("admin/manage-movies", { movies });
      });
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/delete-movie/:movieId", isAdminLoggedIn, (req, res, next) => {
  console.log("DELETE");
  Movie.findByIdAndDelete(req.params.movieId)
    .then((movie) => {
      Showtime.deleteMany({ movie: movie._id })
        .then((deletedShowtimes) => {
          Ticket.deleteMany({ movie: movie._id })
            .then((deletedTickets) => {
              res.redirect("../manage-movies");
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

router.get("/manage-venues", isAdminLoggedIn, (req, res, next) => {
  Venue.find()
    .then((venues) => {
      res.render("admin/manage-venues", { venues });
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/delete-venue/:venueId", isAdminLoggedIn, (req, res, next) => {
  console.log("DELETE");
  Venue.findByIdAndDelete(req.params.venueId)
    .then((venue) => {
      Showtime.deleteMany({ venue: venue._id })
        .then((deletedShowtimes) => {
          Ticket.deleteMany({ venue: venue._id })
            .then((deletedTickets) => {
              res.redirect("../manage-venues");
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

router.get("/manage-showtimes", isAdminLoggedIn, (req, res, next) => {
  Showtime.find()
    .populate("movie")
    .populate("venue")
    .populate("tickets")
    .then((showtimes) => {
      // TESTING NEW OBJECT
      // result = showtimes.reduce(function (r, a) {
      //   r[a.venue.name] = r[a.venue.name] || [];
      //   r[a.venue.name].push(a);
      //   return r;
      // }, Object.create(null));

      // for (const [key, value] of Object.entries(result)) {
      //   result[key] = value.reduce(function (r, a) {
      //     r[a.movie.title] = r[a.movie.title] || [];
      //     r[a.movie.title].push(a);
      //     return r;
      //   }, Object.create(null));
      // }

      // for (const [key, value] of Object.entries(result)) {
      //   for (const [key2, value2] of Object.entries(value)) {
      //     result[key][key2] = value2.reduce(function (r, a) {
      //       r[a.date] = r[a.date] || [];
      //       r[a.date].push(a);
      //       return r;
      //     }, Object.create(null));
      //   }
      // }

      // END TEST
      showtimes.forEach((each) => {
        let amount = 0;
        each.tickets.forEach((element) => {
          if (element.occupied) amount++;
        });
        each.seatsFree = 64 - amount;
        each.seatsOccupied = amount;
        console.log("WORKING");
      });
      console.log("FINISHED");
      res.render("admin/manage-showtimes", { showtimes });
    })
    .catch((err) => {
      next(err);
    });
});

router.get(
  "/delete-showtime/:showtimeId",
  isAdminLoggedIn,
  (req, res, next) => {
    console.log("DELETE");
    Showtime.findByIdAndDelete(req.params.showtimeId)
      .populate("tickets")
      .then((showtime) => {
        Ticket.deleteMany({
          _id: {
            $in: showtime.tickets,
          },
        })
          .then((tickets) => {
            res.redirect("../manage-showtimes");
          })
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      });
  }
);

router.get("/create-venue", isAdminLoggedIn, (req, res, next) => {
  res.render("admin/create-venue");
});

router.post("/create-venue", isAdminLoggedIn, (req, res, next) => {
  if (!req.body.name) {
    return res.status(400).render("user/edit", {
      firstName,
      lastName,
      errorMessage: "Please provide a Name.",
    });
  }

  if (!req.body.location) {
    return res.status(400).render("user/edit", {
      firstName,
      lastName,
      errorMessage: "Please provide a Location.",
    });
  }

  if (!req.body.picUrl) {
    return res.status(400).render("user/edit", {
      errorMessage: "Please provide a Picture URL.",
    });
  }

  Venue.create(req.body)
    .then((venue) => {
      console.log(venue);
      res.redirect("/admin/manage-venues");
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/edit-venue/:venueId", isAdminLoggedIn, (req, res, next) => {
  Venue.findById(req.params.venueId).then((venue) => {
    console.log("VENUE", venue);
    res.render("admin/edit-venue", { venue });
  });
});

router.post("/edit-venue/:venueId", isAdminLoggedIn, (req, res, next) => {
  if (!req.body.name) {
    return res.status(400).render("user/edit", {
      firstName,
      lastName,
      errorMessage: "Please provide a Name.",
    });
  }

  if (!req.body.location) {
    return res.status(400).render("user/edit", {
      firstName,
      lastName,
      errorMessage: "Please provide a Location.",
    });
  }

  if (!req.body.picUrl) {
    return res.status(400).render("user/edit", {
      errorMessage: "Please provide a Picture URL.",
    });
  }

  Venue.findByIdAndUpdate(req.params.venueId, req.body)
    .then((venue) => {
      console.log(venue);
      res.redirect("/admin/manage-venues");
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/create-movie", isAdminLoggedIn, (req, res, next) => {
  res.render("admin/create-movie");
});
router.post("/search-movie", (req, res, next) => {
  console.log(req.body, "BODY");
  if (req.body) {
    async function display() {
      try {
        await axios
          .get(
            `https://api.themoviedb.org/3/search/movie?api_key=5474fe63c18c5ac27e78e2d4e61c868c&language=en-US&query=${req.body.title}&page=1&include_adult=false`
          )
          .then((responseFromApi) => {
            console.log(responseFromApi.data.results);
            res.render("admin/create-movie", responseFromApi);
          })
          .catch((err) => {});
      } catch (err) {
        console.log(err);
      }
    }
    display();
  }
});

router.get("/create-movie-id/:id", isAdminLoggedIn, (req, res, next) => {
  async function insert() {
    try {
      await axios
        .get(
          `https://api.themoviedb.org/3/movie/${req.params.id}?api_key=5474fe63c18c5ac27e78e2d4e61c868c`
        )
        .then((responseFromApi) => {
          console.log(responseFromApi.data);
          const movie = [
            {
              tmdbId: responseFromApi.data.id,
              title: responseFromApi.data.title,
              releaseDate: responseFromApi.data.release_date,
              genres: responseFromApi.data.genres,
              overview: responseFromApi.data.overview,
              backdrop: responseFromApi.data.backdrop_path,
              poster: responseFromApi.data.poster_path,
            },
          ];
          Movie.create(movie)
            .then((results) => {
              console.log("Success", results);
              res.redirect("/admin/manage-movies");
            })
            .catch((err) => {
              console.log("Something went wrong", err);
            });
        })
        .catch((err) => {
          console.log(err, "ERRORRRRRRRR");
        });
    } catch (err) {
      console.log(err);
    }
  }
  insert();
});

router.get("/create-showtime", isAdminLoggedIn, (req, res, next) => {
  Venue.find()
    .then((venues) => {
      Movie.find()
        .then((movies) => {
          data = { movies, venues, seatsDefault, timesDefault };
          res.render("admin/create-showtime", data);
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
});

router.post("/create-showtime", isAdminLoggedIn, (req, res, next) => {
  let date1 = new Date(req.body.StartDate);
  let date2 = new Date(req.body.EndDate);
  let today = new Date();
  today.setHours(today.getHours() - 23);

  if (date1.getTime() > date2.getTime() || date1.getTime() < today.getTime()) {
    return res.status(400).render("admin/create-showtime", {
      errorMessage: "Invalid Dates",
    });
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

  let dates = getDaysArray(
    new Date(req.body.StartDate),
    new Date(req.body.EndDate)
  );
  let times = req.body.time;
  if (typeof times === "string") times = [times];

  dates.forEach((date) => {
    times.forEach((time) => {
      let newTickets = [];
      let newTicket = [];
      seatsDefault.forEach((seat) => {
        newTicket.push({
          venue: req.body.venue,
          movie: req.body.movie,
          user: seat.user,
          seatNumber: seat.seatNumber,
          occupied: seat.occupied,
          time: time,
          date: date,
          paymentId: "",
        });
      });

      Ticket.create(newTicket)
        .then((results) => {
          results.forEach((element) => {
            newTickets.push(element._id.toString());
          });

          let newShowtime = {
            venue: req.body.venue,
            movie: req.body.movie,
            tickets: newTickets,
            time: time,
            date: date,
          };
          Showtime.create(newShowtime)
            .then((results) => {
              console.log("Success New Showtime", results);
              res.redirect("/admin/manage-showtimes");
            })
            .catch((err) => {
              console.log("Something went wrong", err);
            });
        })
        .catch((err) => {
          console.log("Something went wrong", err);
        });
    });
  });
});

module.exports = router;
