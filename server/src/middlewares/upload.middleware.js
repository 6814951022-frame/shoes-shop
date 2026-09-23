const multer = require("multer");

const imageFileFilter = (req, file, callback) => {
  if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) return callback(null, true);
  const error = new Error("Only JPG, PNG and WebP images are allowed");
  error.status = 400;
  callback(error);
};

// Vercel Functions have a 4.5 MB request-body limit. Files are kept only in
// memory for the duration of the request, then written to Vercel Blob.
module.exports = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFileFilter,
  limits: { fileSize: 4 * 1024 * 1024 },
});
