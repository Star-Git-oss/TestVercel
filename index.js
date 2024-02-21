const express = require("express");
// const connectDB = require("./config/db");
const path = require("path");
const cors = require("cors");

const app = express();

const MONGODB_URI =
  "mongodb+srv://yakiv390497:N4gkZwUKD2GahJVA@cluster0.mem6wir.mongodb.net/";
const mongoose = require("mongoose");

// require("./config/db");
// const corsOptions = {
//   origin: 'http://localhost:8002',
//   credentials: true, //access-control-allow-credentials:true
//   optionSuccessStatus: 200,
// };

// Connect Database

// const corsOptions = {
//   origin: "*",
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   credentials: true,
//   optionsSuccessStatus: 200,
// };
app.use(cors("*"));

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => res.status(200).json('Welcome, your app is working well'))
  .catch((err) => res.status(500).json('error'));

// Init Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Define Routes
app.use("/api/user", require("./routes/api/users"));
app.use("/api/vehicle", require("./routes/api/vehicle"));

// app.use('/', express.static(path.join(__dirname, 'build')));

// if (process.env.NODE_ENV === "production") {
// Set static folder
// app.use(express.static("build"));

// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
// });
// }

const PORT = process.env.PORT || 5005;

app.listen(5000, () => console.log(`Server started on port ${PORT}`));

module.exports = app;