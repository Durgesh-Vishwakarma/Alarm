import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { verifyRouter } from './routes/verify.routes.js';

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'snapwake-ai' });
});

app.use('/api/verify', verifyRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ success: false, message: error.message || 'Internal server error' });
});

app.listen(port, () => {
  console.log(`SnapWake AI backend listening on http://localhost:${port}`);
});
