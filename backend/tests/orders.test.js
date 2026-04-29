const request = require("supertest");
const app = require("../src/app");
const store = require("../src/store/orders");

// Reset store before each test to avoid state bleed
beforeEach(() => store._reset());
afterAll(() => store.clearAllTimers());

const validPayload = {
  customerName: "Ish Kumar",
  address: "123 MG Road, Hyderabad",
  phone: "9876543210",
  items: [
    { itemId: "item-1", quantity: 2 },
    { itemId: "item-2", quantity: 1 },
  ],
};

// ─── POST /api/orders ─────────────────────────────────────────────────────────

describe("POST /api/orders", () => {
  it("creates an order and returns 201 with correct shape", async () => {
    const res = await request(app).post("/api/orders").send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.customerName).toBe("Ish Kumar");
    expect(res.body.status).toBe("Order Received");
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items[0]).toHaveProperty("name");
    expect(res.body.items[0]).toHaveProperty("price");
    expect(res.body.items[0]).toHaveProperty("subtotal");
  });

  it("calculates total price server-side", async () => {
    const res = await request(app).post("/api/orders").send(validPayload);
    // item-1: 12.99 * 2 = 25.98, item-2: 10.49 * 1 = 10.49 → total = 36.47
    expect(res.body.total).toBeCloseTo(36.47, 2);
  });

  it("returns 400 when customerName is missing", async () => {
    const { customerName, ...rest } = validPayload;
    const res = await request(app).post("/api/orders").send(rest);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("details");
  });

  it("returns 400 when address is too short", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validPayload, address: "Hi" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when phone is invalid", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validPayload, phone: "abc" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when items array is empty", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validPayload, items: [] });
    expect(res.status).toBe(400);
  });

  it("returns 400 when item quantity is 0", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validPayload, items: [{ itemId: "item-1", quantity: 0 }] });
    expect(res.status).toBe(400);
  });

  it("returns 400 when itemId does not exist in menu", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validPayload, items: [{ itemId: "item-999", quantity: 1 }] });
    expect(res.status).toBe(400);
  });
});

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────

describe("GET /api/orders/:id", () => {
  it("returns the order for a valid id", async () => {
    const created = await request(app).post("/api/orders").send(validPayload);
    const orderId = created.body.id;

    const res = await request(app).get(`/api/orders/${orderId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(orderId);
  });

  it("returns 404 for a non-existent order id", async () => {
    const res = await request(app).get("/api/orders/non-existent-id");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});

// ─── PATCH /api/orders/:id/status ────────────────────────────────────────────

describe("PATCH /api/orders/:id/status", () => {
  it("advances status from Order Received to Preparing", async () => {
    const created = await request(app).post("/api/orders").send(validPayload);
    const orderId = created.body.id;

    const res = await request(app).patch(`/api/orders/${orderId}/status`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Preparing");
    expect(res.body.statusIndex).toBe(1);
  });

  it("advances through all statuses correctly", async () => {
    const created = await request(app).post("/api/orders").send(validPayload);
    const orderId = created.body.id;

    await request(app).patch(`/api/orders/${orderId}/status`); // Preparing
    await request(app).patch(`/api/orders/${orderId}/status`); // Out for Delivery
    const res = await request(app).patch(`/api/orders/${orderId}/status`); // Delivered

    expect(res.body.status).toBe("Delivered");
    expect(res.body.statusIndex).toBe(3);
  });

  it("returns 400 when order is already Delivered", async () => {
    const created = await request(app).post("/api/orders").send(validPayload);
    const orderId = created.body.id;

    // Advance to final status
    await request(app).patch(`/api/orders/${orderId}/status`);
    await request(app).patch(`/api/orders/${orderId}/status`);
    await request(app).patch(`/api/orders/${orderId}/status`);

    const res = await request(app).patch(`/api/orders/${orderId}/status`);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/final status/i);
  });

  it("returns 404 for unknown order id", async () => {
    const res = await request(app).patch("/api/orders/bogus-id/status");
    expect(res.status).toBe(404);
  });
});
