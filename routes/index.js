const router = require("express").Router();
const seatsDefault = require("../config/seatsDefault");
const timesDefault = require("../config/timesDefault");
const User = require("../models/User.model");
const Movie = require("../models/Movie.model");
const Venue = require("../models/Venue.model");
const Showtime = require("../models/Showtime.model");
const Ticket = require("../models/Ticket.model");
const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_KEY);

const isLoggedIn = require("../middleware/isLoggedIn");
const isLoggedOut = require("../middleware/isLoggedOut");

const saltRounds = 10;

router.get("/", async (req, res, next) => {
  // let pis = ["pi_3KKxkMDpYP7j5IOA0hLYarfS", "pi_3KKxpyDpYP7j5IOA4wWYUSZ2"];
  // let promises = [];
  // pis.forEach((payId) => {
  //   promises.push(
  //     stripe.refunds.create({
  //       payment_intent: payId,
  //       amount: 2000,
  //     })
  //   );
  // });
  // Promise.all(promises).then((values) => {
  //   console.log(values);
  // });
  res.redirect("movies");
});

router.put("/test", (req, res, next) => {
  console.log("test hit", req.body);
  res.json("");
});

module.exports = router;
