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
    const sessions = storage.getAllSessions();
    sessions.push(session);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },

  getAllSessions: (): MeditationSession[] => {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
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
