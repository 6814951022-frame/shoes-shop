const express = require("express");
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require("../controllers/product.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");

const router = express.Router();
router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", requireAuth, requireRole("admin"), createProduct);
router.put("/:id", requireAuth, requireRole("admin"), updateProduct);
router.delete("/:id", requireAuth, requireRole("admin"), deleteProduct);

module.exports = router;
