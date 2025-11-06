import { useState, useEffect, useRef } from 'react';
import type { Mood } from '../types';
import { generateMeditation, generateAudio } from '../services/api';
import './Meditation.css';

interface MeditationProps {
  mood: Mood;
  userName: string;
  category: string;
  intention: string;
  guideType: 'meditation' | 'reflection';
  duration: 2 | 5 | 10;
  anthropicApiKey: string;
  elevenlabsApiKey?: string;
  onComplete: (meditationText: string, audioBase64?: string) => void;
  onBack: () => void;
}

export default function Meditation({
  mood,
  userName,
  category,
  intention,
  guideType,
  duration,
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
  const [loadingQuote, setLoadingQuote] = useState<{ quote: string; author: string } | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    generateContent();
    fetchLoadingQuote();
  }, []);

  const fetchLoadingQuote = async () => {
    try {
      const response = await fetch('https://halterra-backend-i3s4okq80-dannys-projects-ff6db2ea.vercel.app/api/quote', {
        cache: 'no-cache'
      });
      const data = await response.json();
      setLoadingQuote(data);
    } catch (error) {
      console.warn('Failed to fetch loading quote');
      setLoadingQuote({ quote: "Respire profondément et laisse le moment se déployer", author: "Halterra" });
    }
  };

  const generateContent = async () => {
    try {
      setStatus('generating-text');

      // Générer le texte de méditation (retourne displayText et audioText)
      const { displayText, audioText } = await generateMeditation(anthropicApiKey, userName, mood, category, intention, guideType, duration);
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
    const guideName = guideType === 'meditation' ? 'Iza' : 'Dann';
    const breathingClass = guideType === 'meditation' ? 'breathing-slow' : 'breathing-dynamic';

    return (
      <div className="meditation">
        <div className="meditation-loading-premium fade-in">
          {/* Breathing Circle Guide */}
          <div className="breathing-guide-container">
            <div
              className={`breathing-circle ${breathingClass}`}
              style={{
                '--mood-color': mood.color,
                '--mood-color-alpha': `${mood.color}33`
              } as React.CSSProperties}
            >
              <div className="breathing-circle-inner"></div>
              <div className="breathing-glow"></div>
              <div className="mood-icon-center">{mood.icon}</div>
            </div>
          </div>

          {/* Progress Phases */}
          <div className="loading-phases">
            <div className="phase-dot active"></div>
            <div className="phase-line"></div>
            <div className="phase-dot pulsing" style={{ backgroundColor: mood.color }}></div>
            <div className="phase-line"></div>
            <div className="phase-dot"></div>
          </div>

          <h2 className="loading-title-premium">Création de votre {guideType === 'meditation' ? 'méditation' : 'réflexion'}</h2>
          <p className="loading-subtitle-premium">
            {guideName} compose un moment unique pour toi
          </p>

          {/* Loading Quote */}
          {loadingQuote && (
            <div className="loading-quote fade-in">
              <p className="quote-text">"{loadingQuote.quote}"</p>
              <p className="quote-author">— {loadingQuote.author}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (status === 'generating-audio') {
    const guideName = guideType === 'meditation' ? 'Iza' : 'Dann';

    return (
      <div className="meditation">
        <div className="meditation-loading-premium fade-in">
          {/* Audio Wave Animation */}
          <div className="audio-generation-container">
            <div className="audio-waves-premium">
              <div className="wave-bar" style={{ '--delay': '0s', '--height': '60%', backgroundColor: mood.color } as React.CSSProperties}></div>
              <div className="wave-bar" style={{ '--delay': '0.1s', '--height': '80%', backgroundColor: mood.color } as React.CSSProperties}></div>
              <div className="wave-bar" style={{ '--delay': '0.2s', '--height': '100%', backgroundColor: mood.color } as React.CSSProperties}></div>
              <div className="wave-bar" style={{ '--delay': '0.3s', '--height': '80%', backgroundColor: mood.color } as React.CSSProperties}></div>
              <div className="wave-bar" style={{ '--delay': '0.4s', '--height': '60%', backgroundColor: mood.color } as React.CSSProperties}></div>
            </div>
            <div className="audio-icon-overlay">🎧</div>
          </div>

          {/* Progress Phases */}
          <div className="loading-phases">
            <div className="phase-dot completed" style={{ backgroundColor: mood.color }}></div>
            <div className="phase-line completed" style={{ backgroundColor: mood.color }}></div>
            <div className="phase-dot completed" style={{ backgroundColor: mood.color }}></div>
            <div className="phase-line"></div>
            <div className="phase-dot pulsing" style={{ backgroundColor: mood.color }}></div>
          </div>

          <h2 className="loading-title-premium">Narration en cours</h2>
          <p className="loading-subtitle-premium">
            La voix de {guideName} prend vie
          </p>

          {/* Progress Bar */}
          <div className="narration-progress">
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ backgroundColor: mood.color }}
              ></div>
            </div>
          </div>

          {/* Loading Quote */}
          {loadingQuote && (
            <div className="loading-quote fade-in">
              <p className="quote-text">"{loadingQuote.quote}"</p>
              <p className="quote-author">— {loadingQuote.author}</p>
            </div>
          )}
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
