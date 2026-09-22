const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const Product = require("../src/models/Product.model");

const secret = process.env.JWT_SECRET || "development-secret-change-me";
const adminToken = jwt.sign({ id: "507f1f77bcf86cd799439011", role: "admin" }, secret);
const userToken = jwt.sign({ id: "507f1f77bcf86cd799439012", role: "user" }, secret);
const product = { _id: "507f1f77bcf86cd799439013", name: "Air Runner", brand: "Portable", sku: "AIR-001", category: "running", price: 2990, sizes: [{ size: 42, stock: 4 }], status: "available" };
const original = { create: Product.create, findByIdAndUpdate: Product.findByIdAndUpdate, findByIdAndDelete: Product.findByIdAndDelete };

test.after(() => Object.assign(Product, original));

test("normal user cannot create a product", async () => {
  const response = await request(app).post("/api/products").set("Authorization", `Bearer ${userToken}`).send(product);
  assert.equal(response.status, 403);
});

test("admin can create a shoe product", async () => {
  Product.create = async (payload) => ({ ...product, ...payload });
  const response = await request(app).post("/api/products").set("Authorization", `Bearer ${adminToken}`).send(product);
  assert.equal(response.status, 201);
  assert.equal(response.body.sku, "AIR-001");
});

test("admin can create a product without sizes", async () => {
  let created;
  Product.create = async (payload) => { created = payload; return { ...product, ...payload }; };
  const response = await request(app).post("/api/products").set("Authorization", `Bearer ${adminToken}`).send({ ...product, sku: "NO-SIZES", sizes: "" });
  assert.equal(response.status, 201);
  assert.deepEqual(created.sizes, []);
});

test("admin can edit a shoe product", async () => {
  Product.findByIdAndUpdate = async (id, payload) => id === product._id ? { ...product, ...payload } : null;
  const response = await request(app).put(`/api/products/${product._id}`).set("Authorization", `Bearer ${adminToken}`).send({ price: 3190, stock: 7 });
  assert.equal(response.status, 200);
  assert.equal(response.body.price, 3190);
});

test("admin can delete a shoe product", async () => {
  Product.findByIdAndDelete = async (id) => id === product._id ? product : null;
  const response = await request(app).delete(`/api/products/${product._id}`).set("Authorization", `Bearer ${adminToken}`);
  assert.equal(response.status, 204);
});
