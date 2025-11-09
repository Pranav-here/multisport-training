import pino from "pino";

/**
 * Centralized logger using Pino
 * Provides structured logging with different log levels
 */

const isDevelopment = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  // In test mode, suppress logs unless LOG_LEVEL is explicitly set
  enabled: !isTest || !!process.env.LOG_LEVEL,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "HH:MM:ss",
        },
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Create a child logger with additional context
 * @param context - Additional context to include in all log messages
 */
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

/**
 * Log an API request with timing information
 */
export function logRequest(data: {
  method: string;
  url: string;
  statusCode?: number;
  duration?: number;
  userId?: string;
  requestId?: string;
  error?: Error;
}) {
  const { error, ...logData } = data;

  if (error) {
    logger.error(
      {
        ...logData,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      },
      "API request failed"
    );
  } else if (data.statusCode && data.statusCode >= 400) {
    logger.warn(logData, "API request completed with error");
  } else {
    logger.info(logData, "API request completed");
  }
}

/**
 * Log cache operations
 */
export function logCache(data: {
  operation: "hit" | "miss" | "set" | "del";
  key: string;
  ttl?: number;
  error?: Error;
}) {
  if (data.error) {
    logger.warn(
      {
        ...data,
        error: {
          message: data.error.message,
          name: data.error.name,
        },
      },
      `Cache ${data.operation} failed`
    );
  } else {
    logger.debug(data, `Cache ${data.operation}`);
  }
}

/**
 * Log external API calls
 */
export function logExternalAPI(data: {
  service: string;
  endpoint: string;
  method: string;
  statusCode?: number;
  duration?: number;
  error?: Error;
  cached?: boolean;
}) {
  const { error, ...logData } = data;

  if (error) {
    logger.error(
      {
        ...logData,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      },
      `External API call to ${data.service} failed`
    );
  } else {
    logger.info(logData, `External API call to ${data.service}`);
  }
}

export default logger;
