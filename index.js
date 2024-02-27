const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
const cors = require("cors");

const app = express();
const mongoose = require("mongoose");

// const stripe = require("stripe")(
//   "sk_test_51OnG87Dg9vv5uXuM778Q7eeL9mCdTgLBDUWIX673o42jAPgaCVHxtWUWYYW73QVPX5XRMMEC3dI9M2q1ZkkK12Sr00cLw9PNgZ"
// );
// const { v4: uuidv4 } = require("uuid");

app.use(cors());

connectDB();
// Init Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));    
// Define Routes
app.use("/api/user", require("./routes/api/users"));
app.use("/api/vehicle", require("./routes/api/vehicle"));
app.use("/api/stripe", require("./routes/api/stripe"));

app.use("/", express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// const qrcode = require('qrcode-terminal');

// const { Client } = require('whatsapp-web.js');
// const client = new Client();

// client.on('qr', (qr) => {
//     qrcode.generate(qr, { small: true });
// });

// client.on('ready', () => {
//     console.log('Client is ready!');
// });

// client.initialize();

module.exports = app;
