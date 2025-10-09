/**
 * Air Knight - Platform and device detection utilities
 */

import { eventBus } from '../systems/EventBus';
import { EVENTS } from './Constants';
import { Platform, DeviceCapabilities, ExtendedDeviceInfo } from '../types/GameTypes';

export class PlatformManager {
  private static instance: PlatformManager;
  private deviceInfo: ExtendedDeviceInfo | null = null;
  private capabilities: DeviceCapabilities | null = null;

  private constructor() {
    this.detectDevice();
    this.detectCapabilities();
  }

  public static getInstance(): PlatformManager {
    if (!PlatformManager.instance) {
      PlatformManager.instance = new PlatformManager();
    }
    return PlatformManager.instance;
  }

  private detectDevice(): void {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;

    let detectedPlatform: Platform;

    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      detectedPlatform = Platform.IOS;
    } else if (/Android/i.test(userAgent)) {
      detectedPlatform = Platform.ANDROID;
    } else if (/Windows/i.test(platform)) {
      detectedPlatform = Platform.WINDOWS;
    } else if (/Mac/i.test(platform)) {
      detectedPlatform = Platform.MACOS;
    } else if (/Linux/i.test(platform)) {
      detectedPlatform = Platform.LINUX;
    } else {
      detectedPlatform = Platform.UNKNOWN;
    }

    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*Tablet)|Tablet/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const pixelRatio = window.devicePixelRatio || 1;

    const isChrome = /Chrome/i.test(userAgent);
    const isSafari = /Safari/i.test(userAgent) && !isChrome;
    const isFirefox = /Firefox/i.test(userAgent);
    const isEdge = /Edge/i.test(userAgent);

    const isPortrait = screenHeight > screenWidth;
    const isLandscape = !isPortrait;

    this.deviceInfo = {
      // ExtendedDeviceInfo properties
      platform: detectedPlatform,
      isMobile,
      isTablet,
      isDesktop,
      screenWidth,
      screenHeight,
      pixelRatio,
      isPortrait,
      isLandscape,
      userAgent,
      browser: { isChrome, isSafari, isFirefox, isEdge },
      osVersion: this.extractOSVersion(userAgent),

      // DeviceInfo base properties
      type: isMobile ? ('mobile' as any) : isTablet ? ('tablet' as any) : ('desktop' as any),
      orientation: isPortrait ? ('portrait' as any) : ('landscape' as any),
      screenSize: { width: screenWidth, height: screenHeight },
      touchSupported: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    };

    console.log('📱 Device detected:', this.deviceInfo);
  }

  private extractOSVersion(userAgent: string): string {
    let version = 'Unknown';

    const iosMatch = userAgent.match(/OS (\d+_\d+)/);
    if (iosMatch && iosMatch[1]) {
      version = iosMatch[1].replace('_', '.');
    }

    const androidMatch = userAgent.match(/Android (\d+\.?\d*)/);
    if (androidMatch && androidMatch[1]) {
      version = androidMatch[1];
    }

    const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/);
    if (windowsMatch && windowsMatch[1]) {
      version = windowsMatch[1];
    }

    return version;
  }

  private detectCapabilities(): void {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasAudioContext = !!(window.AudioContext || (window as any).webkitAudioContext);
    const hasWebAudio = hasAudioContext;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const hasWebGL = !!gl;
    const hasWebGL2 = !!canvas.getContext('webgl2');

    const hasLocalStorage = this.testLocalStorage();
    const hasIndexedDB = 'indexedDB' in window;
    const hasSessionStorage = this.testSessionStorage();

    const hasOnlineStatus = 'onLine' in navigator;
    const isOnline = navigator.onLine;
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    const connectionType = connection ? connection.effectiveType : 'unknown';

    const hasPerformanceAPI = 'performance' in window;
    const hasMemoryAPI = hasPerformanceAPI && 'memory' in performance;
    const hasGamepadAPI = 'getGamepads' in navigator;
    const hasVibration = 'vibrate' in navigator;

    const hasFullscreen = !!(
      document.fullscreenEnabled ||
      (document as any).webkitFullscreenEnabled ||
      (document as any).mozFullScreenEnabled ||
      (document as any).msFullscreenEnabled
    );

    const hasPointerLock = !!(
      document.exitPointerLock ||
      (document as any).webkitExitPointerLock ||
      (document as any).mozExitPointerLock
    );

    const hasBatteryAPI = 'getBattery' in navigator;

    this.capabilities = {
      hasTouch,
      hasAudioContext,
      hasWebAudio,
      hasWebGL,
      hasWebGL2,
      hasLocalStorage,
      hasIndexedDB,
      hasSessionStorage,
      hasOnlineStatus,
      isOnline,
      connectionType,
      hasPerformanceAPI,
      hasMemoryAPI,
      hasGamepadAPI,
      hasVibration,
      hasFullscreen,
      hasPointerLock,
      hasBatteryAPI,
    };

    console.log('🔧 Capabilities detected:', this.capabilities);
    canvas.remove();
  }

  private testLocalStorage(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  private testSessionStorage(): boolean {
    try {
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  public getDeviceInfo(): ExtendedDeviceInfo {
    return this.deviceInfo!;
  }

  public getCapabilities(): DeviceCapabilities {
    return this.capabilities!;
  }

  public isMobile(): boolean {
    return this.deviceInfo?.isMobile || false;
  }

  public isTablet(): boolean {
    return this.deviceInfo?.isTablet || false;
  }

  public isDesktop(): boolean {
    return this.deviceInfo?.isDesktop || false;
  }

  public hasTouch(): boolean {
    return this.capabilities?.hasTouch || false;
  }

  public hasWebGL(): boolean {
    return this.capabilities?.hasWebGL || false;
  }

  public isOnline(): boolean {
    return this.capabilities?.isOnline || false;
  }

  public getPlatform(): Platform {
    return this.deviceInfo?.platform || Platform.UNKNOWN;
  }

  public isPortrait(): boolean {
    return this.deviceInfo?.isPortrait || false;
  }

  public getConnectionType(): string {
    return this.capabilities?.connectionType || 'unknown';
  }

  public initialize(): void {
    this.setupOrientationListener();
    this.setupNetworkListeners();
    console.log('📱 PlatformManager initialized');
  }

  private setupOrientationListener(): void {
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.detectDevice();
        eventBus.emit(EVENTS.UI_STATE_CHANGED, {
          type: 'orientation',
          isPortrait: this.isPortrait(),
          timestamp: new Date(),
        });
      }, 100);
    });

    window.addEventListener('resize', () => {
      const newIsPortrait = window.innerHeight > window.innerWidth;
      if (newIsPortrait !== this.deviceInfo?.isPortrait) {
        this.detectDevice();
        eventBus.emit(EVENTS.UI_STATE_CHANGED, {
          type: 'orientation',
          isPortrait: newIsPortrait,
          timestamp: new Date(),
        });
      }
    });
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      if (this.capabilities) {
        this.capabilities.isOnline = true;
      }
      eventBus.emit(EVENTS.UI_STATE_CHANGED, {
        type: 'network',
        isOnline: true,
        timestamp: new Date(),
      });
      console.log('🌐 Device is online');
    });

    window.addEventListener('offline', () => {
      if (this.capabilities) {
        this.capabilities.isOnline = false;
      }
      eventBus.emit(EVENTS.UI_STATE_CHANGED, {
        type: 'network',
        isOnline: false,
        timestamp: new Date(),
      });
      console.log('📡 Device is offline');
    });
  }
}

export const platformManager = PlatformManager.getInstance();
