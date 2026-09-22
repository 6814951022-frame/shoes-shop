const express = require("express");
const upload = require("../middlewares/upload.middleware");
const { uploadProductImage } = require("../controllers/upload.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");

const router = express.Router();
router.post("/products", requireAuth, requireRole("admin"), upload.single("image"), uploadProductImage);
module.exports = router;
