const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
const cors = require("cors");

const app = express();
const mongoose = require("mongoose");

app.use(cors("*"));

connectDB()
// Init Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Define Routes
app.use("/api/user", require("./routes/api/users"));
app.use("/api/vehicle", require("./routes/api/vehicle"));

app.use('/', express.static(path.join(__dirname, 'public')));

// if (process.env.NODE_ENV === "production") {
// Set static folder

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../BAZAR_CAR_frontend/dist", "index.html"));
});


const PORT = process.env.PORT || 5005;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app;
