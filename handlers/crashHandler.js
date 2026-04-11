const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const logDir = path.join(__dirname, '../logs');
  fs.mkdirSync(logDir, { recursive: true });

  function logErrorToFile(error) {
    const timestamp = new Date().toISOString();
    const date = timestamp.slice(0, 10);

    const logFile = path.join(logDir, `${date}-errors.log`);
    const logMessage = `[${timestamp}] ${error?.stack || error}\n\n`;

    fs.appendFileSync(logFile, logMessage, 'utf8');
  }

  // 💥 SAFE GLOBAL ERROR HANDLERS
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    logErrorToFile(err);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    logErrorToFile(reason instanceof Error ? reason : new Error(reason));
  });

  // 💥 DISCORD CLIENT ERRORS
  client.on('error', (error) => {
    console.error('Discord Client Error:', error);
    logErrorToFile(error);
  });

  // 💥 SHARD ERROR (FIXED)
  client.on('shardError', (error) => {
    console.error('Shard Error:', error);
    logErrorToFile(error);
  });

  // 💥 SAFE SHUTDOWN
  process.on('SIGINT', () => {
    console.log('Bot shutting down (SIGINT)...');
    client.destroy();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('Bot shutting down (SIGTERM)...');
    client.destroy();
    process.exit(0);
  });
};
