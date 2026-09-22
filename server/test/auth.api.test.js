const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const User = require("../src/models/User1.model");

const originalFindOne = User.findOne;
const originalCreate = User.create;

test.after(() => {
  User.findOne = originalFindOne;
  User.create = originalCreate;
});

test("POST /api/auth/register creates a normal user even when admin is supplied", async () => {
  let created;
  User.findOne = async () => null;
  User.create = async (payload) => {
    created = payload;
    return { ...payload, _id: "507f1f77bcf86cd799439011", createdAt: new Date() };
  };
  const response = await request(app).post("/api/auth/register").send({ name: "Nok", email: "NOK@EXAMPLE.COM", password: "password123", role: "admin" });
  assert.equal(response.status, 201);
  assert.equal(created.role, "user");
  assert.equal(created.email, "nok@example.com");
  assert.ok(await bcrypt.compare("password123", created.password));
  assert.equal(response.body.user.role, "user");
});

test("POST /api/auth/login returns token for correct credentials", async () => {
  const password = await bcrypt.hash("password123", 4);
  User.findOne = async () => ({ _id: "507f1f77bcf86cd799439011", name: "Admin", email: "admin@example.com", password, role: "admin" });
  const response = await request(app).post("/api/auth/login").send({ email: "admin@example.com", password: "password123" });
  assert.equal(response.status, 200);
  assert.equal(response.body.user.role, "admin");
  assert.equal(jwt.verify(response.body.token, process.env.JWT_SECRET || "development-secret-change-me").role, "admin");
});

test("admin endpoint rejects normal-user token", async () => {
  const token = jwt.sign({ id: "507f1f77bcf86cd799439011", role: "user" }, process.env.JWT_SECRET || "development-secret-change-me");
  const response = await request(app).get("/api/auth/admin/dashboard").set("Authorization", `Bearer ${token}`);
  assert.equal(response.status, 403);
});
