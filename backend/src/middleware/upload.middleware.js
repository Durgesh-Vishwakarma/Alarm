import multer from 'multer';

const storage = multer.memoryStorage();

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export const uploadLiveCapture = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || !ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(new Error("Unsupported image format. Please upload JPEG, PNG, or WebP."));
    }
    cb(null, true);
  },
});

