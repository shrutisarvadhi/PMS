"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const logger_1 = require("./utils/logger");
const startServer = async () => {
    try {
        await (0, database_1.connectDatabase)(); // call the function to connect
        // Sync all models
        await database_1.sequelize.sync({ alter: true });
        app_1.default.listen(env_1.appConfig.port, () => {
            logger_1.logger.info(`Server listening on port ${env_1.appConfig.port}`);
            console.log(`Server listening on port ${env_1.appConfig.port}`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server', { error });
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
exports.startServer = startServer;
if (require.main === module) {
    void startServer();
}
exports.default = app_1.default;
