const Product = require("../models/Product.model");

const normalizeProductPayload = (body) => {
  const payload = { ...body };
  if (!Object.hasOwn(payload, "sizes")) return payload;
  if (typeof payload.sizes === "string") {
    payload.sizes = payload.sizes.split(",").map((item) => item.trim()).filter(Boolean).map((item) => {
      const [size, stock] = item.trim().split(":");
      return { size: Number(size), stock: Number(stock || 0) };
    });
  }
  if (!Array.isArray(payload.sizes)) payload.sizes = [];
  payload.sizes = payload.sizes
    .filter((item) => item && item.size !== "" && item.size !== null && item.size !== undefined && !Number.isNaN(Number(item.size)))
    .map((item) => ({ size: Number(item.size), stock: Number(item.stock || 0) }));
  return payload;
};

const getProducts = async (req, res, next) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : { status: { $ne: "hidden" } };
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) { next(error); }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) { next(error); }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(normalizeProductPayload(req.body));
    res.status(201).json(product);
  } catch (error) { next(error); }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, normalizeProductPayload(req.body), { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) { next(error); }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(204).send();
  } catch (error) { next(error); }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
