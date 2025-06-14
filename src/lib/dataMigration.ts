import React from 'react';
import { Trade } from '../types/trade';
import { tradeService, journalService, playbookService } from './firebaseService';

// Migration utility for moving localStorage data to Firebase
export class DataMigrationService {
  private static readonly STORAGE_KEYS = {
    TRADES: 'chartJournalTrades',
    JOURNAL: 'chartJournalEntries',
    PLAYBOOKS: 'chartJournalPlaybooks',
    MIGRATION_COMPLETED: 'firebaseMigrationCompleted'
  };

  // Check if migration has already been completed
  static isMigrationCompleted(): boolean {
    return localStorage.getItem(this.STORAGE_KEYS.MIGRATION_COMPLETED) === 'true';
  }

  // Mark migration as completed
  static markMigrationCompleted(): void {
    localStorage.setItem(this.STORAGE_KEYS.MIGRATION_COMPLETED, 'true');
  }

  // Get localStorage data for migration
  static getLocalStorageData() {
    const trades = this.getLocalTrades();
    const journalEntries = this.getLocalJournalEntries();
    const playbooks = this.getLocalPlaybooks();

    return {
      trades,
      journalEntries,
      playbooks,
      hasData: trades.length > 0 || journalEntries.length > 0 || playbooks.length > 0
    };
  }

  private static getLocalTrades(): Trade[] {
    try {
      const tradesData = localStorage.getItem(this.STORAGE_KEYS.TRADES);
      return tradesData ? JSON.parse(tradesData) : [];
    } catch (error) {
      console.error('Error parsing local trades data:', error);
      return [];
    }
  }

  private static getLocalJournalEntries(): any[] {
    try {
      const journalData = localStorage.getItem(this.STORAGE_KEYS.JOURNAL);
      return journalData ? JSON.parse(journalData) : [];
    } catch (error) {
      console.error('Error parsing local journal data:', error);
      return [];
    }
  }

  private static getLocalPlaybooks(): any[] {
    try {
      const playbooksData = localStorage.getItem(this.STORAGE_KEYS.PLAYBOOKS);
      return playbooksData ? JSON.parse(playbooksData) : [];
    } catch (error) {
      console.error('Error parsing local playbooks data:', error);
      return [];
    }
  }

  // Migrate all data to Firebase
  static async migrateToFirebase(userId: string): Promise<{
    success: boolean;
    migrated: {
      trades: number;
      journalEntries: number;
      playbooks: number;
    };
    errors: string[];
  }> {
    const errors: string[] = [];
    const migrated = {
      trades: 0,
      journalEntries: 0,
      playbooks: 0
    };

    try {
      // Check if migration already completed
      if (this.isMigrationCompleted()) {
        console.log('Migration already completed, skipping...');
        return { success: true, migrated, errors };
      }

      // Get local data
      const localData = this.getLocalStorageData();

      if (!localData.hasData) {
        console.log('No local data to migrate');
        this.markMigrationCompleted();
        return { success: true, migrated, errors };
      }

      // Check if user already has data in Firebase
      const existingTrades = await tradeService.getTrades(userId);
      
      if (existingTrades.length > 0) {
        console.log('User already has trades in Firebase, skipping migration');
        this.markMigrationCompleted();
        return { success: true, migrated, errors };
      }

      // Migrate trades
      console.log(`Migrating ${localData.trades.length} trades...`);
      for (const trade of localData.trades) {
        try {
          const { id, ...tradeData } = trade;
          await tradeService.addTrade(userId, tradeData);
          migrated.trades++;
        } catch (error) {
          console.error('Error migrating trade:', trade.id, error);
          errors.push(`Failed to migrate trade ${trade.symbol}: ${error}`);
        }
      }

      // Migrate journal entries
      console.log(`Migrating ${localData.journalEntries.length} journal entries...`);
      for (const entry of localData.journalEntries) {
        try {
          const { id, createdAt, updatedAt, ...entryData } = entry;
          await journalService.addJournalEntry(userId, entryData);
          migrated.journalEntries++;
        } catch (error) {
          console.error('Error migrating journal entry:', entry.id, error);
          errors.push(`Failed to migrate journal entry: ${error}`);
        }
      }

      // Migrate playbooks
      console.log(`Migrating ${localData.playbooks.length} playbooks...`);
      for (const playbook of localData.playbooks) {
        try {
          const { id, createdAt, updatedAt, ...playbookData } = playbook;
          await playbookService.addPlaybook(userId, playbookData);
          migrated.playbooks++;
        } catch (error) {
          console.error('Error migrating playbook:', playbook.id, error);
          errors.push(`Failed to migrate playbook ${playbook.name}: ${error}`);
        }
      }

      // Clear localStorage after successful migration
      if (errors.length === 0) {
        this.clearLocalStorage();
        this.markMigrationCompleted();
        console.log('Migration completed successfully!');
      } else {
        console.warn('Migration completed with errors:', errors);
      }

      return {
        success: errors.length === 0,
        migrated,
        errors
      };

    } catch (error) {
      console.error('Migration failed:', error);
      errors.push(`Migration failed: ${error}`);
      return {
        success: false,
        migrated,
        errors
      };
    }
  }

  // Clear localStorage data after successful migration
  private static clearLocalStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.TRADES);
      localStorage.removeItem(this.STORAGE_KEYS.JOURNAL);
      localStorage.removeItem(this.STORAGE_KEYS.PLAYBOOKS);
      console.log('Local storage cleared after migration');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Backup localStorage data before migration (optional)
  static backupLocalData(): string {
    const localData = this.getLocalStorageData();
    const backup = {
      timestamp: new Date().toISOString(),
      data: localData
    };
    return JSON.stringify(backup, null, 2);
  }

  // Restore from backup (if needed)
  static restoreFromBackup(backupData: string): boolean {
    try {
      const backup = JSON.parse(backupData);
      
      if (backup.data.trades.length > 0) {
        localStorage.setItem(this.STORAGE_KEYS.TRADES, JSON.stringify(backup.data.trades));
      }
      
      if (backup.data.journalEntries.length > 0) {
        localStorage.setItem(this.STORAGE_KEYS.JOURNAL, JSON.stringify(backup.data.journalEntries));
      }
      
      if (backup.data.playbooks.length > 0) {
        localStorage.setItem(this.STORAGE_KEYS.PLAYBOOKS, JSON.stringify(backup.data.playbooks));
      }

      // Remove migration completed flag to allow re-migration
      localStorage.removeItem(this.STORAGE_KEYS.MIGRATION_COMPLETED);
      
      return true;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  }
}
