import express from "express";
import serverless from "serverless-http";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY) 
  : null;

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[NETLIFY] ${req.method} ${req.url}`);
  next();
});

// Newsletter Subscription
const subscribeHandler = async (req: any, res: any) => {
  const { email } = req.body;
  console.log(`[NETLIFY] Received subscription request for: ${email}`);

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  try {
    console.log(`[NEWSLETTER] New subscription: ${email}`);
    console.log(`[EMAIL] Sending notification to admin: mk.rabbani.cse@gmail.com`);
    
    res.json({ 
      success: true, 
      message: "Subscription successful! Admin has been notified.",
      recipient: "mk.rabbani.cse@gmail.com"
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// API Routes
app.post("/api/subscribe", subscribeHandler);
app.post("/subscribe", subscribeHandler);
app.post("/.netlify/functions/api/subscribe", subscribeHandler);
app.post("/.netlify/functions/api/api/subscribe", subscribeHandler);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", environment: "netlify" });
});
app.get("/health", (req, res) => {
  res.json({ status: "ok", environment: "netlify" });
});

// Stripe Checkout Session
const createCheckoutSessionHandler = async (req: any, res: any) => {
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
};

app.post("/api/create-checkout-session", createCheckoutSessionHandler);
app.post("/create-checkout-session", createCheckoutSessionHandler);
app.post("/.netlify/functions/api/create-checkout-session", createCheckoutSessionHandler);

// Catch-all route for debugging
app.all("*", (req, res) => {
  console.log(`[NETLIFY] Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: `Route not found in Netlify function: ${req.method} ${req.url}`,
    path: req.path,
    url: req.url,
    method: req.method
  });
});

export const handler = serverless(app);
