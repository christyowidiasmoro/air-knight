/**
 * ErrorHandler System for Centralized Error Management
 * Handles all error reporting, logging, and recovery strategies
 */

import { EventBus } from './EventBus';
import { EVENTS } from '../utils/Constants';
import type { GameError, ErrorContext, PerformanceWarning } from '../types/GameTypes';
import { ErrorSeverity, PerformanceWarningType } from '../types/GameTypes';

interface ErrorStats {
  totalErrors: number;
  recoverableErrors: number;
  criticalErrors: number;
  lastError?: Date;
  commonErrors: Record<string, number>;
}

interface ErrorRecoveryStrategy {
  canRecover: (error: GameError) => boolean;
  recover: (error: GameError) => Promise<boolean>;
  description: string;
}

/**
 * Centralized error handling system
 * Manages error reporting, logging, and recovery strategies
 */
export class ErrorHandler {
  private eventBus: EventBus;
  private errorStats: ErrorStats;
  private recoveryStrategies: ErrorRecoveryStrategy[] = [];
  private errorHistory: GameError[] = [];
  private maxHistorySize = 50;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.errorStats = {
      totalErrors: 0,
      recoverableErrors: 0,
      criticalErrors: 0,
      commonErrors: {},
    };

    this.setupDefaultRecoveryStrategies();
    this.setupGlobalErrorHandlers();
  }

  /**
   * Handle error with context and attempt recovery
   * @param error - Error instance or message
   * @param context - Error context information
   * @param recoverable - Whether error is recoverable
   */
  handleError(
    error: Error | string,
    context: Partial<ErrorContext>,
    recoverable: boolean = true
  ): void {
    const gameError = this.createGameError(error, context, recoverable);

    // Update statistics
    this.updateErrorStats(gameError);

    // Add to history
    this.addToHistory(gameError);

    // Log error
    this.logError(gameError);

    // Emit error event
    this.eventBus.emit(EVENTS.ERROR_OCCURRED, gameError);

    // Attempt recovery if possible
    if (recoverable && gameError.severity !== 'critical') {
      this.attemptRecovery(gameError);
    }
  }

  /**
   * Log warning message
   * @param message - Warning message
   * @param context - Optional context data
   */
  warn(message: string, context?: Record<string, unknown>): void {
    const warning: PerformanceWarning = {
      type: PerformanceWarningType.LOW_FPS, // Default type, should be specified
      message,
      value: 0,
      threshold: 0,
      timestamp: new Date(),
    };

    console.warn(`[WARNING] ${message}`, context);
    this.eventBus.emit(EVENTS.PERFORMANCE_WARNING, { message, context, warning });
  }

  /**
   * Log info message
   * @param message - Info message
   * @param context - Optional context data
   */
  info(message: string, context?: Record<string, unknown>): void {
    console.info(`[INFO] ${message}`, context);
  }

  /**
   * Set custom error recovery strategy
   * @param strategy - Error recovery function
   */
  addRecoveryStrategy(strategy: ErrorRecoveryStrategy): void {
    this.recoveryStrategies.push(strategy);
  }

  /**
   * Get error statistics
   * @returns Error occurrence statistics
   */
  getStats(): ErrorStats {
    return { ...this.errorStats };
  }

  /**
   * Get error history
   * @returns Recent error history
   */
  getErrorHistory(): GameError[] {
    return [...this.errorHistory];
  }

  /**
   * Clear error history and reset stats
   */
  clearHistory(): void {
    this.errorHistory = [];
    this.errorStats = {
      totalErrors: 0,
      recoverableErrors: 0,
      criticalErrors: 0,
      commonErrors: {},
    };
  }

  /**
   * Create structured game error from input
   * @param error - Error or message
   * @param context - Error context
   * @param recoverable - Whether recoverable
   * @returns Structured game error
   */
  private createGameError(
    error: Error | string,
    context: Partial<ErrorContext>,
    recoverable: boolean
  ): GameError {
    const message = typeof error === 'string' ? error : error.message;
    const stackTrace = error instanceof Error ? error.stack : undefined;

    const severity = this.determineSeverity(message, context);

    const fullContext: ErrorContext = {
      timestamp: new Date(),
      ...(stackTrace && { stackTrace }),
      ...context,
    };

    return {
      message,
      severity,
      context: fullContext,
      recoverable,
    };
  }

  /**
   * Determine error severity based on message and context
   * @param message - Error message
   * @param context - Error context
   * @returns Error severity level
   */
  private determineSeverity(message: string, context: Partial<ErrorContext>): ErrorSeverity {
    const lowerMessage = message.toLowerCase();

    // Critical errors
    if (
      lowerMessage.includes('memory') ||
      lowerMessage.includes('crash') ||
      lowerMessage.includes('fatal') ||
      context.scene === 'LoadingScene'
    ) {
      return ErrorSeverity.CRITICAL;
    }

    // High severity errors
    if (
      lowerMessage.includes('network') ||
      lowerMessage.includes('timeout') ||
      lowerMessage.includes('permission')
    ) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity errors
    if (
      lowerMessage.includes('asset') ||
      lowerMessage.includes('load') ||
      lowerMessage.includes('parse')
    ) {
      return ErrorSeverity.MEDIUM;
    }

    // Default to low severity
    return ErrorSeverity.LOW;
  }

  /**
   * Update error statistics
   * @param error - Game error
   */
  private updateErrorStats(error: GameError): void {
    this.errorStats.totalErrors++;
    this.errorStats.lastError = error.context.timestamp;

    if (error.recoverable) {
      this.errorStats.recoverableErrors++;
    }

    if (error.severity === ErrorSeverity.CRITICAL) {
      this.errorStats.criticalErrors++;
    }

    // Track common errors
    const errorType = `${error.severity}:${error.message.slice(0, 50)}`;
    this.errorStats.commonErrors[errorType] = (this.errorStats.commonErrors[errorType] || 0) + 1;
  }

  /**
   * Add error to history
   * @param error - Game error
   */
  private addToHistory(error: GameError): void {
    this.errorHistory.push(error);

    // Maintain history size limit
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }
  }

  /**
   * Log error with appropriate level
   * @param error - Game error
   */
  private logError(error: GameError): void {
    const prefix = `[${error.severity.toUpperCase()}]`;
    const message = `${prefix} ${error.message}`;

    switch (error.severity) {
      case 'critical':
        console.error(message, error.context);
        break;
      case 'high':
        console.error(message, error.context);
        break;
      case 'medium':
        console.warn(message, error.context);
        break;
      case 'low':
      default:
        console.log(message, error.context);
        break;
    }
  }

  /**
   * Attempt to recover from error using available strategies
   * @param error - Game error
   */
  private async attemptRecovery(error: GameError): Promise<void> {
    for (const strategy of this.recoveryStrategies) {
      if (strategy.canRecover(error)) {
        try {
          const recovered = await strategy.recover(error);
          if (recovered) {
            this.info(`Recovery successful using strategy: ${strategy.description}`);
            return;
          }
        } catch (recoveryError) {
          this.warn(`Recovery strategy failed: ${strategy.description}`, {
            originalError: error,
            recoveryError,
          });
        }
      }
    }

    this.warn(`No recovery strategy available for error: ${error.message}`);
  }

  /**
   * Setup default recovery strategies
   */
  private setupDefaultRecoveryStrategies(): void {
    // Network error recovery
    this.addRecoveryStrategy({
      canRecover: error =>
        error.message.toLowerCase().includes('network') ||
        error.message.toLowerCase().includes('fetch'),
      recover: async _error => {
        this.info('Attempting network recovery...');
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        return navigator.onLine;
      },
      description: 'Network connectivity recovery',
    });

    // Asset loading recovery
    this.addRecoveryStrategy({
      canRecover: error =>
        error.message.toLowerCase().includes('asset') ||
        error.message.toLowerCase().includes('load'),
      recover: async error => {
        this.info('Attempting asset reload...');
        // Signal for asset reload
        this.eventBus.emit('asset:reload:request', { error });
        return true;
      },
      description: 'Asset loading recovery',
    });

    // Memory recovery
    this.addRecoveryStrategy({
      canRecover: error => error.message.toLowerCase().includes('memory'),
      recover: async error => {
        this.info('Attempting memory cleanup...');
        // Trigger garbage collection if available
        if (window.gc) {
          window.gc();
        }
        // Emit cleanup event
        this.eventBus.emit('memory:cleanup:request', { error });
        return true;
      },
      description: 'Memory cleanup recovery',
    });
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Unhandled errors
    window.addEventListener('error', event => {
      this.handleError(
        event.error || event.message,
        {
          scene: 'global',
          component: 'window',
          action: 'unhandled-error',
          additionalData: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        },
        false
      );
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      this.handleError(
        event.reason,
        {
          scene: 'global',
          component: 'promise',
          action: 'unhandled-rejection',
        },
        true
      );

      // Prevent default browser behavior
      event.preventDefault();
    });
  }
}

// Global error handler instance
export const errorHandler = new ErrorHandler(new EventBus());

// Extend Window interface for gc function
declare global {
  interface Window {
    gc?: () => void;
  }
}
