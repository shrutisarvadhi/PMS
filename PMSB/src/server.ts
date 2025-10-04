import app from './app';
import { appConfig } from './config/env';
import { connectDatabase, sequelize } from './config/database';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    await connectDatabase();  // call the function to connect

    // Sync all models
    await sequelize.sync({ alter: true });
    app.listen(appConfig.port, () => {
      logger.info(`Server listening on port ${appConfig.port}`);
      console.log(`Server listening on port ${appConfig.port}`);

    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  void startServer();
}

export { startServer };
export default app;
