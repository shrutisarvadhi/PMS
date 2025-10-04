"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = exports.models = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const env_1 = require("./env");
const models_1 = require("../models");
const { database } = env_1.appConfig;
exports.sequelize = database.url
    ? new sequelize_1.Sequelize(database.url, {
        dialect: 'postgres',
        logging: false,
    })
    : new sequelize_1.Sequelize(database.database, database.username, database.password ?? undefined, {
        host: database.host,
        port: database.port,
        dialect: database.dialect,
        logging: false,
    });
exports.models = (0, models_1.initModels)(exports.sequelize);
const connectDatabase = async () => {
    await exports.sequelize.authenticate();
};
exports.connectDatabase = connectDatabase;
