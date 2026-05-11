import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import os from 'os';

import { verifyRouter } from './routes/verify.routes.js';

const app = express();

const port = Number(process.env.PORT || 4000);

// =====================================================
// Environment validation
// =====================================================

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    'WARNING: GEMINI_API_KEY is missing.'
  );
}

// =====================================================
// Security middleware
// =====================================================

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
  })
);

// =====================================================
// Body parsers
// =====================================================

app.use(
  express.json({
    limit: '2mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '2mb',
  })
);

// =====================================================
// Health route
// =====================================================

app.get('/health', (_req, res) => {
  return res.status(200).json({
    ok: true,
    service: 'snapwake-ai',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// API routes
// =====================================================

app.use('/api/verify', verifyRouter);

// =====================================================
// Unknown routes
// =====================================================

app.use((_req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

// =====================================================
// Global error handler
// =====================================================

app.use((error, _req, res, _next) => {
  console.error(
    'Global Express Error:',
    error
  );

  // Multer file size error
  if (
    error?.code === 'LIMIT_FILE_SIZE'
  ) {
    return res.status(413).json({
      success: false,
      message:
        'Uploaded image exceeds size limit.',
    });
  }

  // Multer/general upload errors
  if (
    error?.message?.includes('upload')
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV ===
      'development'
        ? error.message
        : 'Internal server error',
    });
});

// =====================================================
// Start server
// =====================================================

const server = app.listen(
  port,
  '0.0.0.0',
  () => {
    console.log(
      `\nSnapWake AI backend running on port ${port}\n`
    );

    // Print local network URLs
    Object.values(
      os.networkInterfaces()
    )
      .flat()
      .filter(
        (entry) =>
          entry?.family === 'IPv4' &&
          !entry.internal
      )
      .forEach((entry) => {
        console.log(
          `Phone/dev-client URL: http://${entry.address}:${port}`
        );
      });

    console.log('');
  }
);

// =====================================================
// Graceful shutdown
// =====================================================

const shutdown = () => {
  console.log(
    '\nShutting down SnapWake backend...'
  );

  server.close(() => {
    console.log(
      'HTTP server closed.'
    );

    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

