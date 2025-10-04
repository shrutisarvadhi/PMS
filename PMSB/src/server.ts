import app from './app';
import { appConfig } from './config/env';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(appConfig.port, () => {
      logger.info(`Server listening on port ${appConfig.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

if (require.main === module) {
  void startServer();
}

export { startServer };
export default app;
