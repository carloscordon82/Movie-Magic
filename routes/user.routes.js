const router = require("express").Router();
const seatsDefault = require("../config/seatsDefault");
const timesDefault = require("../config/timesDefault");

const User = require("../models/User.model");
const Movie = require("../models/Movie.model");
const Venue = require("../models/Venue.model");
const Showtime = require("../models/Showtime.model");
const Ticket = require("../models/Ticket.model");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const isLoggedIn = require("../middleware/isLoggedIn");
const isLoggedOut = require("../middleware/isLoggedOut");

const saltRounds = 10;

router.get("/dashboard", isLoggedIn, (req, res, next) => {
  res.render("user/dashboard", req.session.user);
});

router.get("/edit", isLoggedIn, (req, res, next) => {
  console.log("EDIT", req.session.user);
  res.render("user/edit", req.session.user);
});

router.post("/edit", isLoggedIn, (req, res, next) => {
  let username = req.session.user.username;
  const { firstName, lastName } = req.body;

  if (!firstName) {
    return res.status(400).render("user/edit", {
      firstName,
      lastName,
      errorMessage: "Please provide your First Name.",
    });
  }

  if (!lastName) {
    return res.status(400).render("user/edit", {
      firstName,
      lastName,
      errorMessage: "Please provide your Last Name.",
    });
  }

  User.findOneAndUpdate(
    { username },
    { firstName: firstName, lastName: lastName },
    {
      returnOriginal: false,
    }
  )
    .then((found) => {
      req.session.user = found;
      req.app.locals.globalUser = found;
      res.redirect("/user/dashboard");
    })
    .catch((error) => {});
});

router.get("/change-my-password", isLoggedIn, (req, res, next) => {
  res.render("user/change-my-password", req.session.user);
});

router.post("/change-my-password", isLoggedIn, (req, res, next) => {
  let username = req.session.user.username;
  const { oldPassword, newPassword } = req.body;

  if (newPassword.length < 8) {
    return res.status(400).render("user/change-my-password", {
      errorMessage: "Your New password needs to be at least 8 characters long.",
    });
  }

  return bcrypt
    .compare(oldPassword, req.session.user.password)
    .then((isSamePassword) => {
      if (!isSamePassword) {
        return res.status(400).render("user/change-my-password", {
          errorMessage: "Wrong credentials.",
        });
      }

      return bcrypt
        .genSalt(saltRounds)
        .then((salt) => bcrypt.hash(newPassword, salt))
        .then((hashedPassword) => {
          return User.findOneAndUpdate(
            { username },
            { password: hashedPassword },
            {
              returnOriginal: false,
            }
          )
            .then((found) => {
              req.session.user = found;
              req.app.locals.globalUser = found;
              res.redirect("/user/dashboard");
            })

            .catch((error) => {
              if (error instanceof mongoose.Error.ValidationError) {
                return res.status(400).render("user/change-my-password", {
                  errorMessage: error.message,
                });
              }
              if (error.code === 11000) {
                return res.status(400).render("user/change-my-password", {
                  errorMessage:
                    "Username need to be unique. The username you chose is already in use.",
                });
              }
              return res.status(500).render("user/change-my-password", {
                errorMessage: error.message,
              });
            });
        });
    });
});

router.get("/tickets", isLoggedIn, (req, res, next) => {
  User.findById(req.session.user._id)
    .populate({
      path: "tickets",
      populate: {
        path: "movie",
        model: "Movie",
      },
    })
    .populate({
      path: "tickets",
      populate: {
        path: "venue",
        model: "Venue",
      },
    })
    .populate({
      path: "refundedTickets",
      populate: {
        path: "movie",
        model: "Movie",
      },
    })
    .populate({
      path: "refundedTickets",
      populate: {
        path: "venue",
        model: "Venue",
      },
    })
    .then((data) => {
      console.log("DATA", data);
      res.render("user/tickets", data);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
