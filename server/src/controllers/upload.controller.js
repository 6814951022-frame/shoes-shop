const path = require("path");
const blob = require("@vercel/blob");

const extensionByMimeType = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const uploadProductImage = async (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: "Image file is required" });
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ message: "File uploads are not configured. Set BLOB_READ_WRITE_TOKEN." });
  }

  try {
    const extension = extensionByMimeType[req.file.mimetype] || path.extname(req.file.originalname).toLowerCase();
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
