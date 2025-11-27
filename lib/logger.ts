/**
 * Logger Utility
 * 
 * Centralized logging with different levels and structured output.
 * In production, consider integrating with a logging service.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';
  
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.log(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage('error', message, context));
    
    // In production, you might want to send to an error tracking service
    // Example: Sentry.captureException(new Error(message), { extra: context });
  }

  /**
   * Log an API request
   */
  apiRequest(method: string, path: string, context?: LogContext): void {
    this.info(`API ${method} ${path}`, context);
  }

  /**
   * Log an API response
   */
  apiResponse(method: string, path: string, status: number, duration: number): void {
    const level = status >= 400 ? 'error' : 'info';
    this[level](`API ${method} ${path} - ${status}`, { duration: `${duration}ms` });
  }
}

export const logger = new Logger();

