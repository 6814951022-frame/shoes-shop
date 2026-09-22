const Product = require("../models/Product.model");

const getHome = async (req, res, next) => {
  try {
    const products = await Product.find({ status: "available" });
    const newest = [...products].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const featured = newest.filter((product) => product.isFeatured).slice(0, 4);
    const popular = newest.filter((product) => product.isPopular).sort((a, b) => b.salesCount - a.salesCount).slice(0, 4);
    res.json({
      hero: { title: "Step into your next adventure", subtitle: "รองเท้าที่พร้อมไปกับทุกก้าวของคุณ" },
      featured: featured.length ? featured : newest.slice(0, 4),
      popular: popular.length ? popular : newest.slice(0, 4),
      products: newest.slice(0, 12),
    });
  } catch (error) { next(error); }
};

module.exports = { getHome };
