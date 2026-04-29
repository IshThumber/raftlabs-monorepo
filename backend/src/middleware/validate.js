const menuItems = require("../data/menu");

const menuItemIds = new Set(menuItems.map((i) => i.id));

function validateOrder(req, res, next) {
  const { customerName, address, phone, items } = req.body;

  const errors = [];

  if (!customerName || typeof customerName !== "string" || customerName.trim().length < 2) {
    errors.push("customerName must be at least 2 characters");
  }

  if (!address || typeof address !== "string" || address.trim().length < 5) {
    errors.push("address must be at least 5 characters");
  }

  const phoneRegex = /^\+?[\d\s\-()]{7,15}$/;
  if (!phone || !phoneRegex.test(phone)) {
    errors.push("phone must be a valid phone number (7–15 digits)");
  }

  if (!Array.isArray(items) || items.length === 0) {
    errors.push("items must be a non-empty array");
  } else {
    items.forEach((item, idx) => {
      if (!item.itemId || !menuItemIds.has(item.itemId)) {
        errors.push(`items[${idx}].itemId is invalid`);
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        errors.push(`items[${idx}].quantity must be a positive integer`);
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  next();
}

module.exports = { validateOrder };
