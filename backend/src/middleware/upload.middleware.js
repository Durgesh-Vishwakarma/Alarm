import multer from 'multer';

const storage = multer.memoryStorage();

export const uploadLiveCapture = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error('Only live camera image uploads are accepted.'));
      return;
    }
    cb(null, true);
  },
});
