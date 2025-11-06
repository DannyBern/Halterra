import { useState, useEffect, useRef } from 'react';
import type { Mood } from '../types';
import { generateMeditation, generateAudio as generateAudioAPI } from '../services/api';
import './Meditation.css';

interface MeditationProps {
  mood: Mood;
  userName: string;
  category: string;
  intention: string;
  guideType: 'meditation' | 'reflection';
  duration: 2 | 5 | 10;
  generateAudio: boolean;
  anthropicApiKey: string;
  elevenlabsApiKey?: string;
  onComplete: (meditationText: string, audioBase64?: string) => void;
  onBack: () => void;
}

// Helper pour récupérer l'icône de la catégorie
const getCategoryIcon = (categoryId: string): string => {
  const categoryIcons: Record<string, string> = {
    'sante-corps': 'Santé & Corps icon.jpeg',
    'changement-habitudes': 'Changement & Habitudes icon.jpeg',
    'eveil-preparation': 'Éveil & Préparation icon.jpeg',
    'attention-cognition': 'Attention & Cognition icon.jpeg',
    'performance-action': 'Performance & Action icon.jpeg',
    'regulation-resilience': 'Régulation & Résilience icon.jpeg',
    'flexibilite-psychologique': 'Flexibilité Psychologique icon.jpeg',
    'relations-sociales': 'Relations & Sociales icon.jpeg',
    'sens-valeurs': 'Sens & Valeurs icon.jpeg',
    'sommeil-repos': 'Sommeil & Repos icon.jpeg'
  };
  return categoryIcons[categoryId] || 'Éveil & Préparation icon.jpeg';
};

export default function Meditation({
  mood,
  userName,
  category,
  intention,
  guideType,
  duration,
  generateAudio,
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
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [loadingQuote, setLoadingQuote] = useState<{ quote: string; author: string } | null>(null);
  const [dailyInspiration, setDailyInspiration] = useState<string>();
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

      const { displayText, audioText, dailyInspiration: inspiration } = await generateMeditation(anthropicApiKey, userName, mood, category, intention, guideType, duration);
      setMeditationText(displayText);
      setDailyInspiration(inspiration);

      // Skip audio generation if user chose text-only
      if (!generateAudio) {
        setStatus('ready');
        return;
      }

      setStatus('generating-audio');

      try {
        const audioDataUrl = await generateAudioAPI('', audioText, '', guideType);
        setAudioBase64(audioDataUrl);
        setAudioUrl(audioDataUrl);
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

  const categoryIcon = getCategoryIcon(category);

  if (status === 'generating-text') {
    const guideName = guideType === 'meditation' ? 'Iza' : 'Dann';

    return (
      <div className="meditation">
        <div className="meditation-loading-premium fade-in">
          {/* Icône de catégorie au centre */}
          <div className="category-icon-container">
            <div className="category-icon-glow" style={{ backgroundColor: `${mood.color}15` }}></div>
            <div className="category-icon-ring" style={{ borderColor: mood.color }}></div>
            <img
              src={`/${categoryIcon}`}
              alt={category}
              className="category-icon-image"
            />
          </div>

          {/* Progress indicators */}
          <div className="loading-phases-modern">
            <div className="phase-step active">
              <div className="phase-dot" style={{ backgroundColor: mood.color }}></div>
              <span className="phase-label">Préparation</span>
            </div>
            <div className="phase-connector"></div>
            <div className="phase-step current">
              <div className="phase-dot pulsing" style={{ backgroundColor: mood.color }}></div>
              <span className="phase-label">Création</span>
            </div>
            <div className="phase-connector"></div>
            <div className="phase-step">
              <div className="phase-dot"></div>
              <span className="phase-label">Narration</span>
            </div>
          </div>

          <h2 className="loading-title-modern">{guideName} compose votre moment</h2>
          <p className="loading-subtitle-modern">
            {guideType === 'meditation' ? 'Une méditation' : 'Une réflexion'} personnalisée pour{' '}
            <span style={{ color: mood.color }}>{intention.toLowerCase()}</span>
          </p>

          {loadingQuote && (
            <div className="loading-quote-modern fade-in">
              <div className="quote-icon">✦</div>
              <p className="quote-text-modern">"{loadingQuote.quote}"</p>
              <p className="quote-author-modern">— {loadingQuote.author}</p>
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
          {/* Audio wave visualization */}
          <div className="audio-wave-container">
            <div className="audio-wave-bars">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="wave-bar-modern"
                  style={{
                    backgroundColor: mood.color,
                    animationDelay: `${i * 0.1}s`
                  }}
                ></div>
              ))}
            </div>
            <div className="audio-icon-modern">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
            </div>
          </div>

          {/* Progress indicators */}
          <div className="loading-phases-modern">
            <div className="phase-step completed">
              <div className="phase-dot" style={{ backgroundColor: mood.color }}></div>
              <span className="phase-label">Préparation</span>
            </div>
            <div className="phase-connector completed" style={{ backgroundColor: mood.color }}></div>
            <div className="phase-step completed">
              <div className="phase-dot" style={{ backgroundColor: mood.color }}></div>
              <span className="phase-label">Création</span>
            </div>
            <div className="phase-connector"></div>
            <div className="phase-step current">
              <div className="phase-dot pulsing" style={{ backgroundColor: mood.color }}></div>
              <span className="phase-label">Narration</span>
            </div>
          </div>

          <h2 className="loading-title-modern">La voix de {guideName} prend vie</h2>
          <p className="loading-subtitle-modern">
            Narration de votre {guideType === 'meditation' ? 'méditation' : 'réflexion'} en haute qualité
          </p>

          {loadingQuote && (
            <div className="loading-quote-modern fade-in">
              <div className="quote-icon">✦</div>
              <p className="quote-text-modern">"{loadingQuote.quote}"</p>
              <p className="quote-author-modern">— {loadingQuote.author}</p>
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
            {meditationText.split('\\n\\n').map((paragraph, index) => (
              <p key={index} className="meditation-paragraph">
                {paragraph}
              </p>
            ))}
          </div>

          {dailyInspiration && (
            <div className="daily-inspiration-container">
              <div className="inspiration-icon">✦</div>
              <div className="inspiration-content">
                <div className="inspiration-label">Inspiration du jour</div>
                <div className="inspiration-text">{dailyInspiration}</div>
              </div>
            </div>
          )}
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
