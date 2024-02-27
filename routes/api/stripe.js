const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../../models/User");

const stripe = require("stripe")(
  "sk_test_51OnG87Dg9vv5uXuM778Q7eeL9mCdTgLBDUWIX673o42jAPgaCVHxtWUWYYW73QVPX5XRMMEC3dI9M2q1ZkkK12Sr00cLw9PNgZ"
);

router.post("/create-customer", express.json(), async (req, res) => {
  const { email, name } = req.body;
  console.log(email, name);
  let response = {};
  try {
    const customer = await stripe.customers
      .create({
        email: email,
        name: name,
        shipping: {
          address: {
            city: "Brothers",
            country: "US",
            line1: "27 Fredrick Ave",
            postal_code: "97712",
            state: "CA",
          },
          name: name,
        },
        address: {
          city: "Brothers",
          country: "US",
          line1: "27 Fredrick Ave",
          postal_code: "97712",
          state: "CA",
        },
      })
      .then((res) => {
        response = res;
        // console.log("response", response);
      })
      .catch((err) => {
        // console.log(err);
      });
    res.status(200).send(response);
  } catch (err) {
    res.status(500).send("server");
  }
});

router.post("/create-subscription",  express.json(), async (req, res) => {
  const { email, customerId, priceAmount } = req.body;
  console.log("customerId, priceAmount", customerId, priceAmount);

  try {
    const product = await stripe.products.create({
      name: "Basic Dashboard",
    });

    console.log("product id ------>>>>>>>", product.id);

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: priceAmount,
      currency: "usd",
      recurring: {
        interval: "day",
        interval_count: 3,
      },
    });

    console.log("price id ------>>>>>>>", price.id);

    // Create the subscription. Note we're expanding the Subscription's
    // latest invoice and that invoice's payment_intent
    // so we can pass it to the front end to confirm the payment

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: price.id,
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });

    // console.log(subscription);
    let user = await User.updateOne(
      { email: email },
      { $set: { subscriptionId: subscription.id } }
    );
    console.log(user);

    res.send({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      hosted_invoice_url: subscription.latest_invoice.hosted_invoice_url,
    });
  } catch (error) {
    // console.log(error);
    return res.status(400).send({ error: { message: error.message } });
  }
});

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    const sig = request.headers["stripe-signature"];
    const body = request.body;
    console.log("webhook ---------------->>>>>>>>>>>>", sig);

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        "whsec_16wuRIdBO970PpcEcgL4FPthYpWMG3ks"
      );
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.canceled":
        const paymentIntentCanceled = event.data.object;
        // console.log("paymentIntentCanceled", paymentIntentCanceled);
        // Then define and call a function to handle the event payment_intent.canceled
        break;
      case "payment_intent.created":
        const paymentIntentCreated = event.data.object;
        // console.log("paymentIntentCreated", paymentIntentCreated);
        // Then define and call a function to handle the event payment_intent.created
        break;
      case "payment_intent.payment_failed":
        const paymentIntentPaymentFailed = event.data.object;
        // console.log("paymentIntentPaymentFailed", paymentIntentPaymentFailed);
        // Then define and call a function to handle the event payment_intent.payment_failed
        break;
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;
        // console.log("paymentIntentSucceeded", paymentIntentSucceeded);
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send("OK");
  }
);

router.post("/check-subscription", async (req, res) => {
  const email = req.body.email;
  const { subscriptionId } = await User.findOne(
    { email: email },
    { subscriptionId: 1, _id: 0 }
  );

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Access the subscription status from the retrieved subscription object
    const subscriptionStatus = subscription.status;
    console.log(subscriptionStatus);

    res.json({ status: subscriptionStatus });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    res.status(500).json({ error: "Failed to check subscription status" });
  }
});

module.exports = router;
