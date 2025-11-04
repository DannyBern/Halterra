import type { User, MeditationSession } from '../types';

const USER_KEY = 'halterra_user';
const SESSIONS_KEY = 'halterra_sessions';

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

  // Meditation sessions
  saveMeditationSession: (session: MeditationSession): void => {
    try {
      const sessions = storage.getAllSessions();
      sessions.push(session);

      // Essayer de sauvegarder
      const dataToSave = JSON.stringify(sessions);

      // Vérifier la taille (localStorage a généralement une limite de 5-10 MB)
      const sizeInMB = new Blob([dataToSave]).size / 1024 / 1024;
      console.log(`Saving session. Total storage size: ${sizeInMB.toFixed(2)} MB`);
      console.log(`Session has audio: ${!!session.audioUrl}, audio length: ${session.audioUrl?.length || 0}`);

      if (sizeInMB > 8) {
        console.warn('⚠️ Storage size approaching limit. Removing oldest sessions to make space...');
        // Supprimer les anciennes sessions pour faire de la place
        // On garde les 5 sessions les plus récentes (incluant la nouvelle)
        const sortedSessions = sessions.sort((a, b) => b.timestamp - a.timestamp);
        const recentSessions = sortedSessions.slice(0, 5);
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(recentSessions));
        console.log(`✅ Kept 5 most recent sessions WITH AUDIO to save space`);
        return;
      }

      localStorage.setItem(SESSIONS_KEY, dataToSave);
      console.log('✅ Session saved successfully WITH AUDIO');
    } catch (error) {
      console.error('❌ Error saving meditation session:', error);

      // Si erreur de quota, supprimer les anciennes sessions pour faire de la place
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded. Removing old sessions to make room...');
        try {
          const sessions = storage.getAllSessions();

          // Essayer de garder 3 sessions les plus récentes avec la nouvelle
          let sessionsToKeep = 3;
          let saved = false;

          while (sessionsToKeep > 0 && !saved) {
            const sortedSessions = [...sessions, session].sort((a, b) => b.timestamp - a.timestamp);
            const recentSessions = sortedSessions.slice(0, sessionsToKeep);

            try {
              localStorage.setItem(SESSIONS_KEY, JSON.stringify(recentSessions));
              console.log(`✅ Session saved WITH AUDIO (kept ${sessionsToKeep} sessions)`);
              saved = true;
            } catch {
              sessionsToKeep--;
            }
          }

          if (!saved) {
            // En dernier recours, sauvegarder UNIQUEMENT la nouvelle session AVEC audio
            localStorage.setItem(SESSIONS_KEY, JSON.stringify([session]));
            console.log('✅ Session saved WITH AUDIO (kept only this session)');
          }
        } catch (retryError) {
          console.error('❌ Failed to save session:', retryError);
          throw retryError;
        }
      } else {
        throw error;
      }
    }
  },

  getAllSessions: (): MeditationSession[] => {
    try {
      const data = localStorage.getItem(SESSIONS_KEY);
      if (!data) return [];

      const sessions = JSON.parse(data);
      console.log(`Retrieved ${sessions.length} sessions from storage`);
      return sessions;
    } catch (error) {
      console.error('❌ Error reading sessions from localStorage:', error);
      // Si le localStorage est corrompu, on le réinitialise
      console.warn('Resetting corrupted sessions storage');
      localStorage.removeItem(SESSIONS_KEY);
      return [];
    }
  },

  getSessionById: (id: string): MeditationSession | undefined => {
    const sessions = storage.getAllSessions();
    return sessions.find(s => s.id === id);
  },

  getSessionsByDate: (date: string): MeditationSession[] => {
    const sessions = storage.getAllSessions();
    return sessions.filter(s => s.date === date);
  },

  deleteSession: (id: string): void => {
    const sessions = storage.getAllSessions().filter(s => s.id !== id);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },

  clearAllSessions: (): void => {
    localStorage.removeItem(SESSIONS_KEY);
  }
};
