const express = require("express");
const { requireAuth } = require("../middlewares/auth.middleware");
const { getCart, addItem, updateItem, removeItem } = require("../controllers/cart.controller");

const router = express.Router();
router.use(requireAuth);
router.route("/").get(getCart).post(addItem);
router.route("/:itemId").patch(updateItem).delete(removeItem);

module.exports = router;
