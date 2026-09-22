const express = require("express");
const { register, login, getMe, createAdmin, adminDashboard } = require("../controllers/auth.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, getMe);
router.post("/admin/users", requireAuth, requireRole("admin"), createAdmin);
router.get("/admin/dashboard", requireAuth, requireRole("admin"), adminDashboard);

module.exports = router;
