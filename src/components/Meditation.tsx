import { useState, useEffect, useRef } from 'react';
import type { Mood, UserResponse } from '../types';
import { generateMeditation, generateAudio } from '../services/api';
import './Meditation.css';

interface MeditationProps {
  mood: Mood;
  userName: string;
  responses: UserResponse[];
  guideType: 'meditation' | 'reflection';
  anthropicApiKey: string;
  elevenlabsApiKey?: string;
  onComplete: (meditationText: string, audioBase64?: string) => void;
  onBack: () => void;
}

export default function Meditation({
  mood,
  userName,
  responses,
  guideType,
  anthropicApiKey,
  onComplete,
  onBack
}: MeditationProps) {
  const [status, setStatus] = useState<'generating-text' | 'generating-audio' | 'ready' | 'error'>('generating-text');
  const [meditationText, setMeditationText] = useState('');
  const [audioBase64, setAudioBase64] = useState<string>();
  const [audioUrl, setAudioUrl] = useState<string>();
  const [error, setError] = useState<string>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0); // Vitesse par défaut: 1.0x
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    try {
      setStatus('generating-text');

      // Générer le texte de méditation (retourne displayText et audioText)
      const { displayText, audioText } = await generateMeditation(anthropicApiKey, userName, mood, responses, guideType);
      setMeditationText(displayText);  // Version propre pour l'affichage

      // TOUJOURS générer l'audio - le backend Vercel gère les clés API
      setStatus('generating-audio');

      try {
        // Générer l'audio avec la version SSML (audioText) - retourne directement un data URL base64
        // Passer le guideType pour choisir la bonne voix (féminine pour méditation, masculine pour réflexion)
        const audioDataUrl = await generateAudio('', audioText, '', guideType);

        setAudioBase64(audioDataUrl);
        setAudioUrl(audioDataUrl);

        // Ne passer à 'ready' QUE quand l'audio est prêt
        setStatus('ready');
      } catch (audioError) {
        console.error('Erreur audio:', audioError);
        setError('Impossible de générer l\'audio. Veuillez réessayer.');
        setStatus('error');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de générer la méditation. Vérifiez votre connexion.');
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

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  const handleComplete = () => {
    onComplete(meditationText, audioBase64);
  };

  if (status === 'generating-text') {
    return (
      <div className="meditation">
        <div className="meditation-loading fade-in">
          <div className="loading-icon" style={{ color: mood.color }}>
            <div className="pulse-ring"></div>
            <span className="loading-emoji">{mood.icon}</span>
          </div>
          <h2 className="loading-title">Création de votre méditation...</h2>
          <p className="loading-text">
            Claude compose un message personnalisé pour vous accompagner aujourd'hui.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'generating-audio') {
    return (
      <div className="meditation">
        <div className="meditation-loading fade-in">
          <div className="loading-icon" style={{ color: mood.color }}>
            <div className="pulse-ring"></div>
            <span className="loading-emoji">🎧</span>
          </div>
          <h2 className="loading-title">Narration de votre méditation...</h2>
          <p className="loading-text">
            Votre voix prend vie grâce à l'intelligence artificielle.
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
    <div
      className={`meditation meditation-fullscreen fade-in ${isPlaying ? 'playing' : ''}`}
      onClick={audioUrl ? handlePlay : undefined}
      style={{ cursor: audioUrl ? 'pointer' : 'default' }}
    >
      <button
        className="back-button"
        onClick={(e) => {
          e.stopPropagation();
          onBack();
        }}
        aria-label="Retour"
      >
        ← Retour
      </button>

      <div className="meditation-header">
        <div className="mood-badge" style={{ backgroundColor: `${mood.color}15`, color: mood.color }}>
          <span className="mood-badge-icon">{mood.icon}</span>
          <span className="mood-badge-text">{mood.name}</span>
        </div>
      </div>

      <div className="meditation-content">
        <h2 className="meditation-title">Votre méditation personnalisée</h2>

        {audioUrl && (
          <>
            <div className="fullscreen-play-indicator">
              <div
                className={`play-button-sophisticated ${isPlaying ? 'playing' : ''}`}
                style={{
                  '--button-color': mood.color,
                  '--button-color-light': `${mood.color}15`
                } as React.CSSProperties}
              >
                <div className="play-button-bg"></div>
                <div className="play-button-pulse"></div>
                <span className="play-icon">
                  {isPlaying ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1"/>
                      <rect x="14" y="4" width="4" height="16" rx="1"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </span>
              </div>
              <div className="audio-hint">
                {isPlaying ? (
                  <>
                    <span className="audio-status playing">En lecture - Touchez pour pauser</span>
                    <span className="audio-waves">
                      <span className="wave"></span>
                      <span className="wave"></span>
                      <span className="wave"></span>
                    </span>
                  </>
                ) : (
                  <span className="audio-status">Touchez n'importe où pour démarrer</span>
                )}
              </div>
            </div>
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={handleAudioEnd}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedMetadata={() => {
                if (audioRef.current) {
                  audioRef.current.playbackRate = playbackSpeed;
                }
              }}
            />
          </>
        )}

        {audioUrl && (
          <div className="speed-control" onClick={(e) => e.stopPropagation()}>
            <label className="speed-label">Vitesse de lecture: {playbackSpeed.toFixed(2)}x</label>
            <div className="speed-slider-container">
              <span className="speed-label-min">0.75x</span>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.05"
                value={playbackSpeed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="speed-slider"
                style={{
                  background: `linear-gradient(to right, ${mood.color} 0%, ${mood.color} ${((playbackSpeed - 0.75) / 0.75) * 100}%, #ddd ${((playbackSpeed - 0.75) / 0.75) * 100}%, #ddd 100%)`
                }}
              />
              <span className="speed-label-max">1.5x</span>
            </div>
            <div className="speed-presets">
              <button
                className="speed-preset-btn"
                onClick={() => handleSpeedChange(0.75)}
              >
                Très lent
              </button>
              <button
                className="speed-preset-btn"
                onClick={() => handleSpeedChange(1.0)}
              >
                Normal
              </button>
              <button
                className="speed-preset-btn"
                onClick={() => handleSpeedChange(1.25)}
              >
                Rapide
              </button>
            </div>
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

        <div className="meditation-actions" onClick={(e) => e.stopPropagation()}>
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
