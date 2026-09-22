const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../src/app");
const Product = require("../src/models/Product.model");

const originalFind = Product.find;
test.after(() => { Product.find = originalFind; });

test("GET /api/home returns only available shoes and featured products", async () => {
  Product.find = async () => [
    { _id: "1", name: "Daily Run", status: "available", isFeatured: true, isPopular: true, salesCount: 10, createdAt: "2026-01-02" },
    { _id: "2", name: "Street Low", status: "available", isFeatured: false, createdAt: "2026-01-01" },
  ];
  const response = await request(app).get("/api/home");
  assert.equal(response.status, 200);
  assert.equal(response.body.hero.title, "Step into your next adventure");
  assert.equal(response.body.products.length, 2);
  assert.equal(response.body.featured[0].name, "Daily Run");
  assert.equal(response.body.popular[0].name, "Daily Run");
});
