const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

const authRoutes      = require("./routes/authRoutes");
const recordRoutes    = require("./routes/recordRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes"); // BUG FIX: was never imported or mounted

app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/auth",      authRoutes);
app.use("/api/records",   recordRoutes);
app.use("/api/dashboard", dashboardRoutes); // BUG FIX: was never registered

// Fallback: serve index.html for any non-API route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error"
  });
});

module.exports = app;
