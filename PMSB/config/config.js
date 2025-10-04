require('dotenv').config();

const common = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  dialect: 'postgres',
  logging: false,
};

const production = { ...common };

if (process.env.DATABASE_URL) {
  production.use_env_variable = 'DATABASE_URL';
}

if (process.env.DB_SSL === 'true') {
  production.dialectOptions = {
    ssl: { require: true, rejectUnauthorized: false },
  };
}

module.exports = {
  development: { ...common },
  test: {
    ...common,
    database: process.env.DB_TEST_DATABASE || process.env.DB_DATABASE,
  },
  production,
};
