import type { User, MeditationSession } from '../types';
import { indexedDBCache } from '../services/indexedDBCache';

const USER_KEY = 'halterra_user';
const SESSIONS_KEY = 'halterra_sessions';

/**
 * Hybrid Storage Strategy
 *
 * - User data: localStorage (small, needs sync access)
 * - Sessions: IndexedDB primary, localStorage fallback
 * - Automatic migration from localStorage to IndexedDB
 */

let isMigrated = false;

/**
 * Migrate existing localStorage sessions to IndexedDB
 * Runs once on first access
 */
async function migrateToIndexedDB(): Promise<void> {
  if (isMigrated) return;

  try {
    const legacyData = localStorage.getItem(SESSIONS_KEY);
    if (!legacyData) {
      isMigrated = true;
      return;
    }

    const sessions: MeditationSession[] = JSON.parse(legacyData);
    console.log(`🔄 Migrating ${sessions.length} sessions from localStorage to IndexedDB...`);

    // Save all to IndexedDB
    await Promise.all(sessions.map(session => indexedDBCache.saveSession(session)));

    console.log(`✅ Migration complete! ${sessions.length} sessions moved to IndexedDB`);

    // Keep localStorage as backup for now (can be removed later)
    // localStorage.removeItem(SESSIONS_KEY);

    isMigrated = true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    isMigrated = true; // Don't retry forever
  }
}

export const storage = {
  // User management
  saveUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  clearUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },

  // Meditation sessions - Now using IndexedDB
  saveMeditationSession: async (session: MeditationSession): Promise<void> => {
    try {
      // Save to IndexedDB (primary storage)
      await indexedDBCache.saveSession(session);

      // Also save to localStorage as backup (for compatibility)
      const sessions = await storage.getAllSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);

      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }

      try {
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      } catch {
        // If localStorage fails, that's ok - IndexedDB is primary
        console.warn('⚠️ localStorage backup failed (quota exceeded), but IndexedDB save succeeded');
      }

      console.log('✅ Session saved successfully to IndexedDB');
    } catch (error) {
      console.error('❌ Error saving meditation session:', error);
      throw new Error('Impossible de sauvegarder la session. Veuillez réessayer.');
    }
  },

  getAllSessions: async (): Promise<MeditationSession[]> => {
    try {
      // Migrate if needed
      await migrateToIndexedDB();

      // Get from IndexedDB (primary)
      const sessions = await indexedDBCache.getAllSessions();
      console.log(`Retrieved ${sessions.length} sessions from IndexedDB`);
      return sessions;
    } catch (error) {
      console.error('❌ Error reading sessions from IndexedDB, falling back to localStorage:', error);

      // Fallback to localStorage
      try {
        const data = localStorage.getItem(SESSIONS_KEY);
        if (!data) return [];

        const sessions = JSON.parse(data);
        console.log(`Retrieved ${sessions.length} sessions from localStorage (fallback)`);
        return sessions;
      } catch (localStorageError) {
        console.error('❌ Error reading from localStorage:', localStorageError);
        return [];
      }
    }
  },

  getSessionById: async (id: string): Promise<MeditationSession | undefined> => {
    try {
      await migrateToIndexedDB();
      const session = await indexedDBCache.getSession(id);
      return session || undefined;
    } catch (error) {
      console.error(`❌ Error getting session ${id} from IndexedDB:`, error);

      // Fallback to localStorage
      const sessions = await storage.getAllSessions();
      return sessions.find(s => s.id === id);
    }
  },

  getSessionsByDate: async (date: string): Promise<MeditationSession[]> => {
    try {
      await migrateToIndexedDB();
      return await indexedDBCache.getSessionsByDate(date);
    } catch (error) {
      console.error(`❌ Error getting sessions for ${date} from IndexedDB:`, error);

      // Fallback to localStorage
      const sessions = await storage.getAllSessions();
      return sessions.filter(s => s.date === date);
    }
  },

  deleteSession: async (id: string): Promise<void> => {
    try {
      // Delete from IndexedDB
      await indexedDBCache.deleteSession(id);

      // Also delete from localStorage backup
      const sessions = await storage.getAllSessions();
      const filtered = sessions.filter(s => s.id !== id);

      try {
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
      } catch {
        console.warn('⚠️ Failed to update localStorage backup');
      }
    } catch (error) {
      console.error(`❌ Error deleting session ${id}:`, error);
      throw new Error('Impossible de supprimer la session.');
    }
  },

  clearAllSessions: async (): Promise<void> => {
    try {
      await indexedDBCache.clearAllSessions();
      localStorage.removeItem(SESSIONS_KEY);
      console.log('✅ All sessions cleared from both IndexedDB and localStorage');
    } catch (error) {
      console.error('❌ Error clearing all sessions:', error);
      throw new Error('Impossible de supprimer toutes les sessions.');
    }
  }
};
