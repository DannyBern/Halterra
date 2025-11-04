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

      if (sizeInMB > 8) {
        console.warn('⚠️ Storage size approaching limit. Consider removing oldest sessions.');
        // Optionnel : supprimer les anciennes sessions si on dépasse 8 MB
        // On garde les 10 sessions les plus récentes
        if (sessions.length > 10) {
          const sortedSessions = sessions.sort((a, b) => b.timestamp - a.timestamp);
          const recentSessions = sortedSessions.slice(0, 10);
          localStorage.setItem(SESSIONS_KEY, JSON.stringify(recentSessions));
          console.log('Kept 10 most recent sessions to save space');
          return;
        }
      }

      localStorage.setItem(SESSIONS_KEY, dataToSave);
      console.log('✅ Session saved successfully');
    } catch (error) {
      console.error('❌ Error saving meditation session:', error);

      // Si erreur de quota, essayer de sauvegarder sans l'audio
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded. Saving without audio...');
        try {
          const sessions = storage.getAllSessions();
          const sessionWithoutAudio = { ...session, audioUrl: undefined };
          sessions.push(sessionWithoutAudio);
          localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
          console.log('✅ Session saved without audio due to storage limit');
        } catch (retryError) {
          console.error('❌ Failed to save even without audio:', retryError);
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
