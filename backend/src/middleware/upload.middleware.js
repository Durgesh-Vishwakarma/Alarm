import multer from 'multer';

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

const blockedMimeTypes = [
  'image/gif',
];

export const uploadLiveCapture = multer({
  storage,

  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1,
  },

  fileFilter: (_req, file, cb) => {
    try {
      // Reject missing mimetype
      if (!file.mimetype) {
        return cb(
          new Error('Invalid upload format.')
        );
      }

      // Reject non-images
      if (!file.mimetype.startsWith('image/')) {
        return cb(
          new Error('Only image uploads are allowed.')
        );
      }

      // Reject blocked image types
      if (
        blockedMimeTypes.includes(file.mimetype)
      ) {
        return cb(
          new Error(
            'GIF uploads are not supported.'
          )
        );
      }

      // Reject unsupported image types
      if (
        !allowedMimeTypes.includes(file.mimetype)
      ) {
        return cb(
          new Error(
            'Unsupported image format.'
          )
        );
      }

      // Accept upload
      cb(null, true);

    } catch (error) {
      cb(
        error instanceof Error
          ? error
          : new Error('Upload validation failed.')
      );
    }
  },
});

