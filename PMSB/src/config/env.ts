import dotenv from 'dotenv';

dotenv.config();

const required = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export interface DatabaseConfig {
  username: string;
  password: string | null;
  database: string;
  host: string;
  port: number;
  dialect: 'postgres';
  url?: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  database: DatabaseConfig;
  jwt: JwtConfig;
}

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const appConfig: AppConfig = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: toNumber(process.env.PORT, 5000),
  database: {
    username: required(process.env.DB_USER, 'DB_USER'),
    password: process.env.DB_PASSWORD ?? null,
    database: required(process.env.DB_DATABASE, 'DB_DATABASE'),
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: toNumber(process.env.DB_PORT, 5432),
    dialect: 'postgres',
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: required(process.env.JWT_SECRET, 'JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  },
};
