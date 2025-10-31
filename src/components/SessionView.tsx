import { useState, useRef } from 'react';
import { MeditationSession } from '../types';
import { moods } from '../data/moods';
import './SessionView.css';

interface SessionViewProps {
  session: MeditationSession;
  onBack: () => void;
}

export default function SessionView({ session, onBack }: SessionViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const mood = moods.find(m => m.id === session.mood || m.name === session.mood);

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const formatted = date.toLocaleDateString('fr-FR', options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  return (
    <div className="session-view fade-in">
      <div className="session-view-header">
        <button className="back-button" onClick={onBack}>
          ← Retour à l'historique
        </button>

        <div className="session-info">
          <div
            className="session-mood-badge"
            style={{ backgroundColor: `${mood?.color}15`, color: mood?.color }}
          >
            <span className="mood-icon">{mood?.icon || '🌟'}</span>
            <span className="mood-name">{mood?.name || session.mood}</span>
          </div>

          <p className="session-date">{formatDate(session.date)}</p>
        </div>
      </div>

      <div className="session-view-content">
        <h2 className="session-title">Méditation de {session.userName}</h2>

        {session.audioUrl && (
          <div className="audio-player">
            <button
              className="play-button"
              onClick={handlePlay}
              style={{ backgroundColor: mood?.color || 'var(--color-primary)' }}
            >
              <span className="play-icon">{isPlaying ? '⏸' : '▶'}</span>
            </button>
            <p className="audio-hint">
              {isPlaying ? 'En cours de lecture...' : 'Cliquez pour écouter'}
            </p>
            <audio
              ref={audioRef}
              src={session.audioUrl}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        )}

        <div className="meditation-text-container">
          <div className="meditation-text">
            {session.meditationText.split('\n\n').map((paragraph, index) => (
              <p key={index} className="meditation-paragraph">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
