import { useState, useEffect } from 'react';
import type { MeditationSession } from '../types';
import { storage } from '../utils/storage';
import { moods } from '../data/moods';
import './History.css';

interface HistoryProps {
  onBack: () => void;
  onSessionSelect: (session: MeditationSession) => void;
}

export default function History({ onBack, onSessionSelect }: HistoryProps) {
  const [sessions, setSessions] = useState<MeditationSession[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    const allSessions = storage.getAllSessions();
    // Trier par date décroissante (plus récent en premier)
    const sorted = allSessions.sort((a, b) => b.timestamp - a.timestamp);
    setSessions(sorted);
  };

  const groupSessionsByDate = () => {
    const groups: { [key: string]: MeditationSession[] } = {};

    sessions.forEach(session => {
      if (!groups[session.date]) {
        groups[session.date] = [];
      }
      groups[session.date].push(session);
    });

    return groups;
  };

  const formatDate = (dateString: string) => {
    // Parse la date en format local pour éviter les problèmes de timezone
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month - 1 car les mois commencent à 0

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset l'heure pour comparaison exacte

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Comparaison en millisecondes après reset de l'heure
    const dateTime = new Date(date).setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    const yesterdayTime = yesterday.getTime();

    if (dateTime === todayTime) {
      return "Aujourd'hui";
    } else if (dateTime === yesterdayTime) {
      return 'Hier';
    } else {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      const formatted = date.toLocaleDateString('fr-FR', options);
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
  };

  const getMoodById = (moodId: string) => {
    return moods.find(m => m.id === moodId || m.name === moodId);
  };

  const groupedSessions = groupSessionsByDate();
  const dates = Object.keys(groupedSessions).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="history fade-in">
      <div className="history-header">
        <button className="back-button" onClick={onBack}>
          ← Retour
        </button>
        <h1 className="history-title">Historique de vos méditations</h1>
        <p className="history-subtitle">
          Revisitez vos moments de réflexion passés
        </p>
      </div>

      <div className="history-content">
        {sessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🪷</div>
            <p className="empty-text">
              Vous n'avez pas encore de méditations enregistrées.<br />
              Commencez votre première session pour créer votre historique.
            </p>
          </div>
        ) : (
          <div className="sessions-list">
            {dates.map(date => (
              <div key={date} className="date-group">
                <h3 className="date-header">{formatDate(date)}</h3>
                <div className="sessions-grid">
                  {groupedSessions[date].map(session => {
                    const mood = getMoodById(session.mood);
                    return (
                      <button
                        key={session.id}
                        className="session-card"
                        onClick={() => onSessionSelect(session)}
                        style={{ borderLeftColor: mood?.color || 'var(--color-accent)' }}
                      >
                        <div className="session-mood">
                          <span className="session-icon">{mood?.icon || '🌟'}</span>
                          <span className="session-mood-name">{mood?.name || session.mood}</span>
                        </div>
                        <p className="session-preview">
                          {session.meditationText.substring(0, 120)}...
                        </p>
                        {session.audioUrl && (
                          <div className="session-audio-badge">
                            🔊 Audio disponible
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
