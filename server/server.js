import { createServer } from 'node:http';
import app from './app.js';
import { env } from './src/configs/env.js';
import { logger } from './src/configs/logger.js';
import { prisma } from './src/configs/prisma.js';

const server = createServer(app);

async function start() {
  try {
    await prisma.$connect();
    logger.info('Database connected');

    server.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.info(`${signal} received, shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  logger.error(err, 'Uncaught exception');
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.error(reason, 'Unhandled rejection');
  process.exit(1);
});

start();
