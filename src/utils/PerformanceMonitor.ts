/**
 * Air Knight - Performance monitoring utilities
 * Following constitution principles for mobile game optimization
 */

import { eventBus } from '../systems/EventBus';
import { EVENTS, GAME_CONFIG } from './Constants';
import type { PerformanceMetrics, PerformanceWarning } from '../types/GameTypes';
import { PerformanceWarningType } from '../types/GameTypes';

export class PerformanceMonitor {
  private frameCount: number = 0;
  private lastTime: number = 0;
  private fpsHistory: number[] = [];
  private memoryHistory: number[] = [];
  private monitoringInterval: number | null = null;
  private isMonitoring: boolean = false;
  private lastGcTime: Date = new Date();
  private gcCount: number = 0;
  private renderTime: number = 0;
  private updateTime: number = 0;

  // Performance thresholds
  private readonly FPS_WARNING_THRESHOLD = GAME_CONFIG.TARGET_FPS * 0.8; // 80% of target FPS
  private readonly FPS_CRITICAL_THRESHOLD = GAME_CONFIG.TARGET_FPS * 0.6; // 60% of target FPS
  private readonly MEMORY_WARNING_THRESHOLD = 150; // MB
  private readonly MEMORY_CRITICAL_THRESHOLD = 200; // MB

  /**
   * Start performance monitoring
   */
  public startMonitoring(): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.lastTime = performance.now();
    this.frameCount = 0;

    // Start FPS monitoring
    this.startFPSMonitoring();

    // Start memory monitoring (every 5 seconds)
    this.monitoringInterval = window.setInterval(() => {
      this.checkMemoryUsage();
    }, 5000);

    console.log('🔍 Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('⏹️ Performance monitoring stopped');
  }

  /**
   * Start FPS monitoring using requestAnimationFrame
   */
  private startFPSMonitoring(): void {
    const measureFPS = () => {
      if (!this.isMonitoring) {
        return;
      }

      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastTime;

      if (deltaTime >= 1000) {
        // Check FPS every second
        const fps = Math.round((this.frameCount * 1000) / deltaTime);
        this.processFPSMeasurement(fps);

        this.frameCount = 0;
        this.lastTime = currentTime;
      }

      this.frameCount++;
      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  /**
   * Process FPS measurement and check for warnings
   */
  private processFPSMeasurement(fps: number): void {
    // Add to history (keep last 10 measurements)
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > 10) {
      this.fpsHistory.shift();
    }

    // Check for performance warnings
    if (fps < this.FPS_CRITICAL_THRESHOLD) {
      this.emitPerformanceWarning('fps', 'critical', fps, this.FPS_CRITICAL_THRESHOLD);
    } else if (fps < this.FPS_WARNING_THRESHOLD) {
      this.emitPerformanceWarning('fps', 'warning', fps, this.FPS_WARNING_THRESHOLD);
    }

    // Emit FPS update event
    eventBus.emit(EVENTS.PERFORMANCE_UPDATE, {
      type: 'fps',
      value: fps,
      timestamp: Date.now(),
    });
  }

  /**
   * Check memory usage (if available)
   */
  private checkMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);

      // Add to history (keep last 10 measurements)
      this.memoryHistory.push(usedMB);
      if (this.memoryHistory.length > 10) {
        this.memoryHistory.shift();
      }

      // Check for memory warnings
      if (usedMB > this.MEMORY_CRITICAL_THRESHOLD) {
        this.emitPerformanceWarning('memory', 'critical', usedMB, this.MEMORY_CRITICAL_THRESHOLD);
      } else if (usedMB > this.MEMORY_WARNING_THRESHOLD) {
        this.emitPerformanceWarning('memory', 'warning', usedMB, this.MEMORY_WARNING_THRESHOLD);
      }

      // Emit memory update event
      eventBus.emit(EVENTS.PERFORMANCE_UPDATE, {
        type: 'memory',
        value: usedMB,
        timestamp: Date.now(),
        details: {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        },
      });
    }
  }

  /**
   * Emit performance warning event
   */
  private emitPerformanceWarning(
    type: 'fps' | 'memory',
    severity: 'warning' | 'critical',
    value: number,
    threshold: number
  ): void {
    // Map internal types to enum types
    const warningType =
      type === 'fps' ? PerformanceWarningType.LOW_FPS : PerformanceWarningType.HIGH_MEMORY;

    const warning: PerformanceWarning = {
      type: warningType,
      message: `${type.toUpperCase()} ${severity}: ${value} (threshold: ${threshold})`,
      value,
      threshold,
      timestamp: new Date(),
    };

    eventBus.emit(EVENTS.PERFORMANCE_WARNING, warning);

    if (severity === 'critical') {
      console.error('🚨 Performance Critical:', warning.message);
    } else {
      console.warn('⚠️ Performance Warning:', warning.message);
    }
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    const currentFPS = this.fpsHistory.length > 0 ? this.fpsHistory[this.fpsHistory.length - 1] : 0;
    const currentMemory =
      this.memoryHistory.length > 0 ? this.memoryHistory[this.memoryHistory.length - 1] : 0;
    const averageFPS =
      this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length || 0;

    return {
      frameRate: currentFPS || 0,
      averageFrameRate: averageFPS || 0,
      memoryUsage: currentMemory || 0,
      renderTime: this.renderTime || 0,
      updateTime: this.updateTime || 0,
      gcCount: this.gcCount || 0,
      lastGcTime: this.lastGcTime || new Date(),
    };
  }

  /**
   * Force a performance check (useful for debugging)
   */
  public checkPerformance(): PerformanceMetrics {
    if ('memory' in performance) {
      this.checkMemoryUsage();
    }
    return this.getMetrics();
  }

  /**
   * Reset performance history
   */
  public resetHistory(): void {
    this.fpsHistory = [];
    this.memoryHistory = [];
    console.log('📊 Performance history reset');
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  performanceMonitor.startMonitoring();

  // Add to window for debugging
  (window as any).performanceMonitor = performanceMonitor;
}
