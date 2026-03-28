import express, { Router } from "express";
import serverless from "serverless-http";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const router = Router();

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY) 
  : null;

app.use(express.json());

// API Routes
router.get("/health", (req, res) => {
  res.json({ status: "ok", environment: "netlify" });
});

// Stripe Checkout Session
router.post("/create-checkout-session", async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: "Stripe is not configured" });
  }

  const { serviceName, price, orderId, successUrl, cancelUrl } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: serviceName,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId,
      },
    });

    res.json({ id: session.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mount the router on /.netlify/functions/api
// Netlify automatically strips the function name from the path if configured correctly
app.use("/.netlify/functions/api", router);

export const handler = serverless(app);
