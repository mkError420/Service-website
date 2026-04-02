import express from "express";
import serverless from "serverless-http";
import dotenv from "dotenv";

dotenv.config();

const app = express();

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
