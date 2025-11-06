import { useState, useEffect } from 'react';
import type { MeditationSession } from '../types';
import { storage } from '../utils/storage';
import { moods } from '../data/moods';
import { useFullscreenBackground } from '../hooks/useFullscreenBackground';
import './History.css';

interface HistoryProps {
  onBack: () => void;
  onSessionSelect: (session: MeditationSession) => void;
}

export default function History({ onBack, onSessionSelect }: HistoryProps) {
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const backgroundImage = `${import.meta.env.BASE_URL}professional_photograph_of_a_modern_home_library.jpeg`;
  const { FullscreenViewer, handlePressStart, handlePressEnd } = useFullscreenBackground(backgroundImage);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    const allSessions = storage.getAllSessions();
    // Trier par date décroissante (plus récent en premier)
    const sorted = allSessions.sort((a, b) => b.timestamp - a.timestamp);
    setSessions(sorted);
  };

  const handleDeleteClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation(); // Empêcher l'ouverture de la session
    setSessionToDelete(sessionId);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      setIsDeleting(true);
      // Petit délai pour l'animation
      setTimeout(() => {
        storage.deleteSession(sessionToDelete);
        loadSessions();
        setSessionToDelete(null);
        setIsDeleting(false);
      }, 300);
    }
  };

  const cancelDelete = () => {
    setSessionToDelete(null);
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
    <div
      className="history fade-in"
      style={{ backgroundImage: `url(${backgroundImage})` }}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
    >
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
                      <div key={session.id} className="session-card-wrapper">
                        <button
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
                        <button
                          className="delete-button"
                          onClick={(e) => handleDeleteClick(e, session.id)}
                          aria-label="Supprimer cette méditation"
                          title="Supprimer cette méditation"
                        >
                          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {sessionToDelete && (
        <div className="delete-modal-overlay" onClick={cancelDelete}>
          <div className={`delete-modal ${isDeleting ? 'deleting' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">🗑️</div>
            <h3 className="delete-modal-title">Supprimer cette méditation ?</h3>
            <p className="delete-modal-text">
              Cette action est irréversible. La méditation et son audio seront définitivement supprimés.
            </p>
            <div className="delete-modal-actions">
              <button className="delete-modal-cancel" onClick={cancelDelete}>
                Annuler
              </button>
              <button className="delete-modal-confirm" onClick={confirmDelete}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Background Viewer */}
      <FullscreenViewer />
    </div>
  );
}
