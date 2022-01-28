const mongoose = require("mongoose");

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost/module-2-project";

mongoose
  .connect(MONGO_URI, { useUnifiedTopology: true })
  .then((x) => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch((err) => {
    console.error("Error connecting to mongo: ", err);
  });
