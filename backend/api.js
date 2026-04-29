// Vercel serverless entry point.
// Exports the Express app WITHOUT calling app.listen() —
// Vercel's @vercel/node adapter handles the HTTP lifecycle.
module.exports = require("./src/app");
