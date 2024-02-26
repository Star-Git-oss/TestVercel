const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const moment = require('moment');
const axios = require("axios");

router.post("/signup", async (req, res) => {
  const { email, username, whatsApp, tel, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errors: { msg: "User already exists" } });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({
      email,
      username,
      whatsApp,
      tel,
      password: passwordHash,
    });

    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  console.log("req.body", req.body);
  try {
    let user = await User.findOne({ email });
    if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if (!auth) {
        res.status(400).send("Auth error");
      } else {
        const payload = {
          id: user._id,
          role: user.role,
        };

        // const currentTime = new Date();
        // console.log(currentTime - user.createdAt);
        const createdAt = user.createdAt // Example createdAt time
        const sixMonthsAgo = moment().subtract(6, "months");

        const isAtLeastSixMonthsDifference =
          moment().diff(createdAt, "months") >= 6;

        console.log(
          `Is the difference at least 6 months? ${isAtLeastSixMonthsDifference}`
        );

        // Create jwt token and return it
        jwt.sign(
          payload,
          config.get("jwtSecret"),
          { expiresIn: 3600 },
          (err, token) => {
            if (err) throw err;
            res.status(200).json({
              token,
              id: user._id,
              email: user.email,
              username: user.username,
              whatsApp: user.whatsApp,
              tel: user.tel,
              freetime: !isAtLeastSixMonthsDifference,
            });
          }
        );
      }
    } else {
      res.status(500).send("User not exist");
    }
  } catch (err) {
    res.status(400).send("Server confused");
  }
});

router.post("/googleSignin", async (req, res) => {
  try {
    const { access_token } = req.body;
    console.log("access_token", access_token);
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    const profile = await response.json();
    const { email } = profile;

    console.log("access_token, email", access_token, email);

    let user = await User.findOne({ email });

    // Check if there is a user this email
    if (!user) {
      console.log("This user does not exists");
      return res.status(400).json({ Error: "This user does not exists" });
    }

    const payload = {
      id: user._id,
      role: user.role,
    };

    // Create jwt token and return it
    jwt.sign(
      payload,
      config.get("jwtSecret"),
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          token,
          id: user._id,
          email: user.email,
          username: user.username,
          whatsApp: user.whatsApp,
          tel: user.tel,
        });
      }
    );
  } catch (e) {
    // console.log(e);
    res.status(400).send();
  }
});

module.exports = router;
