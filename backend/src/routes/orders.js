const express = require("express");
const menuItems = require("../data/menu");
const store = require("../store/orders");
const { validateOrder } = require("../middleware/validate");

const router = express.Router();

// POST /api/orders — place a new order
router.post("/", validateOrder, (req, res, next) => {
  try {
    const { customerName, address, phone, items } = req.body;

    // Enrich items with menu data (name, price) — don't trust client for price
    const enrichedItems = items.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.itemId);
      if (!menuItem) {
        throw new Error(`Menu item "${item.itemId}" not found`);
      }
      // Use integer cents to avoid floating-point precision issues
      const priceCents = Math.round(menuItem.price * 100);
      const subtotalCents = priceCents * item.quantity;
      return {
        itemId: item.itemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        subtotal: subtotalCents / 100,
      };
    });

    // Calculate total in cents, then convert back to dollars
    const totalCents = enrichedItems.reduce((sum, i) => sum + Math.round(i.subtotal * 100), 0);
    const total = totalCents / 100;

    const order = store.createOrder({
      customerName: customerName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      items: enrichedItems,
      total,
    });

    store.startStatusProgression(order.id);

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id — get order by id
router.get("/:id", (req, res) => {
  const order = store.getOrder(req.params.id);
  if (!order) {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "Order not found" },
    });
  }
  res.json(order);
});

// PATCH /api/orders/:id/status — manually advance status (used in tests / admin)
router.patch("/:id/status", (req, res) => {
  const order = store.getOrder(req.params.id);
  if (!order) {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "Order not found" },
    });
  }

  if (order.statusIndex >= store.ORDER_STATUSES.length - 1) {
    return res.status(400).json({
      error: { code: "INVALID_STATE", message: "Order is already in final status: Delivered" },
    });
  }

  const updated = store.advanceStatus(req.params.id);
  store.broadcastStatus(req.params.id);
  res.json(updated);
});

// GET /api/orders/:id/stream — SSE real-time status stream
router.get("/:id/stream", (req, res) => {
  const order = store.getOrder(req.params.id);
  if (!order) {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "Order not found" },
    });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
  res.flushHeaders();

  // Send current status immediately on connect
  try {
    const initial = JSON.stringify({ status: order.status, statusIndex: order.statusIndex });
    res.write(`data: ${initial}\n\n`);
  } catch (e) {
    return res.end();
  }

  store.addSseClient(req.params.id, res);

  req.on("close", () => {
    store.removeSseClient(req.params.id, res);
  });

  // Handle write errors gracefully
  res.on("error", (err) => {
    console.error(`SSE stream error for order ${req.params.id}:`, err.message);
    store.removeSseClient(req.params.id, res);
  });
});

module.exports = router;
