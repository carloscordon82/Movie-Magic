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
  //   const sgMail = require('@sendgrid/mail')
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  // const msg = {
  //   to: 'memevertical@gmail.com', // Change to your recipient
  //   from: 'test@example.com', // Change to your verified sender
  //   subject: 'Sending with SendGrid is Fun',
  //   text: 'and easy to do anywhere, even with Node.js',
  //   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  // }
  // sgMail
  //   .send(msg)
  //   .then(() => {
  //     console.log('Email sent')
  //   })
  //   .catch((error) => {
  //     console.error(error)
  //   })
  res.redirect("movies");
  // let today = new Date().toLocaleDateString("en-US", {
  //   timeZone: "America/New_York",
  // });
  // Movie.find()
  //   .then((movies) => {
  //     if (movies.length) {
  //       console.log("MOVIES", movies);

  //       movies.forEach((element, i) => {
  //         movies[i].odd = i % 2;
  //         console.log("odd", element.odd);
  //       });
  //       // console.log("MOVIES", movies[0].odd);
  //     }
  //     res.render("index", { movies, today });
  //   })
  //   .catch((err) => {
  //     console.log("Something went wrong", err);
  //   });
});

router.put("/test", (req, res, next) => {
  console.log("test hit", req.body);
  res.json("");
});

module.exports = router;
