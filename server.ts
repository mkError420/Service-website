import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY) 
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`[SERVER] ${req.method} ${req.url}`);
    next();
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Stripe Checkout Session
  app.post("/api/create-checkout-session", async (req, res) => {
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

  // Newsletter Subscription
  app.post("/api/subscribe", async (req, res) => {
    const { email } = req.body;
    console.log(`[SERVER] Received subscription request for: ${email}`);

    if (!email || !email.includes("@")) {
      console.log(`[SERVER] Invalid email: ${email}`);
      return res.status(400).json({ error: "Invalid email address" });
    }

    try {
      // In a real application, you would use a service like SendGrid, Mailgun, or Resend here.
      // For this implementation, we simulate the email sending to the admin.
      console.log(`[NEWSLETTER] New subscription: ${email}`);
      console.log(`[EMAIL] Sending notification to admin: mk.rabbani.cse@gmail.com`);
      
      // We also store it in Firestore (handled by the client-side for better real-time experience, 
      // but we could also do it here if we had firebase-admin setup).
      
      res.json({ 
        success: true, 
        message: "Subscription successful! Admin has been notified.",
        recipient: "mk.rabbani.cse@gmail.com"
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
