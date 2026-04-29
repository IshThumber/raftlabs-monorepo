const express = require("express");
const menuItems = require("../data/menu");

const router = express.Router();

// GET /api/menu
router.get("/", (req, res) => {
  const { category } = req.query;

  if (category) {
    const filtered = menuItems.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase()
    );
    return res.json(filtered);
  }

  res.json(menuItems);
});

// GET /api/menu/:id
router.get("/:id", (req, res) => {
  const item = menuItems.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Menu item not found" });
  res.json(item);
});

module.exports = router;
