const router = require("express").Router();

const User = require("../models/User.model");
const mongoose = require("mongoose");

const bcrypt = require("bcrypt");
const isLoggedIn = require("../middleware/isLoggedIn");
const isLoggedOut = require("../middleware/isLoggedOut");

const saltRounds = 10;

router.get("/login", isLoggedOut, (req, res, next) => {
  if (!req.session.user) {
    res.render("auth/login");
  } else {
    res.render("index", { user: req.session.user.username });
  }
});

router.post("/login", (req, res, next) => {
  const { username, password } = req.body;

  if (!username) {
    return res
      .status(400)
      .render("auth/login", { errorMessage: "Please provide your username." });
  }

  if (password.length < 8) {
    return res.status(400).render("auth/login", {
      errorMessage: "Your password needs to be at least 8 characters long.",
    });
  }

  User.findOne({ username })
    .then((user) => {
      if (!user) {
        return res
          .status(400)
          .render("auth/login", { errorMessage: "Wrong credentials." });
      }

      bcrypt.compare(password, user.password).then((isSamePassword) => {
        if (!isSamePassword) {
          return res
            .status(400)
            .render("auth/login", { errorMessage: "Wrong credentials." });
        }
        console.log("BEFORE", req.session.user);
        req.session.user = user;
        req.app.locals.globalUser = user;
        req.session.user.tempSeats = [];
        console.log("AFTERRR", req.app.locals.globalUser);
        return res.redirect("/");
      });
    })

    .catch((err) => {
      next(err);
    });
});

router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

router.post("/signup", (req, res, next) => {
  const { username, firstName, lastName, password } = req.body;
  if (!username) {
    return res
      .status(400)
      .render("auth/signup", { errorMessage: "Please provide your username." });
  }

  if (!firstName) {
    return res.status(400).render("auth/signup", {
      errorMessage: "Please provide your First Name.",
    });
  }

  if (!lastName) {
    return res.status(400).render("auth/signup", {
      errorMessage: "Please provide your Last Name.",
    });
  }

  if (password.length < 8) {
    return res.status(400).render("auth/signup", {
      errorMessage: "Your password needs to be at least 8 characters long.",
    });
  }

  User.findOne({ username }).then((found) => {
    if (found) {
      return res
        .status(400)
        .render("auth/signup", { errorMessage: "Username already taken." });
    }

    return bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        return User.create({
          username,
          firstName,
          lastName,
          password: hashedPassword,
          isAdmin: false,
        });
      })
      .then((user) => {
        req.session.user = user;
        req.app.locals.globalUser = user;

        req.session.user.tempSeats = [];
        res.redirect("/");
      })
      .catch((error) => {
        if (error instanceof mongoose.Error.ValidationError) {
          return res
            .status(400)
            .render("auth/signup", { errorMessage: error.message });
        }
        if (error.code === 11000) {
          return res.status(400).render("auth/signup", {
            errorMessage:
              "Username need to be unique. The username you chose is already in use.",
          });
        }
        return res
          .status(500)
          .render("auth/signup", { errorMessage: error.message });
      });
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    req.app.locals.globalUser = null;
    if (err) {
      return res
        .status(500)
        .render("auth/logout", { errorMessage: err.message });
    }
    res.redirect("login");
  });
});

// router.get("/signup", (req, res, next) => {
//   res.render("auth/signup");
// });

// router.post("/signup", (req, res, next) => {
//   const { username, firstName, lastName, password } = req.body;
//   if (!username) {
//     return res
//       .status(400)
//       .render("auth/signup", { errorMessage: "Please provide your username." });
//   }

//   if (!firstName) {
//     return res.status(400).render("auth/signup", {
//       errorMessage: "Please provide your First Name.",
//     });
//   }

//   if (!lastName) {
//     return res.status(400).render("auth/signup", {
//       errorMessage: "Please provide your Last Name.",
//     });
//   }

//   if (password.length < 8) {
//     return res.status(400).render("auth/signup", {
//       errorMessage: "Your password needs to be at least 8 characters long.",
//     });
//   }

//   User.findOne({ username }).then((found) => {
//     if (found) {
//       return res
//         .status(400)
//         .render("auth/signup", { errorMessage: "Username already taken." });
//     }

//     return bcrypt
//       .genSalt(saltRounds)
//       .then((salt) => bcrypt.hash(password, salt))
//       .then((hashedPassword) => {
//         return User.create({
//           username,
//           firstName,
//           lastName,
//           password: hashedPassword,
//         });
//       })
//       .then((user) => {
//         req.session.user = user;
//         res.redirect("/");
//       })
//       .catch((error) => {
//         if (error instanceof mongoose.Error.ValidationError) {
//           return res
//             .status(400)
//             .render("auth/signup", { errorMessage: error.message });
//         }
//         if (error.code === 11000) {
//           return res.status(400).render("auth/signup", {
//             errorMessage:
//               "Username need to be unique. The username you chose is already in use.",
//           });
//         }
//         return res
//           .status(500)
//           .render("auth/signup", { errorMessage: error.message });
//       });
//   });
// });

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .render("auth/logout", { errorMessage: err.message });
    }
    res.redirect("login");
  });
});

module.exports = router;
