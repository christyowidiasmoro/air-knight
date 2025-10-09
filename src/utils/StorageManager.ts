/**
 * Air Knight - Storage management utilities
 * Following constitution principles for persistent data management
 */

import { eventBus } from '../systems/EventBus';
import { errorHandler } from '../systems/ErrorHandler';
import { EVENTS } from './Constants';
import type { StorageType } from '../types/GameTypes';

export interface StorageOptions {
  encrypt?: boolean;
  compression?: boolean;
  expiry?: number; // milliseconds
  fallback?: StorageType;
}

export interface StorageItem<T = any> {
  value: T;
  timestamp: number;
  expiry?: number | undefined;
  version?: string;
}

/**
 * Unified storage manager for localStorage, sessionStorage, and IndexedDB
 */
export class StorageManager {
  private static instance: StorageManager;
  private dbName = 'AirKnightDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  private constructor() {
    this.initializeIndexedDB();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  /**
   * Initialize IndexedDB
   */
  private async initializeIndexedDB(): Promise<void> {
    try {
      if (!('indexedDB' in window)) {
        console.warn('⚠️ IndexedDB not supported, falling back to localStorage');
        this.isInitialized = true;
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('❌ Failed to open IndexedDB:', request.error);
        this.isInitialized = true;
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('✅ IndexedDB initialized');

        eventBus.emit(EVENTS.UI_STATE_CHANGED, {
          type: 'storage',
          initialized: true,
          timestamp: new Date(),
        });
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('gameData')) {
          const gameStore = db.createObjectStore('gameData', { keyPath: 'key' });
          gameStore.createIndex('timestamp', 'timestamp', { unique: false });
          gameStore.createIndex('expiry', 'expiry', { unique: false });
        }

        if (!db.objectStoreNames.contains('userProgress')) {
          const progressStore = db.createObjectStore('userProgress', { keyPath: 'key' });
          progressStore.createIndex('level', 'value.level', { unique: false });
          progressStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('gameSettings')) {
          const settingsStore = db.createObjectStore('gameSettings', { keyPath: 'key' });
          settingsStore.createIndex('category', 'value.category', { unique: false });
        }

        if (!db.objectStoreNames.contains('assetCache')) {
          const cacheStore = db.createObjectStore('assetCache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
          cacheStore.createIndex('size', 'value.size', { unique: false });
        }

        console.log('🔧 IndexedDB schema created');
      };
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        {
          component: 'StorageManager',
          action: 'initialize-indexeddb',
          timestamp: new Date(),
        },
        false
      );
      this.isInitialized = true;
    }
  }

  /**
   * Wait for initialization to complete
   */
  private async waitForInitialization(): Promise<void> {
    while (!this.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  /**
   * Set item in storage
   */
  public async setItem<T>(
    key: string,
    value: T,
    storageType: StorageType = 'localStorage',
    options: StorageOptions = {}
  ): Promise<boolean> {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        version: '1.0',
      };

      if (options.expiry) {
        item.expiry = Date.now() + options.expiry;
      }

      switch (storageType) {
        case 'localStorage':
          return this.setLocalStorageItem(key, item);

        case 'sessionStorage':
          return this.setSessionStorageItem(key, item);

        case 'indexedDB':
          await this.waitForInitialization();
          return this.setIndexedDBItem(key, item, 'gameData');

        default:
          console.warn(`⚠️ Unknown storage type: ${storageType}`);
          return false;
      }
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        {
          component: 'StorageManager',
          action: 'set-item',
          timestamp: new Date(),
          additionalData: { key, storageType },
        },
        false
      );
      return false;
    }
  }

  /**
   * Get item from storage
   */
  public async getItem<T>(
    key: string,
    storageType: StorageType = 'localStorage',
    defaultValue?: T
  ): Promise<T | null> {
    try {
      let item: StorageItem<T> | null = null;

      switch (storageType) {
        case 'localStorage':
          item = this.getLocalStorageItem<T>(key);
          break;

        case 'sessionStorage':
          item = this.getSessionStorageItem<T>(key);
          break;

        case 'indexedDB':
          await this.waitForInitialization();
          item = await this.getIndexedDBItem<T>(key, 'gameData');
          break;

        default:
          console.warn(`⚠️ Unknown storage type: ${storageType}`);
          return defaultValue || null;
      }

      if (!item) {
        return defaultValue || null;
      }

      // Check expiry
      if (item.expiry && Date.now() > item.expiry) {
        await this.removeItem(key, storageType);
        return defaultValue || null;
      }

      return item.value;
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        {
          component: 'StorageManager',
          action: 'get-item',
          timestamp: new Date(),
          additionalData: { key, storageType },
        },
        false
      );
      return defaultValue || null;
    }
  }

  /**
   * Remove item from storage
   */
  public async removeItem(
    key: string,
    storageType: StorageType = 'localStorage'
  ): Promise<boolean> {
    try {
      switch (storageType) {
        case 'localStorage':
          localStorage.removeItem(key);
          return true;

        case 'sessionStorage':
          sessionStorage.removeItem(key);
          return true;

        case 'indexedDB':
          await this.waitForInitialization();
          return this.removeIndexedDBItem(key, 'gameData');

        default:
          console.warn(`⚠️ Unknown storage type: ${storageType}`);
          return false;
      }
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        {
          component: 'StorageManager',
          action: 'remove-item',
          timestamp: new Date(),
          additionalData: { key, storageType },
        },
        false
      );
      return false;
    }
  }

  /**
   * Clear all data from storage
   */
  public async clear(storageType: StorageType = 'localStorage'): Promise<boolean> {
    try {
      switch (storageType) {
        case 'localStorage':
          localStorage.clear();
          return true;

        case 'sessionStorage':
          sessionStorage.clear();
          return true;

        case 'indexedDB':
          await this.waitForInitialization();
          return this.clearIndexedDB();

        default:
          console.warn(`⚠️ Unknown storage type: ${storageType}`);
          return false;
      }
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        {
          component: 'StorageManager',
          action: 'clear',
          timestamp: new Date(),
          additionalData: { storageType },
        },
        false
      );
      return false;
    }
  }

  /**
   * Get storage usage information
   */
  public async getStorageInfo(): Promise<{
    localStorage: { used: number; available: number };
    sessionStorage: { used: number; available: number };
    indexedDB: { used: number; available: number };
  }> {
    const info = {
      localStorage: { used: 0, available: 0 },
      sessionStorage: { used: 0, available: 0 },
      indexedDB: { used: 0, available: 0 },
    };

    try {
      // LocalStorage size
      info.localStorage.used = this.calculateStorageSize(localStorage);
      info.localStorage.available = 10 * 1024 * 1024 - info.localStorage.used; // ~10MB limit

      // SessionStorage size
      info.sessionStorage.used = this.calculateStorageSize(sessionStorage);
      info.sessionStorage.available = 10 * 1024 * 1024 - info.sessionStorage.used; // ~10MB limit

      // IndexedDB size (if supported)
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        info.indexedDB.used = estimate.usage || 0;
        info.indexedDB.available = (estimate.quota || 0) - info.indexedDB.used;
      }
    } catch (error) {
      console.warn('⚠️ Failed to get storage info:', error);
    }

    return info;
  }

  /**
   * LocalStorage operations
   */
  private setLocalStorageItem<T>(key: string, item: StorageItem<T>): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('❌ LocalStorage setItem failed:', error);
      return false;
    }
  }

  private getLocalStorageItem<T>(key: string): StorageItem<T> | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('❌ LocalStorage getItem failed:', error);
      return null;
    }
  }

  /**
   * SessionStorage operations
   */
  private setSessionStorageItem<T>(key: string, item: StorageItem<T>): boolean {
    try {
      sessionStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('❌ SessionStorage setItem failed:', error);
      return false;
    }
  }

  private getSessionStorageItem<T>(key: string): StorageItem<T> | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('❌ SessionStorage getItem failed:', error);
      return null;
    }
  }

  /**
   * IndexedDB operations
   */
  private async setIndexedDBItem<T>(
    key: string,
    item: StorageItem<T>,
    storeName: string
  ): Promise<boolean> {
    return new Promise(resolve => {
      if (!this.db) {
        resolve(false);
        return;
      }

      try {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put({ key, ...item });

        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      } catch (error) {
        console.error('❌ IndexedDB setItem failed:', error);
        resolve(false);
      }
    });
  }

  private async getIndexedDBItem<T>(
    key: string,
    storeName: string
  ): Promise<StorageItem<T> | null> {
    return new Promise(resolve => {
      if (!this.db) {
        resolve(null);
        return;
      }

      try {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { key: _key, ...item } = result;
            resolve(item as StorageItem<T>);
          } else {
            resolve(null);
          }
        };

        request.onerror = () => resolve(null);
      } catch (error) {
        console.error('❌ IndexedDB getItem failed:', error);
        resolve(null);
      }
    });
  }

  private async removeIndexedDBItem(key: string, storeName: string): Promise<boolean> {
    return new Promise(resolve => {
      if (!this.db) {
        resolve(false);
        return;
      }

      try {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      } catch (error) {
        console.error('❌ IndexedDB removeItem failed:', error);
        resolve(false);
      }
    });
  }

  private async clearIndexedDB(): Promise<boolean> {
    return new Promise(resolve => {
      if (!this.db) {
        resolve(false);
        return;
      }

      try {
        const storeNames = Array.from(this.db.objectStoreNames);
        const transaction = this.db.transaction(storeNames, 'readwrite');

        let completed = 0;
        let failed = false;

        storeNames.forEach(storeName => {
          const store = transaction.objectStore(storeName);
          const request = store.clear();

          request.onsuccess = () => {
            completed++;
            if (completed === storeNames.length && !failed) {
              resolve(true);
            }
          };

          request.onerror = () => {
            failed = true;
            resolve(false);
          };
        });
      } catch (error) {
        console.error('❌ IndexedDB clear failed:', error);
        resolve(false);
      }
    });
  }

  /**
   * Calculate storage size
   */
  private calculateStorageSize(storage: Storage): number {
    let total = 0;
    try {
      for (const key in storage) {
        if (Object.prototype.hasOwnProperty.call(storage, key)) {
          total += storage[key].length + key.length;
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to calculate storage size:', error);
    }
    return total;
  }

  /**
   * Cleanup expired items
   */
  public async cleanupExpiredItems(): Promise<void> {
    console.log('🧹 Cleaning up expired storage items...');

    const now = Date.now();

    // Cleanup localStorage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const item = this.getLocalStorageItem(key);
          if (item && item.expiry && now > item.expiry) {
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      if (keysToRemove.length > 0) {
        console.log(`🗑️ Removed ${keysToRemove.length} expired items from localStorage`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to cleanup localStorage:', error);
    }

    // Cleanup sessionStorage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          const item = this.getSessionStorageItem(key);
          if (item && item.expiry && now > item.expiry) {
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
      if (keysToRemove.length > 0) {
        console.log(`🗑️ Removed ${keysToRemove.length} expired items from sessionStorage`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to cleanup sessionStorage:', error);
    }

    // Cleanup IndexedDB (more complex, would need cursor iteration)
    // This is left as a future enhancement
  }
}

// Create singleton instance
export const storageManager = StorageManager.getInstance();

// Auto-cleanup on startup
if (typeof window !== 'undefined') {
  // Cleanup expired items on load
  setTimeout(() => {
    storageManager.cleanupExpiredItems();
  }, 1000);

  // Periodic cleanup every 5 minutes
  setInterval(
    () => {
      storageManager.cleanupExpiredItems();
    },
    5 * 60 * 1000
  );
}
