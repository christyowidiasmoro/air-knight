/**
 * Mobile Platform Detection and Optimization
 * Following Cross-Platform Compatibility and Mobile-Optimized Performance principles
 */

import type { PlatformCapabilities } from '@/types';
import { eventBus, GAME_EVENTS } from '@/systems/EventBus';

export class PlatformManager {
  private capabilities: {
    isMobile: boolean;
    hasTouch: boolean;
    hasVibration: boolean;
    screenOrientation: 'portrait' | 'landscape';
    pixelRatio: number;
  };

  constructor() {
    this.capabilities = this.detectPlatformCapabilities();
    this.setupMobileOptimizations();
  }

  /**
   * Get platform capabilities
   */
  getCapabilities(): PlatformCapabilities {
    return { ...this.capabilities };
  }

  /**
   * Check if running on mobile device
   */
  isMobile(): boolean {
    return this.capabilities.isMobile;
  }

  /**
   * Check if device has touch support
   */
  hasTouch(): boolean {
    return this.capabilities.hasTouch;
  }

  /**
   * Get optimal game settings for current platform
   */
  getOptimalSettings() {
    const baseSettings = {
      antialiasing: false,
      pixelArt: true,
      physics: {
        debug: false,
        iterations: this.capabilities.isMobile ? 4 : 8,
      },
      audio: {
        volume: 0.7,
        enableCompression: this.capabilities.isMobile,
      },
    };

    if (this.capabilities.isMobile) {
      return {
        ...baseSettings,
        renderQuality: 'medium',
        particleCount: 50,
        maxSounds: 5,
        textureResolution: 1,
        targetFPS: 60,
      };
    }

    return {
      ...baseSettings,
      renderQuality: 'high',
      particleCount: 200,
      maxSounds: 10,
      textureResolution: 2,
      targetFPS: 60,
    };
  }

  private detectPlatformCapabilities(): PlatformCapabilities {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasVibration = 'vibrate' in navigator;

    // Detect orientation
    const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

    return {
      isMobile,
      hasTouch,
      hasVibration,
      screenOrientation: orientation,
      pixelRatio: window.devicePixelRatio || 1,
    };
  }

  private setupMobileOptimizations(): void {
    if (!this.capabilities.isMobile) return;

    // Prevent scrolling and bouncing on mobile
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.capabilities.screenOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        eventBus.emit('platform:orientationchange', this.capabilities.screenOrientation);
      }, 100);
    });

    // Handle app state changes (for Capacitor)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        eventBus.emit(GAME_EVENTS.GAME_PAUSE);
      } else {
        eventBus.emit(GAME_EVENTS.GAME_RESUME);
      }
    });

    // Memory management
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        if (memory.usedJSHeapSize > 150 * 1024 * 1024) { // 150MB
          eventBus.emit(GAME_EVENTS.PERFORMANCE_WARNING, {
            type: 'HIGH_MEMORY_MOBILE',
            value: memory.usedJSHeapSize / (1024 * 1024),
            threshold: 150,
          });
        }
      }, 5000);
    }

    console.log('Mobile optimizations enabled');
  }
}

/**
 * Touch gesture detection for mobile controls
 */
export class GestureDetector {
  private startX = 0;
  private startY = 0;
  private endX = 0;
  private endY = 0;
  private minSwipeDistance = 50;

  constructor(element: HTMLElement) {
    this.setupGestureListeners(element);
  }

  private setupGestureListeners(element: HTMLElement): void {
    element.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      if (touch) {
        this.startX = touch.clientX;
        this.startY = touch.clientY;
      }
    }, { passive: true });

    element.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      if (touch) {
        this.endX = touch.clientX;
        this.endY = touch.clientY;
        this.handleGesture();
      }
    }, { passive: true });
  }

  private handleGesture(): void {
    const deltaX = this.endX - this.startX;
    const deltaY = this.endY - this.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < this.minSwipeDistance) {
      eventBus.emit('gesture:tap', {
        x: this.endX,
        y: this.endY,
      });
      return;
    }

    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0) {
        eventBus.emit('gesture:swipe', { direction: 'right', distance });
      } else {
        eventBus.emit('gesture:swipe', { direction: 'left', distance });
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        eventBus.emit('gesture:swipe', { direction: 'down', distance });
      } else {
        eventBus.emit('gesture:swipe', { direction: 'up', distance });
      }
    }
  }
}

/**
 * Performance optimizer for mobile devices
 */
export class MobilePerformanceOptimizer {
  private lowPerformanceMode = false;
  private frameDropThreshold = 45; // FPS threshold for enabling low performance mode

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring(): void {
    let frameCount = 0;
    let lastTime = performance.now();
    const fpsHistory: number[] = [];

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;

        fpsHistory.push(fps);
        if (fpsHistory.length > 5) {
          fpsHistory.shift();
        }

        const avgFPS = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;

        if (avgFPS < this.frameDropThreshold && !this.lowPerformanceMode) {
          this.enableLowPerformanceMode();
        } else if (avgFPS > this.frameDropThreshold + 10 && this.lowPerformanceMode) {
          this.disableLowPerformanceMode();
        }
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  private enableLowPerformanceMode(): void {
    this.lowPerformanceMode = true;
    
    eventBus.emit('performance:low_mode_enabled');
    console.log('Low performance mode enabled');
    
    // Emit settings that game systems can listen to
    eventBus.emit('settings:update', {
      particleCount: 25,
      shadowQuality: 'off',
      renderScale: 0.8,
      physics: {
        iterations: 2,
        timeScale: 1,
      },
    });
  }

  private disableLowPerformanceMode(): void {
    this.lowPerformanceMode = false;
    
    eventBus.emit('performance:low_mode_disabled');
    console.log('Low performance mode disabled');
    
    eventBus.emit('settings:update', {
      particleCount: 50,
      shadowQuality: 'medium',
      renderScale: 1,
      physics: {
        iterations: 4,
        timeScale: 1,
      },
    });
  }

  isLowPerformanceMode(): boolean {
    return this.lowPerformanceMode;
  }
}

// Global platform manager instance
export const platformManager = new PlatformManager();