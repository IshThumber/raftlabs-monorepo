const request = require("supertest");
const app = require("../src/app");

describe("GET /api/menu", () => {
  it("returns 200 with an array of menu items", async () => {
    const res = await request(app).get("/api/menu");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("each item has required fields", async () => {
    const res = await request(app).get("/api/menu");
    res.body.forEach((item) => {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("description");
      expect(item).toHaveProperty("price");
      expect(item).toHaveProperty("image");
      expect(item).toHaveProperty("category");
      expect(typeof item.price).toBe("number");
    });
  });

  it("filters by category when query param is provided", async () => {
    const res = await request(app).get("/api/menu?category=Pizza");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach((item) => {
      expect(item.category.toLowerCase()).toBe("pizza");
    });
  });

  it("returns empty array for unknown category", async () => {
    const res = await request(app).get("/api/menu?category=Sushi");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("GET /api/menu/:id", () => {
  it("returns a single item by id", async () => {
    const res = await request(app).get("/api/menu/item-1");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("item-1");
    expect(res.body.name).toBe("Margherita Pizza");
  });

  it("returns 404 for unknown item id", async () => {
    const res = await request(app).get("/api/menu/item-999");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});
