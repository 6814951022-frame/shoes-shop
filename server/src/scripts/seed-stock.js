require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product.model");

const defaultSizes = [7, 8, 9, 10, 11].map((size) => ({ size, stock: 5 }));

async function seedStock() {
  if (!process.env.MONGO_URI) throw new Error("Set MONGO_URI before seeding stock");
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find({ status: "available" });
  let updated = 0;

  for (const product of products) {
    if (!product.sizes.length) {
      product.sizes = defaultSizes;
    } else {
      product.sizes = product.sizes.map((item) => ({
        size: item.size,
        stock: item.stock > 0 ? item.stock : 5,
      }));
    }
    await product.save();
    updated += 1;
  }

  console.log(`Stock added for ${updated} available product(s).`);
  await mongoose.disconnect();
}

seedStock().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
