/**
 * Platform Manager for cross-platform compatibility
 * Handles detection and initialization for web, iOS, and Android platforms
 */
export class PlatformManager {
  private static instance: PlatformManager;
  private platform: 'web' | 'ios' | 'android' = 'web';
  private isCapacitor = false;
  private isInitialized = false;

  private constructor() {
    this.detectPlatform();
  }

  /**
   * Initialize the platform manager
   */
  public static async initialize(): Promise<PlatformManager> {
    if (!PlatformManager.instance) {
      PlatformManager.instance = new PlatformManager();
      await PlatformManager.instance.init();
    }
    return PlatformManager.instance;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): PlatformManager {
    if (!PlatformManager.instance) {
      throw new Error('PlatformManager not initialized. Call initialize() first.');
    }
    return PlatformManager.instance;
  }

  /**
   * Internal initialization
   */
  private async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if running in Capacitor
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        this.isCapacitor = true;
        const { Capacitor } = await import('@capacitor/core');
        this.platform = Capacitor.getPlatform() as 'web' | 'ios' | 'android';
      }

      // Setup platform-specific optimizations
      await this.setupPlatformOptimizations();
      
      this.isInitialized = true;
      console.log(`🔧 Platform Manager initialized for: ${this.platform}`);
    } catch (error) {
      console.warn('Platform Manager initialization failed, falling back to web mode:', error);
      this.platform = 'web';
      this.isCapacitor = false;
      this.isInitialized = true;
    }
  }

  /**
   * Detect platform based on user agent if Capacitor is not available
   */
  private detectPlatform(): void {
    if (typeof window === 'undefined') {
      this.platform = 'web';
      return;
    }

    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      this.platform = 'ios';
    } else if (userAgent.includes('android')) {
      this.platform = 'android';
    } else {
      this.platform = 'web';
    }
  }

  /**
   * Setup platform-specific optimizations
   */
  private async setupPlatformOptimizations(): Promise<void> {
    switch (this.platform) {
      case 'ios':
        await this.setupIOSOptimizations();
        break;
      case 'android':
        await this.setupAndroidOptimizations();
        break;
      case 'web':
        await this.setupWebOptimizations();
        break;
    }
  }

  /**
   * iOS-specific optimizations
   */
  private async setupIOSOptimizations(): Promise<void> {
    // Prevent zoom on double-tap
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    });

    // Prevent bounce scroll
    document.body.style.overflow = 'hidden';
    
    // Setup status bar if in Capacitor
    if (this.isCapacitor) {
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#2c3e50' });
      } catch (error) {
        console.warn('StatusBar plugin not available:', error);
      }
    }
  }

  /**
   * Android-specific optimizations
   */
  private async setupAndroidOptimizations(): Promise<void> {
    // Prevent back button from closing app
    document.addEventListener('backbutton', (e) => {
      e.preventDefault();
      // Handle back button in game logic
    });

    // Setup status bar if in Capacitor
    if (this.isCapacitor) {
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#2c3e50' });
      } catch (error) {
        console.warn('StatusBar plugin not available:', error);
      }
    }
  }

  /**
   * Web-specific optimizations
   */
  private async setupWebOptimizations(): Promise<void> {
    // Prevent right-click context menu in game area
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
    }

    // Prevent drag operations on images/canvas
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });
  }

  /**
   * Get current platform
   */
  public getPlatform(): 'web' | 'ios' | 'android' {
    return this.platform;
  }

  /**
   * Check if running in Capacitor
   */
  public isCapacitorApp(): boolean {
    return this.isCapacitor;
  }

  /**
   * Check if running on mobile device
   */
  public isMobile(): boolean {
    return this.platform === 'ios' || this.platform === 'android';
  }

  /**
   * Check if running on iOS
   */
  public isIOS(): boolean {
    return this.platform === 'ios';
  }

  /**
   * Check if running on Android
   */
  public isAndroid(): boolean {
    return this.platform === 'android';
  }

  /**
   * Check if running on web
   */
  public isWeb(): boolean {
    return this.platform === 'web';
  }

  /**
   * Get safe area insets for notch handling (iOS)
   */
  public getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
    if (this.isCapacitor && this.platform === 'ios') {
      // In a real implementation, this would use SafeArea plugin
      // For now, return default values
      return { top: 44, bottom: 34, left: 0, right: 0 };
    }
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  /**
   * Show native splash screen (if available)
   */
  public async showSplashScreen(): Promise<void> {
    if (this.isCapacitor) {
      try {
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.show();
      } catch (error) {
        console.warn('SplashScreen plugin not available:', error);
      }
    }
  }

  /**
   * Hide native splash screen (if available)
   */
  public async hideSplashScreen(): Promise<void> {
    if (this.isCapacitor) {
      try {
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide();
      } catch (error) {
        console.warn('SplashScreen plugin not available:', error);
      }
    }
  }
}