import path from 'path';
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, errors, json } = format;

const logDirectory = path.resolve(process.cwd(), 'logs');

export const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(errors({ stack: true }), timestamp(), json()),
  transports: [
    new transports.Console({
      format: combine(
        errors({ stack: true }),
        timestamp(),
        printf(({ level, message, timestamp: ts, stack }) => {
          return stack ? `${ts} [${level}] ${stack}` : `${ts} [${level}] ${message}`;
        }),
      ),
    }),
    new transports.File({
      filename: path.join(logDirectory, 'error.log'),
      level: 'error',
      format: combine(errors({ stack: true }), timestamp(), json()),
    }),
  ],
});

const sanitizeBody = (body: unknown): unknown => {
  if (!body || typeof body !== 'object') {
    return body;
  }
  const clone = JSON.parse(JSON.stringify(body)) as Record<string, unknown>;
  if (typeof clone.password === 'string') {
    clone.password = '[REDACTED]';
  }
  if (typeof clone.confirmPassword === 'string') {
    clone.confirmPassword = '[REDACTED]';
  }
  return clone;
};

export const logRequestError = (params: {
  error: Error;
  endpoint: string;
  body?: unknown;
  userId?: string;
}): void => {
  const { error, endpoint, body, userId } = params;
  logger.error('Request error', {
    endpoint,
    userId,
    body: sanitizeBody(body),
    message: error.message,
    stack: error.stack,
  });
};
