const uploadProductImage = (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Image file is required" });
  res.status(201).json({ imageUrl: `/uploads/products/${req.file.filename}` });
};

module.exports = { uploadProductImage };
