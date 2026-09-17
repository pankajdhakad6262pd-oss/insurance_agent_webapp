import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { config } from './config/env';

const startServer = async () => {
  await connectDatabase();

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`
======================================================
  INSURANCE AGENT PLATFORM - API SERVER RUNNING
  Port:        http://localhost:${config.port}
  Health:      http://localhost:${config.port}/api/health
  Environment: ${config.nodeEnv}
  Client:      ${config.clientUrl}
======================================================
    `);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      await disconnectDatabase();
      console.log('[Server] Graceful shutdown complete. Process exiting.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

startServer();

