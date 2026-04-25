import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { chatRouter } from './routes/chat.js';
import { agentsRouter } from './routes/agents.js';
import { draftRouter } from './routes/draft.js';
import { translateRouter } from './routes/translate.js';
import { dataRouter } from './routes/data.js';
import { uploadRouter } from './routes/upload.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({ windowMs: 60_000, max: 60, message: { error: 'Too many requests.' } });
app.use('/api', limiter);

app.use('/api/chat', chatRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/draft', draftRouter);
app.use('/api/translate', translateRouter);
app.use('/api/data', dataRouter);
app.use('/api/upload', uploadRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'NyayaSahaya' }));

app.listen(PORT, () => {
  console.log(`\n⚖️  NyayaSahaya API → http://localhost:${PORT}\n`);
});
