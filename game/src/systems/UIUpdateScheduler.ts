/**
 * UIUpdateScheduler - Performance-optimized UI update batching system
 * Manages RAF-based update cycles and priority queuing for smooth UI updates
 */

import { UIUpdate, UIPerformanceMetrics } from '../types/ui';

export type UpdatePriority = 'high' | 'normal' | 'low';
export type PerformanceProfile = 'high' | 'balanced' | 'low';

export interface UpdateBatch {
  updates: UIUpdate[];
  timestamp: number;
  frameId: number;
}

export interface SchedulerConfig {
  maxUpdatesPerFrame: number;
  maxQueueSize: number;
  performanceProfile: PerformanceProfile;
  enableProfiling: boolean;
  targetFrameRate: number;
}

export interface UpdateCallback {
  (update: UIUpdate): Promise<void> | void;
}

export class UIUpdateScheduler {
  private updateQueue: UIUpdate[] = [];
  private isProcessing = false;
  private rafId: number | null = null;
  private updateCallback: UpdateCallback | null = null;
  private frameStartTime = 0;
  private frameCount = 0;
  private totalUpdateTime = 0;
  private maxUpdateTime = 0;
  private performanceHistory: number[] = [];
  private config: SchedulerConfig;

  // Performance tracking
  private lastFrameTime = 0;
  private droppedFrames = 0;
  private consecutiveSlowFrames = 0;

  constructor(config?: Partial<SchedulerConfig>) {
    this.config = {
      maxUpdatesPerFrame: 50,
      maxQueueSize: 500,
      performanceProfile: 'balanced',
      enableProfiling: true,
      targetFrameRate: 60,
      ...config
    };

    this.adjustConfigForPerformance();
  }

  /**
   * Set the callback function that will process individual UI updates
   */
  public setUpdateCallback(callback: UpdateCallback): void {
    this.updateCallback = callback;
  }

  /**
   * Schedule a UI update for processing
   */
  public scheduleUpdate(update: UIUpdate): void {
    // Set default priority if not specified
    if (!update.priority) {
      update.priority = 'normal';
    }

    // Check queue size limit
    if (this.updateQueue.length >= this.config.maxQueueSize) {
      this.handleQueueOverflow();
    }

    // Insert update based on priority
    this.insertUpdateByPriority(update);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.startProcessing();
    }
  }

  /**
   * Schedule multiple updates in a batch
   */
  public scheduleBatch(updates: UIUpdate[]): void {
    updates.forEach(update => this.scheduleUpdate(update));
  }

  /**
   * Cancel a scheduled update by component ID and property
   */
  public cancelUpdate(componentId: string, property?: string): void {
    this.updateQueue = this.updateQueue.filter(update => {
      if (update.componentId !== componentId) return true;
      if (property && update.property !== property) return true;
      return false;
    });
  }

  /**
   * Cancel all scheduled updates for a component
   */
  public cancelAllUpdates(componentId?: string): void {
    if (componentId) {
      this.updateQueue = this.updateQueue.filter(update => update.componentId !== componentId);
    } else {
      this.updateQueue.length = 0;
    }
  }

  /**
   * Get current queue size
   */
  public getQueueSize(): number {
    return this.updateQueue.length;
  }

  /**
   * Check if scheduler is currently processing updates
   */
  public isProcessingUpdates(): boolean {
    return this.isProcessing;
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): UIPerformanceMetrics {
    const averageUpdateTime = this.frameCount > 0 ? this.totalUpdateTime / this.frameCount : 0;
    const frameRate = this.calculateFrameRate();

    return {
      averageUpdateTime,
      maxUpdateTime: this.maxUpdateTime,
      updateCount: this.frameCount,
      queueSize: this.updateQueue.length,
      activeComponents: this.getActiveComponentCount(),
      frameRate
    };
  }

  /**
   * Update performance profile
   */
  public setPerformanceProfile(profile: PerformanceProfile): void {
    this.config.performanceProfile = profile;
    this.adjustConfigForPerformance();
  }

  /**
   * Get pending updates for a specific component
   */
  public getPendingUpdates(componentId: string): UIUpdate[] {
    return this.updateQueue.filter(update => update.componentId === componentId);
  }

  /**
   * Force process all queued updates immediately (use with caution)
   */
  public async flushUpdates(): Promise<void> {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    await this.processUpdateBatch();
    this.isProcessing = false;
  }

  /**
   * Stop the scheduler and clear all pending updates
   */
  public stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.isProcessing = false;
    this.updateQueue.length = 0;
    this.resetPerformanceMetrics();
  }

  /**
   * Start processing updates using RAF
   */
  private startProcessing(): void {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    this.scheduleNextFrame();
  }

  /**
   * Schedule the next frame for processing
   */
  private scheduleNextFrame(): void {
    this.rafId = requestAnimationFrame((timestamp) => {
      this.frameStartTime = timestamp;
      this.processFrame(timestamp);
    });
  }

  /**
   * Process a single animation frame
   */
  private async processFrame(timestamp: number): Promise<void> {
    const frameTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    // Check for dropped frames
    const expectedFrameTime = 1000 / this.config.targetFrameRate;
    if (frameTime > expectedFrameTime * 1.5) {
      this.droppedFrames++;
      this.consecutiveSlowFrames++;
    } else {
      this.consecutiveSlowFrames = 0;
    }

    // Adjust performance if we're having issues
    if (this.consecutiveSlowFrames > 3) {
      this.adaptPerformance();
    }

    try {
      await this.processUpdateBatch();
    } catch (error) {
      console.error('Error processing UI update batch:', error);
    }

    // Continue processing if there are more updates
    if (this.updateQueue.length > 0) {
      this.scheduleNextFrame();
    } else {
      this.isProcessing = false;
    }
  }

  /**
   * Process a batch of updates for the current frame
   */
  private async processUpdateBatch(): Promise<void> {
    if (this.updateQueue.length === 0 || !this.updateCallback) {
      return;
    }

    const batchStartTime = performance.now();
    const maxUpdatesThisFrame = this.calculateMaxUpdatesForFrame();
    const updates = this.updateQueue.splice(0, maxUpdatesThisFrame);

    // Group updates by component for efficiency
    const updatesByComponent = this.groupUpdatesByComponent(updates);

    // Process updates
    for (const [componentId, componentUpdates] of updatesByComponent.entries()) {
      try {
        // Process most recent update for each property (consolidation)
        const consolidatedUpdates = this.consolidateUpdates(componentUpdates);
        
        for (const update of consolidatedUpdates) {
          await this.updateCallback(update);
        }
      } catch (error) {
        console.error(`Error processing updates for component ${componentId}:`, error);
      }
    }

    // Track performance
    const batchTime = performance.now() - batchStartTime;
    this.updatePerformanceMetrics(batchTime, updates.length);
  }

  /**
   * Insert update into queue based on priority
   */
  private insertUpdateByPriority(update: UIUpdate): void {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    const updatePriority = priorityOrder[update.priority || 'normal'];

    let insertIndex = this.updateQueue.length;
    for (let i = 0; i < this.updateQueue.length; i++) {
      const queuedUpdate = this.updateQueue[i];
      if (queuedUpdate) {
        const queuedPriority = priorityOrder[queuedUpdate.priority || 'normal'];
        if (updatePriority < queuedPriority) {
          insertIndex = i;
          break;
        }
      }
    }

    this.updateQueue.splice(insertIndex, 0, update);
  }

  /**
   * Handle queue overflow by removing low priority updates
   */
  private handleQueueOverflow(): void {
    console.warn('UI update queue overflow, removing low priority updates');
    
    // Remove oldest low priority updates first
    const lowPriorityIndices: number[] = [];
    this.updateQueue.forEach((update, index) => {
      if (update.priority === 'low') {
        lowPriorityIndices.push(index);
      }
    });

    // Remove from the end to maintain indices
    for (let i = lowPriorityIndices.length - 1; i >= 0; i--) {
      const index = lowPriorityIndices[i];
      if (index !== undefined) {
        this.updateQueue.splice(index, 1);
      }
      if (this.updateQueue.length < this.config.maxQueueSize) break;
    }

    // If still over limit, remove oldest updates
    if (this.updateQueue.length >= this.config.maxQueueSize) {
      const removeCount = this.updateQueue.length - this.config.maxQueueSize + 1;
      this.updateQueue.splice(0, removeCount);
    }
  }

  /**
   * Calculate maximum updates to process this frame based on performance
   */
  private calculateMaxUpdatesForFrame(): number {
    const baseMax = this.config.maxUpdatesPerFrame;
    
    // Reduce if we're having performance issues
    if (this.consecutiveSlowFrames > 0) {
      return Math.max(1, Math.floor(baseMax * 0.7));
    }
    
    // Check if we have time budget remaining
    const averageUpdateTime = this.frameCount > 0 ? this.totalUpdateTime / this.frameCount : 1;
    const frameBudget = 1000 / this.config.targetFrameRate; // Available time per frame
    const maxByTime = Math.floor(frameBudget / Math.max(averageUpdateTime, 0.1));
    
    return Math.min(baseMax, maxByTime);
  }

  /**
   * Group updates by component ID for batch processing
   */
  private groupUpdatesByComponent(updates: UIUpdate[]): Map<string, UIUpdate[]> {
    const grouped = new Map<string, UIUpdate[]>();
    
    updates.forEach(update => {
      if (!grouped.has(update.componentId)) {
        grouped.set(update.componentId, []);
      }
      grouped.get(update.componentId)!.push(update);
    });
    
    return grouped;
  }

  /**
   * Consolidate multiple updates to the same property
   */
  private consolidateUpdates(updates: UIUpdate[]): UIUpdate[] {
    const propertyMap = new Map<string, UIUpdate>();
    
    // Keep only the most recent update for each property
    updates.forEach(update => {
      const key = `${update.componentId}.${update.property}`;
      const existing = propertyMap.get(key);
      
      if (!existing || update.timestamp > existing.timestamp) {
        propertyMap.set(key, update);
      }
    });
    
    return Array.from(propertyMap.values());
  }

  /**
   * Update performance tracking metrics
   */
  private updatePerformanceMetrics(batchTime: number, updateCount: number): void {
    if (!this.config.enableProfiling) return;

    this.frameCount++;
    this.totalUpdateTime += batchTime;
    this.maxUpdateTime = Math.max(this.maxUpdateTime, batchTime);
    
    // Keep rolling history for frame rate calculation
    this.performanceHistory.push(batchTime);
    if (this.performanceHistory.length > 60) { // Keep last 60 frames
      this.performanceHistory.shift();
    }
  }

  /**
   * Calculate current frame rate
   */
  private calculateFrameRate(): number {
    if (this.performanceHistory.length < 2) return 0;
    
    const totalTime = this.performanceHistory.reduce((sum, time) => sum + time, 0);
    const averageFrameTime = totalTime / this.performanceHistory.length;
    
    return averageFrameTime > 0 ? 1000 / averageFrameTime : 0;
  }

  /**
   * Get count of active components in queue
   */
  private getActiveComponentCount(): number {
    const componentIds = new Set(this.updateQueue.map(update => update.componentId));
    return componentIds.size;
  }

  /**
   * Adjust configuration based on performance profile
   */
  private adjustConfigForPerformance(): void {
    switch (this.config.performanceProfile) {
      case 'high':
        this.config.maxUpdatesPerFrame = 100;
        this.config.maxQueueSize = 1000;
        this.config.targetFrameRate = 60;
        break;
      case 'balanced':
        this.config.maxUpdatesPerFrame = 50;
        this.config.maxQueueSize = 500;
        this.config.targetFrameRate = 60;
        break;
      case 'low':
        this.config.maxUpdatesPerFrame = 25;
        this.config.maxQueueSize = 250;
        this.config.targetFrameRate = 30;
        break;
    }
  }

  /**
   * Adapt performance settings dynamically
   */
  private adaptPerformance(): void {
    console.warn('Adapting UI update performance due to slow frames');
    
    // Reduce max updates per frame
    this.config.maxUpdatesPerFrame = Math.max(5, Math.floor(this.config.maxUpdatesPerFrame * 0.8));
    
    // Reset consecutive slow frame counter
    this.consecutiveSlowFrames = 0;
  }

  /**
   * Reset all performance metrics
   */
  private resetPerformanceMetrics(): void {
    this.frameCount = 0;
    this.totalUpdateTime = 0;
    this.maxUpdateTime = 0;
    this.performanceHistory.length = 0;
    this.droppedFrames = 0;
    this.consecutiveSlowFrames = 0;
    this.lastFrameTime = 0;
  }
}