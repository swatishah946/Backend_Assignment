import dotenv from 'dotenv';
import app from './app.js';
import { prisma } from './config/db.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[SERVER] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  console.log(`[SERVER] Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('[SERVER] Express server closed.');
    await prisma.$disconnect();
    console.log('[DATABASE] Prisma client disconnected.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION] at:', promise, 'reason:', reason);
  // Log error but don't shut down for non-fatal promises, or shut down if critical
});

process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]:', error);
  process.exit(1);
});
