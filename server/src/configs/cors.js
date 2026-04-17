import { env } from './env.js';

const allowedOrigins = env.FRONTEND_URL
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

export const corsOptions = {
  origin(origin, cb) {
    // allow server-to-server (no origin) + any listed origin
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
