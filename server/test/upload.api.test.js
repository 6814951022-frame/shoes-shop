const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const blob = require("@vercel/blob");
const app = require("../src/app");

const token = jwt.sign({ id: "507f1f77bcf86cd799439011", role: "admin" }, process.env.JWT_SECRET || "development-secret-change-me");
process.env.BLOB_READ_WRITE_TOKEN ||= "test-blob-token";

test("admin can upload a product image", async (t) => {
  t.mock.method(blob, "put", async (pathname, body, options) => {
    assert.equal(pathname, "products/product.png");
    assert.deepEqual(body, Buffer.from("not-a-real-image"));
    assert.equal(options.contentType, "image/png");
    return { url: "https://example.public.blob.vercel-storage.com/products/product.png" };
  });
  const response = await request(app).post("/api/uploads/products").set("Authorization", `Bearer ${token}`).attach("image", Buffer.from("not-a-real-image"), { filename: "shoe.png", contentType: "image/png" });
  assert.equal(response.status, 201);
  assert.equal(response.body.imageUrl, "https://example.public.blob.vercel-storage.com/products/product.png");
});

test("normal user cannot upload a product image", async () => {
  const userToken = jwt.sign({ id: "507f1f77bcf86cd799439012", role: "user" }, process.env.JWT_SECRET || "development-secret-change-me");
  const response = await request(app).post("/api/uploads/products").set("Authorization", `Bearer ${userToken}`).attach("image", Buffer.from("x"), { filename: "shoe.png", contentType: "image/png" });
  assert.equal(response.status, 403);
});
