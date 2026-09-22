const Cart = require("../models/Cart.model");
const Product = require("../models/Product.model");

const populateCart = (cart) => cart.populate({ path: "items.product", select: "name brand price images sizes status discountPercent" });

const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });
    await populateCart(cart);
    res.json(cart);
  } catch (error) { next(error); }
};

const addItem = async (req, res, next) => {
  try {
    const { productId, size, quantity = 1 } = req.body;
    if (!productId || !Number.isFinite(Number(size)) || !Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      return res.status(400).json({ message: "productId, size and a positive integer quantity are required" });
    }
    const product = await Product.findById(productId);
    if (!product || product.status !== "available") return res.status(404).json({ message: "Product is not available" });
    const stockItem = product.sizes.find((item) => item.size === Number(size));
    if (!stockItem) return res.status(400).json({ message: "This size is not available" });

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = new Cart({ user: req.user.id, items: [] });
    const item = cart.items.find((entry) => entry.product.toString() === product.id && entry.size === Number(size));
    const requested = (item?.quantity || 0) + Number(quantity);
    if (requested > stockItem.stock) return res.status(400).json({ message: "Requested quantity exceeds stock" });
    if (item) item.quantity = requested;
    else cart.items.push({ product: product.id, size: Number(size), quantity: Number(quantity) });
    await cart.save();
    await populateCart(cart);
    res.status(201).json(cart);
  } catch (error) { next(error); }
};

const updateItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) return res.status(400).json({ message: "Quantity must be a positive integer" });
    const cart = await Cart.findOne({ user: req.user.id });
    const item = cart?.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Cart item not found" });
    const product = await Product.findById(item.product);
    const stock = product?.sizes.find((entry) => entry.size === item.size)?.stock || 0;
    if (quantity > stock) return res.status(400).json({ message: "Requested quantity exceeds stock" });
    item.quantity = Number(quantity);
    await cart.save();
    await populateCart(cart);
    res.json(cart);
  } catch (error) { next(error); }
};

const removeItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    const item = cart?.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Cart item not found" });
    item.deleteOne();
    await cart.save();
    await populateCart(cart);
    res.json(cart);
  } catch (error) { next(error); }
};

module.exports = { getCart, addItem, updateItem, removeItem };
