const multer = require("multer");

const imageFileFilter = (req, file, callback) => {
  if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) return callback(null, true);
  callback(new Error("Only JPG, PNG and WebP images are allowed"));
};

// Vercel Functions accept request bodies smaller than 4.5 MB.
module.exports = multer({ storage: multer.memoryStorage(), fileFilter: imageFileFilter, limits: { fileSize: 4 * 1024 * 1024 } });
