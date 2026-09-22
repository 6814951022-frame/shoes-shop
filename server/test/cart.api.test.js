const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("../src/app");
const Cart = require("../src/models/Cart.model");
const Product = require("../src/models/Product.model");

const token = jwt.sign({ id: "507f1f77bcf86cd799439011", role: "user" }, process.env.JWT_SECRET || "development-secret-change-me");
const product = { id: "507f1f77bcf86cd799439012", status: "available", sizes: [{ size: 42, stock: 3 }] };
const original = { findOne: Cart.findOne, create: Cart.create, findById: Product.findById };
test.after(() => Object.assign(Cart, original) && (Product.findById = original.findById));

test("cart requires authentication", async () => {
  const response = await request(app).get("/api/cart");
  assert.equal(response.status, 401);
});

test("user can add an in-stock product size to cart", async () => {
  let saved = false;
  const cart = { items: [], save: async () => { saved = true; }, populate: async () => cart };
  Cart.findOne = async () => cart;
  Product.findById = async () => product;
  const response = await request(app).post("/api/cart").set("Authorization", `Bearer ${token}`).send({ productId: product.id, size: 42, quantity: 2 });
  assert.equal(response.status, 201);
  assert.equal(saved, true);
  assert.equal(cart.items[0].quantity, 2);
});

test("cart rejects quantity beyond product stock", async () => {
  Cart.findOne = async () => null;
  Cart.create = async () => ({ items: [], save: async () => {}, populate: async function () { return this; } });
  Product.findById = async () => product;
  const response = await request(app).post("/api/cart").set("Authorization", `Bearer ${token}`).send({ productId: product.id, size: 42, quantity: 4 });
  assert.equal(response.status, 400);
});
