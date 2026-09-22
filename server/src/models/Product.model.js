const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: String, required: true },
  sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
  category: {
    type: String,
    enum: ["running", "casual", "basketball", "football", "sandals", "other"],
    default: "casual"
  },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  images: [{ type: String, trim: true }],
  sizes: [{
    size: { type: Number, required: true },
    stock: { type: Number, default: 0, min: 0 }
  }],
  color: { type: String, trim: true },
  isFeatured: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  salesCount: { type: Number, default: 0, min: 0 },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  status: {
    type: String,
    enum: ["available", "out_of_stock", "hidden"],
    default: "available"
  }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
