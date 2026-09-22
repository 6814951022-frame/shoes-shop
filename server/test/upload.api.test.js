const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");

const token = jwt.sign({ id: "507f1f77bcf86cd799439011", role: "admin" }, process.env.JWT_SECRET || "development-secret-change-me");

test("admin can upload a product image", async () => {
  const response = await request(app).post("/api/uploads/products").set("Authorization", `Bearer ${token}`).attach("image", Buffer.from("not-a-real-image"), { filename: "shoe.png", contentType: "image/png" });
  assert.equal(response.status, 201);
  assert.match(response.body.imageUrl, /^\/uploads\/products\/.+\.png$/);
  const uploadedFile = await request(app).get(response.body.imageUrl);
  assert.equal(uploadedFile.status, 200);
  fs.unlinkSync(path.join(__dirname, "..", response.body.imageUrl));
});

test("normal user cannot upload a product image", async () => {
  const userToken = jwt.sign({ id: "507f1f77bcf86cd799439012", role: "user" }, process.env.JWT_SECRET || "development-secret-change-me");
  const response = await request(app).post("/api/uploads/products").set("Authorization", `Bearer ${userToken}`).attach("image", Buffer.from("x"), { filename: "shoe.png", contentType: "image/png" });
  assert.equal(response.status, 403);
});
