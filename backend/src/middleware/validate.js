const menuItems = require("../data/menu");

const menuItemIds = new Set(menuItems.map((i) => i.id));

// Stricter phone regex: requires actual digits, allows common formats
// Examples: +1-234-567-8900, (234) 567-8900, +91 9876543210, 2345678900
const phoneRegex = /^\+?[\d\s\-().]{0,5}[\d]{7,15}[\d\s\-().]{0,5}$/;

function validateOrder(req, res, next) {
  const { customerName, address, phone, items } = req.body;

  const errors = [];

  if (!customerName || typeof customerName !== "string" || customerName.trim().length < 2) {
    errors.push({ field: "customerName", message: "Must be at least 2 characters" });
  }

  if (!address || typeof address !== "string" || address.trim().length < 5) {
    errors.push({ field: "address", message: "Must be at least 5 characters" });
  }

  if (!phone || typeof phone !== "string") {
    errors.push({ field: "phone", message: "Phone number is required" });
  } else if (!phoneRegex.test(phone) || phone.replace(/\D/g, "").length < 7) {
    errors.push({ field: "phone", message: "Must be a valid phone number (7-15 digits)" });
  }

  if (!Array.isArray(items) || items.length === 0) {
    errors.push({ field: "items", message: "Must be a non-empty array" });
  } else {
    items.forEach((item, idx) => {
      if (!item.itemId || !menuItemIds.has(item.itemId)) {
        errors.push({ field: `items[${idx}].itemId`, message: "Invalid menu item ID" });
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        errors.push({ field: `items[${idx}].quantity`, message: "Must be a positive integer" });
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: errors,
      },
    });
  }

  next();
}

module.exports = { validateOrder };
