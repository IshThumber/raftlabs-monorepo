const { v4: uuidv4 } = require("uuid");

const ORDER_STATUSES = ["Order Received", "Preparing", "Out for Delivery", "Delivered"];

// In-memory store
const orders = {};

// Active SSE clients: { [orderId]: [res, res, ...] }
const sseClients = {};

// Active timers: { [orderId]: timeoutId }
const statusTimers = {};

function createOrder({ customerName, address, phone, items, total }) {
  const id = uuidv4();
  orders[id] = {
    id,
    customerName,
    address,
    phone,
    items, // [{ itemId, name, price, quantity }]
    total,
    status: ORDER_STATUSES[0],
    statusIndex: 0,
    createdAt: new Date().toISOString(),
  };
  return orders[id];
}

function getOrder(id) {
  return orders[id] || null;
}

function advanceStatus(id) {
  const order = orders[id];
  if (!order) return null;
  if (order.statusIndex >= ORDER_STATUSES.length - 1) return order; // already delivered

  order.statusIndex += 1;
  order.status = ORDER_STATUSES[order.statusIndex];
  return order;
}

function getAllOrders() {
  return Object.values(orders);
}

// SSE helpers
function addSseClient(orderId, res) {
  if (!sseClients[orderId]) sseClients[orderId] = [];
  sseClients[orderId].push(res);
}

function removeSseClient(orderId, res) {
  if (!sseClients[orderId]) return;
  sseClients[orderId] = sseClients[orderId].filter((c) => c !== res);
}

function broadcastStatus(orderId) {
  const order = orders[orderId];
  if (!order || !sseClients[orderId]) return;
  const data = JSON.stringify({ status: order.status, statusIndex: order.statusIndex });
  sseClients[orderId].forEach((res) => {
    try {
      res.write(`data: ${data}\n\n`);
    } catch (e) {
      // Client disconnected, remove from list
      removeSseClient(orderId, res);
    }
  });
}

// Auto-advance status every 7 seconds after order placement
function startStatusProgression(orderId) {
  const INTERVAL_MS = 7000;

  const tick = () => {
    const order = advanceStatus(orderId);
    if (!order) return;
    broadcastStatus(orderId);
    if (order.statusIndex < ORDER_STATUSES.length - 1) {
      statusTimers[orderId] = setTimeout(tick, INTERVAL_MS);
    } else {
      // Order is Delivered - cleanup timers and SSE clients
      delete statusTimers[orderId];
      cleanupOrder(orderId);
    }
  };

  statusTimers[orderId] = setTimeout(tick, INTERVAL_MS);
}

// Cleanup SSE clients for an order
function cleanupOrder(orderId) {
  if (sseClients[orderId]) {
    sseClients[orderId].forEach((res) => {
      try {
        res.end();
      } catch (e) {
        // Ignore errors from already-closed connections
      }
    });
    delete sseClients[orderId];
  }
}

function clearAllTimers() {
  Object.values(statusTimers).forEach(clearTimeout);
  Object.keys(statusTimers).forEach((k) => delete statusTimers[k]);
}

// Expose for testing
function _reset() {
  Object.keys(orders).forEach((k) => delete orders[k]);
  Object.keys(sseClients).forEach((k) => delete sseClients[k]);
  clearAllTimers();
}

module.exports = {
  ORDER_STATUSES,
  createOrder,
  getOrder,
  advanceStatus,
  getAllOrders,
  addSseClient,
  removeSseClient,
  broadcastStatus,
  startStatusProgression,
  cleanupOrder,
  clearAllTimers,
  _reset,
};
