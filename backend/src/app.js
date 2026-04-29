const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const menuRouter = require("./routes/menu");
const ordersRouter = require("./routes/orders");

const app = express();

// CORS: Restrict to specific origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").filter(Boolean) || ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS policy rejected origin: ${origin}`));
    },
    credentials: true,
  }),
);

// Rate limiting: Prevent brute-force and DoS
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

// Stricter limit for order creation (prevent spam)
const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 orders per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many order attempts, please try again later" },
});

if (process.env.NODE_ENV !== "test") {
  app.use("/api/", limiter);
  app.use("/api/orders", orderLimiter);
}

app.use(express.json());

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Routes
app.use("/api/menu", menuRouter);
app.use("/api/orders", ordersRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Handle known validation errors from order creation
  if (err.message && err.message.startsWith("Menu item")) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: err.message,
      },
    });
  }

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
});

module.exports = app;
