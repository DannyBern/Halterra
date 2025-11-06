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

      // Sauvegarder toutes les sessions - pas de limite automatique
      const dataToSave = JSON.stringify(sessions);

      // Log pour monitoring (mais ne bloque plus la sauvegarde)
      const sizeInMB = new Blob([dataToSave]).size / 1024 / 1024;
      console.log(`Saving session. Total storage size: ${sizeInMB.toFixed(2)} MB`);
      console.log(`Session has audio: ${!!session.audioUrl}, audio length: ${session.audioUrl?.length || 0}`);

      localStorage.setItem(SESSIONS_KEY, dataToSave);
      console.log('✅ Session saved successfully WITH AUDIO');
    } catch (error) {
      console.error('❌ Error saving meditation session:', error);

      // Si erreur de quota, informer l'utilisateur - NE PAS supprimer automatiquement
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('⚠️ localStorage quota exceeded. User needs to manually delete old sessions.');
        throw new Error('Espace de stockage insuffisant. Supprimez des méditations anciennes dans l\'historique pour libérer de l\'espace.');
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
