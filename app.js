require("dotenv/config");
require("./db");
const express = require("express");
const hbs = require("hbs");
const app = express();
require("./config")(app);

const index = require("./routes/index");
const auth = require("./routes/auth.routes");
const movies = require("./routes/movies.routes");
const venues = require("./routes/venues.routes");
const seats = require("./routes/seats.routes");
const checkout = require("./routes/checkout.routes");
const admin = require("./routes/admin.routes");
const user = require("./routes/user.routes");

app.use("/", index);
app.use("/", auth);
app.use("/movies", movies);
app.use("/venues", venues);
app.use("/seats", seats);
app.use("/checkout", checkout);
app.use("/admin", admin);
app.use("/user", user);

require("./error-handling")(app);

module.exports = app;
