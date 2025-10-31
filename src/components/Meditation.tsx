import { useState, useEffect, useRef } from 'react';
import type { Mood, UserResponse } from '../types';
import { generateMeditation, generateAudio } from '../services/api';
import './Meditation.css';

interface MeditationProps {
  mood: Mood;
  userName: string;
  responses: UserResponse[];
  anthropicApiKey: string;
  elevenlabsApiKey?: string;
  onComplete: (meditationText: string, audioUrl?: string) => void;
}

export default function Meditation({
  mood,
  userName,
  responses,
  anthropicApiKey,
  elevenlabsApiKey,
  onComplete
}: MeditationProps) {
  const [status, setStatus] = useState<'generating' | 'ready' | 'playing' | 'error'>('generating');
  const [meditationText, setMeditationText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string>();
  const [error, setError] = useState<string>();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    try {
      setStatus('generating');

      // Générer le texte de méditation
      const text = await generateMeditation(anthropicApiKey, userName, mood, responses);
      setMeditationText(text);

      // Générer l'audio si la clé API est fournie
      if (elevenlabsApiKey) {
        try {
          const audio = await generateAudio(elevenlabsApiKey, text);
          setAudioUrl(audio);
        } catch (audioError) {
          console.error('Erreur audio:', audioError);
          // Continuer sans audio si erreur
        }
      }

      setStatus('ready');
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de générer la méditation. Vérifiez votre clé API.');
      setStatus('error');
    }
  };

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

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  const handleComplete = () => {
    onComplete(meditationText, audioUrl);
  };

  if (status === 'generating') {
    return (
      <div className="meditation">
        <div className="meditation-loading fade-in">
          <div className="loading-icon" style={{ color: mood.color }}>
            <div className="pulse-ring"></div>
            <span className="loading-emoji">{mood.icon}</span>
          </div>
          <h2 className="loading-title">Création de votre méditation...</h2>
          <p className="loading-text">
            Nous préparons un message personnalisé pour vous accompagner aujourd'hui.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="meditation">
        <div className="meditation-error fade-in">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Une erreur est survenue</h2>
          <p className="error-text">{error}</p>
          <button className="retry-button" onClick={generateContent}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="meditation fade-in">
      <div className="meditation-header">
        <div className="mood-badge" style={{ backgroundColor: `${mood.color}15`, color: mood.color }}>
          <span className="mood-badge-icon">{mood.icon}</span>
          <span className="mood-badge-text">{mood.name}</span>
        </div>
      </div>

      <div className="meditation-content">
        <h2 className="meditation-title">Votre méditation personnalisée</h2>

        {audioUrl && (
          <div className="audio-player">
            <button
              className="play-button"
              onClick={handlePlay}
              style={{ backgroundColor: mood.color }}
            >
              <span className="play-icon">{isPlaying ? '⏸' : '▶'}</span>
            </button>
            <p className="audio-hint">
              {isPlaying ? 'En cours de lecture...' : 'Cliquez pour écouter'}
            </p>
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={handleAudioEnd}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        )}

        <div className="meditation-text-container">
          <div className="meditation-text">
            {meditationText.split('\n\n').map((paragraph, index) => (
              <p key={index} className="meditation-paragraph">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="meditation-actions">
          <button
            className="complete-button"
            onClick={handleComplete}
            style={{ backgroundColor: mood.color }}
          >
            Enregistrer cette méditation
          </button>
        </div>
      </div>

      <div className="meditation-ornament">
        <div className="ornament-circle" style={{ borderColor: mood.color }}></div>
      </div>
    </div>
  );
}
