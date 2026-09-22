const path = require("path");
const blob = require("@vercel/blob");

const uploadProductImage = async (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: "Image file is required" });
  try {
    const extension = path.extname(req.file.originalname).toLowerCase();
    const uploadedBlob = await blob.put(`products/product${extension}`, req.file.buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: req.file.mimetype,
    });
    res.status(201).json({ imageUrl: uploadedBlob.url });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadProductImage };
