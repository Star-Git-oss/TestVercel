const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const axios = require("axios");

const stripe = require("stripe")(
    "sk_test_51OnG87Dg9vv5uXuM778Q7eeL9mCdTgLBDUWIX673o42jAPgaCVHxtWUWYYW73QVPX5XRMMEC3dI9M2q1ZkkK12Sr00cLw9PNgZ"
  );
  const { v4: uuidv4 } = require("uuid");

router.post("/pay", async (req, res) => {
  console.log(req.body.token);
  const {token, amount} = req.body;
  const idempotencyKey = uuidv4();

  return stripe.customers.create({
    email: token.email,
    source: token
  }).then(
    customer => {
        stripe.charges.create({
            amount: amount * 100,
            currency: 'usd',
            customer: customer.id,
            receipt_email: token.email
        }, {idempotencyKey})
    }
  ).then(result => {
    res.status(200).json(result)
  }).catch(err => {
    console.log(err);
  });
});

module.exports = router;
