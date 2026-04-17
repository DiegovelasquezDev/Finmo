import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import { pinoHttp } from 'pino-http';
import { logger } from './src/configs/logger.js';
import { corsOptions } from './src/configs/cors.js';
import { generalLimiter } from './src/configs/rate-limit.js';
import { errorHandler } from './src/middlewares/error-handler.js';
import { notFoundHandler } from './src/middlewares/not-found.js';
import mainRouter from './main.routes.js';

const app = express();

// Security
app.use(helmet());
app.use(cors(corsOptions));
app.use(hpp());
app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

// Logging
app.use(pinoHttp({ logger }));

// Routes
app.use('/api', mainRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
