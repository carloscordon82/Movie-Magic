const router = require("express").Router();
const seatsDefault = require("../config/seatsDefault");
const timesDefault = require("../config/timesDefault");
const htmlTemplate = require("../config/email");
const pdfTemplate = require("../config/pdf");

const User = require("../models/User.model");
const Movie = require("../models/Movie.model");
const Venue = require("../models/Venue.model");
const Showtime = require("../models/Showtime.model");
const Ticket = require("../models/Ticket.model");
const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_KEY);
let fs = require("fs");
var pdf = require("pdf-creator-node");

var url = require("url");
const hbs = require("hbs");
const nodemailer = require("nodemailer");
const isLoggedIn = require("../middleware/isLoggedIn");
const isLoggedOut = require("../middleware/isLoggedOut");
const path = require("path");
const { redirect } = require("express/lib/response");
const { log } = require("console");
const saltRounds = 10;

function sendEmail(data, recipient, subject) {
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
  var message = {
    from: "Movie Magic<movie-theater@realhomesgroup.com>",
    to: recipient,
    subject: subject,
    text: "Plaintext version of the message",
    // attachments: [
    //   {
    //     filename: "attach.pdf",
    //     path: path.join(__dirname, "/output.pdf"),
    //     contentType: "application/pdf",
    //   },
    // ],
    html: htmlTemplate(data),
  };

  transporter.sendMail(message, function (error, response) {
    if (error) {
      console.log(error);
    }
  });
}

router.post("/process", async (req, res, next) => {
  if (req.session.user.tempSeats.length > 0) {
    let mypath = req.get("host");
    const sessi = await stripe.checkout.sessions
      .create({
        mode: "payment",
        success_url: `http://${mypath}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://${mypath}/checkout/summary`,
        payment_method_types: ["card"],
        line_items: [
          {
            price: "price_1KKocmDpYP7j5IOAmbja4w1g",
            quantity: req.session.user.tempSeats.length,
          },
        ],
      })
      .then((result) => {
        res.redirect(result.url);
      });
  }
});

router.put("/pre-summary", isLoggedIn, (req, res, next) => {
  if (typeof req.body.selectedSeats === "string") {
    req.session.user.tempSeats = [req.body.selectedSeats];
  } else {
    req.session.user.tempSeats = req.body.selectedSeats;
  }
  res.json("");
});

router.post("/pre-summary", isLoggedIn, (req, res, next) => {
  if (typeof req.body.seats === "string") {
    req.session.user.tempSeats = [req.body.seats];
  } else {
    req.session.user.tempSeats = req.body.seats;
  }
  res.redirect("summary");
});

router.get("/summary", isLoggedIn, (req, res, next) => {
  Ticket.find({ _id: { $in: req.session.user.tempSeats } })
    .populate("venue")
    .populate("movie")
    .then((tickets) => {
      let price = tickets.length * 20;
      res.render("checkout/summary", { tickets, price });
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/success", isLoggedIn, async (req, res, next) => {
  if (req.session.user.tempSeats)
    if (req.session.user.tempSeats.length > 0) {
      User.findByIdAndUpdate(
        req.session.user._id,
        {
          $push: { tickets: req.session.user.tempSeats },
        },
        { new: true }
      )
        .then((updatedUser) => {
          Ticket.update(
            { _id: { $in: req.session.user.tempSeats } },
            {
              $set: {
                user: req.session.user._id,
                occupied: true,
                paymentId: req.query.session_id,
              },
            },
            { multi: true }
          )

            .then((updatedTickets) => {
              Ticket.find({ _id: { $in: req.session.user.tempSeats } })
                .populate("venue")
                .populate("movie")
                .then((tickets) => {
                  let price = tickets.length * 20;
                  req.session.user.tempSeats = [];
                  req.session.user = updatedUser;
                  let recipient = req.session.user.email;
                  let subject = `Purchase Receipt - ${tickets[0].movie.title} - ${tickets[0].date} - ${tickets[0].time}`;
                  sendEmail(tickets, recipient, subject);
                  res.render("checkout/success", {
                    tickets,
                    price,
                  });
                })
                .catch((err) => {
                  next(err);
                });
            })
            .catch((err) => next(err));
        })
        .catch((err) => next(err));
    } else {
      res.redirect("/");
    }
});

router.get("/print-ticket/:ticketId", isLoggedIn, (req, res, next) => {
  Ticket.findById(req.params.ticketId)
    .populate("movie")
    .populate("venue")
    .populate("user")
    .then((ticket) => {
      function createPDF(data) {
        var options = {
          format: "A3",
          orientation: "portrait",
          border: "10mm",
          header: {
            height: "0mm",
            contents: {},
          },
          footer: {},
        };

        var document = {
          html: pdfTemplate(data),
          data: data,
          path: path.join(__dirname, `../public/${ticket._id}.pdf`),
          type: "",
        };

        // Call PDF CReator
        pdf
          .create(document, options)
          .then((result) => {
            res.redirect(`/${ticket._id}.pdf`);
          })
          .catch((error) => {
            console.error(error);
          });
      }
      if (ticket.user.username === req.session.user.username) createPDF(ticket);
    })
    .catch((err) => next(err));
});

router.get("/refund/:seatId", isLoggedIn, (req, res, next) => {
  let refundStatus = "";
  Ticket.findById(req.params.seatId)
    .then(async (ticket) => {
      const session = await stripe.checkout.sessions.retrieve(ticket.paymentId);
      const refund = await stripe.refunds
        .create({
          payment_intent: session.payment_intent,
          amount: 2000,
        })
        .then((result) => {
          refundStatus = result.status;
        })
        .catch((err) => next(err));

      if (refundStatus === "succeeded") {
        Ticket.findByIdAndUpdate(req.params.seatId, {
          occupied: false,
          paymentId: "",
        }).then((result) => {
          User.updateOne(
            { username: req.session.user.username },
            {
              $pullAll: {
                tickets: [req.params.seatId],
              },
            }
          )
            .then((result2) => {
              User.updateOne(
                { username: req.session.user.username },
                {
                  $push: {
                    refundedTickets: ticket._id,
                  },
                }
              )
                .then((result3) => {
                  User.findById(req.session.user._id)
                    .then((found) => {
                      req.session.user = found;
                      res.redirect("/user/tickets");
                    })
                    .catch((err) => next(err));
                })
                .catch((err) => next(err));
            })
            .catch((err) => next(err));
        });
      }
    })
    .catch((err) => next(err));
});

module.exports = router;
