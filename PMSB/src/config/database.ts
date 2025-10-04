import { Sequelize } from 'sequelize';
import { appConfig } from './env';
import { initModels } from '../models';

const { database } = appConfig;

export const sequelize = database.url
  ? new Sequelize(database.url, {
      dialect: 'postgres',
      logging: false,
    })
  : new Sequelize(database.database, database.username, database.password ?? undefined, {
      host: database.host,
      port: database.port,
      dialect: database.dialect,
      logging: false,
    });

export const models = initModels(sequelize);

export const connectDatabase = async (): Promise<void> => {
  await sequelize.authenticate();
};
