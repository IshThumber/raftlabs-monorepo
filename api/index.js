// Vercel serverless function entry point.
// Vercel auto-detects files in /api/ and serves them as serverless functions.
// All /api/* rewrites land here; Express handles internal routing.
const app = require("../backend/src/app");
module.exports = app;
