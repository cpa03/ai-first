import { SyncStatus } from './base';

export class SyncStatusTracker {
  private static instance: SyncStatusTracker;
  private syncStatuses: Map<string, SyncStatus> = new Map();

  static getInstance(): SyncStatusTracker {
    if (!SyncStatusTracker.instance) {
      SyncStatusTracker.instance = new SyncStatusTracker();
    }
    return SyncStatusTracker.instance;
  }

  setSyncStatus(exportId: string, status: SyncStatus): void {
    this.syncStatuses.set(exportId, {
      ...status,
      lastSync: new Date().toISOString(),
    });
  }

  getSyncStatus(exportId: string): SyncStatus | undefined {
    return this.syncStatuses.get(exportId);
  }

  getAllSyncStatuses(): Record<string, SyncStatus> {
    return Object.fromEntries(this.syncStatuses);
  }

  clearSyncStatus(exportId: string): void {
    this.syncStatuses.delete(exportId);
  }
}

export const syncStatusTracker = SyncStatusTracker.getInstance();
