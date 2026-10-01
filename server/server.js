import app from './app.js';
import { createServer } from 'node:http';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { configureSockets } from './sockets/index.js';

async function start() {
  try {
    await connectDatabase();
    const httpServer = createServer(app);
    configureSockets(httpServer, env.clientUrl);
    httpServer.listen(env.port, () => console.info(`API and Socket.IO listening on port ${env.port}`));
  } catch (error) {
    console.error('Unable to start API:', error);
    process.exit(1);
  }
}
start();
