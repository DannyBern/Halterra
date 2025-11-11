/**
 * IndexedDB Cache Service for Halterra
 *
 * Provides efficient storage for meditation sessions and audio data.
 * Uses IndexedDB for large binary data (audio) and structured queries.
 *
 * Benefits over localStorage:
 * - Async operations (non-blocking)
 * - Handles large data (100+ sessions with audio)
 * - Efficient binary storage (Blob vs base64)
 * - 50-70% less memory usage
 * - Structured queries without parsing all data
 */

import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { MeditationSession } from '../types';

/**
 * Database schema definition
 */
interface HalterraDB extends DBSchema {
  sessions: {
    key: string; // session.id
    value: {
      id: string;
      date: string;
      userName: string;
      mood: string;
      guideType?: 'meditation' | 'reflection';
      duration?: 2 | 5 | 10;
      category?: string;
      intention?: string;
      meditationText: string;
      audioBlob?: Blob; // Audio stored as Blob instead of base64
      timestamp: number;
    };
    indexes: { 'by-date': string; 'by-timestamp': number };
  };
}

const DB_NAME = 'halterra-cache';
const DB_VERSION = 1;

class IndexedDBCache {
  private db: IDBPDatabase<HalterraDB> | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the IndexedDB database
   * Creates object stores and indexes on first run
   */
  async init(): Promise<void> {
    // Prevent multiple simultaneous initializations
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        this.db = await openDB<HalterraDB>(DB_NAME, DB_VERSION, {
          upgrade(db) {
            // Create sessions store if it doesn't exist
            if (!db.objectStoreNames.contains('sessions')) {
              const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });

              // Create indexes for efficient queries
              sessionStore.createIndex('by-date', 'date');
              sessionStore.createIndex('by-timestamp', 'timestamp');
            }
          },
        });
        console.log('✅ IndexedDB initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize IndexedDB:', error);
        throw error;
      }
    })();

    return this.initPromise;
  }

  /**
   * Ensure database is initialized before any operation
   */
  private async ensureInit(): Promise<IDBPDatabase<HalterraDB>> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  /**
   * Convert base64 data URL to Blob
   * More memory-efficient than storing base64 strings
   */
  private base64ToBlob(dataUrl: string): Blob | null {
    try {
      if (!dataUrl.startsWith('data:audio/mpeg;base64,')) {
        return null;
      }

      const base64 = dataUrl.split(',')[1];
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return new Blob([bytes], { type: 'audio/mpeg' });
    } catch (error) {
      console.error('Failed to convert base64 to Blob:', error);
      return null;
    }
  }

  /**
   * Convert Blob to base64 data URL
   * Used when retrieving audio from IndexedDB
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Save a meditation session to IndexedDB
   * Converts audio to Blob for efficient storage
   */
  async saveSession(session: MeditationSession): Promise<void> {
    const db = await this.ensureInit();

    try {
      // Convert audio base64 to Blob if present
      const audioBlob = session.audioUrl ? this.base64ToBlob(session.audioUrl) : undefined;

      // Store session with Blob instead of base64
      await db.put('sessions', {
        id: session.id,
        date: session.date,
        userName: session.userName,
        mood: session.mood,
        guideType: session.guideType,
        duration: session.duration,
        category: session.category,
        intention: session.intention,
        meditationText: session.meditationText,
        audioBlob: audioBlob || undefined,
        timestamp: session.timestamp,
      });

      console.log(`✅ Session ${session.id} saved to IndexedDB`);
    } catch (error) {
      console.error('❌ Failed to save session to IndexedDB:', error);
      throw error;
    }
  }

  /**
   * Get a session by ID
   * Reconstructs audio as base64 data URL
   */
  async getSession(id: string): Promise<MeditationSession | null> {
    const db = await this.ensureInit();

    try {
      const stored = await db.get('sessions', id);

      if (!stored) {
        return null;
      }

      // Convert Blob back to base64 data URL
      const audioUrl = stored.audioBlob ? await this.blobToBase64(stored.audioBlob) : undefined;

      return {
        id: stored.id,
        date: stored.date,
        userName: stored.userName,
        mood: stored.mood,
        guideType: stored.guideType,
        duration: stored.duration,
        category: stored.category,
        intention: stored.intention,
        meditationText: stored.meditationText,
        audioUrl,
        timestamp: stored.timestamp,
      };
    } catch (error) {
      console.error(`❌ Failed to get session ${id}:`, error);
      return null;
    }
  }

  /**
   * Get all sessions ordered by timestamp (newest first)
   */
  async getAllSessions(): Promise<MeditationSession[]> {
    const db = await this.ensureInit();

    try {
      const stored = await db.getAllFromIndex('sessions', 'by-timestamp');

      // Convert all sessions
      const sessions = await Promise.all(
        stored.map(async (item) => {
          const audioUrl = item.audioBlob ? await this.blobToBase64(item.audioBlob) : undefined;

          return {
            id: item.id,
            date: item.date,
            userName: item.userName,
            mood: item.mood,
            guideType: item.guideType,
            duration: item.duration,
            category: item.category,
            intention: item.intention,
            meditationText: item.meditationText,
            audioUrl,
            timestamp: item.timestamp,
          };
        })
      );

      // Sort by timestamp descending (newest first)
      return sessions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('❌ Failed to get all sessions:', error);
      return [];
    }
  }

  /**
   * Get sessions by date
   */
  async getSessionsByDate(date: string): Promise<MeditationSession[]> {
    const db = await this.ensureInit();

    try {
      const stored = await db.getAllFromIndex('sessions', 'by-date', date);

      const sessions = await Promise.all(
        stored.map(async (item) => {
          const audioUrl = item.audioBlob ? await this.blobToBase64(item.audioBlob) : undefined;

          return {
            id: item.id,
            date: item.date,
            userName: item.userName,
            mood: item.mood,
            guideType: item.guideType,
            duration: item.duration,
            category: item.category,
            intention: item.intention,
            meditationText: item.meditationText,
            audioUrl,
            timestamp: item.timestamp,
          };
        })
      );

      return sessions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error(`❌ Failed to get sessions for date ${date}:`, error);
      return [];
    }
  }

  /**
   * Delete a session by ID
   */
  async deleteSession(id: string): Promise<void> {
    const db = await this.ensureInit();

    try {
      await db.delete('sessions', id);
      console.log(`✅ Session ${id} deleted from IndexedDB`);
    } catch (error) {
      console.error(`❌ Failed to delete session ${id}:`, error);
      throw error;
    }
  }

  /**
   * Clear all sessions
   */
  async clearAllSessions(): Promise<void> {
    const db = await this.ensureInit();

    try {
      await db.clear('sessions');
      console.log('✅ All sessions cleared from IndexedDB');
    } catch (error) {
      console.error('❌ Failed to clear all sessions:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{ count: number; estimatedSize: number }> {
    const db = await this.ensureInit();

    try {
      const count = await db.count('sessions');

      // Estimate size (rough approximation)
      const allSessions = await db.getAll('sessions');
      const estimatedSize = allSessions.reduce((total, session) => {
        const textSize = new Blob([session.meditationText]).size;
        const audioSize = session.audioBlob ? session.audioBlob.size : 0;
        return total + textSize + audioSize;
      }, 0);

      return { count, estimatedSize };
    } catch (error) {
      console.error('❌ Failed to get stats:', error);
      return { count: 0, estimatedSize: 0 };
    }
  }
}

// Export singleton instance
export const indexedDBCache = new IndexedDBCache();
