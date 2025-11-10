import { useState, useEffect, useRef } from 'react';
import type { Mood, AstrologicalProfile } from '../types';
import { generateMeditation, generateAudio as generateAudioAPI, fetchLoadingQuote as fetchQuoteAPI } from '../services/api';
import './Meditation.css';
import './Meditation_Premium.css';

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
  astrologicalProfile?: AstrologicalProfile;
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
  astrologicalProfile,
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
      const data = await fetchQuoteAPI();
      setLoadingQuote(data);
    } catch (error) {
      console.warn('Failed to fetch loading quote');
      setLoadingQuote({ quote: "Respire profondément et laisse le moment se déployer", author: "Halterra" });
    }
  };

  const generateContent = async () => {
    try {
      setStatus('generating-text');

      const { displayText, audioText, dailyInspiration: inspiration } = await generateMeditation(anthropicApiKey, userName, mood, category, intention, guideType, duration, astrologicalProfile);
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
  const guideName = guideType === 'meditation' ? 'Iza' : 'Dann';

  if (status === 'generating-text') {

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
      {/* Ambient background gradient */}
      <div className="meditation-ambient-bg" style={{
        background: `radial-gradient(circle at 30% 20%, ${mood.color}15 0%, transparent 50%),
                     radial-gradient(circle at 70% 80%, ${mood.color}10 0%, transparent 50%)`
      }}></div>

      <button
        className="back-button-premium"
        onClick={(e) => {
          e.stopPropagation();
          onBack();
        }}
        aria-label="Retour"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>Retour</span>
      </button>

      {/* Premium header with category icon and mood */}
      <div className="meditation-header-premium">
        <div className="header-category-icon">
          <img src={`/${categoryIcon}`} alt={category} />
        </div>
        <div className="header-info">
          <div className="header-mood-badge" style={{
            backgroundColor: `${mood.color}20`,
            borderColor: `${mood.color}40`
          }}>
            <span className="mood-icon">{mood.icon}</span>
            <span className="mood-name" style={{ color: mood.color }}>{mood.name}</span>
          </div>
          <h1 className="meditation-title-premium">
            Ta {guideType === 'meditation' ? 'méditation' : 'réflexion'} avec {guideName}
          </h1>
        </div>
      </div>

      <div className="meditation-content-premium">

        {audioUrl && (
          <>
            {/* Central play button with ambient design */}
            <div className="audio-player-central" onClick={(e) => e.stopPropagation()}>
              <div className="player-ambient-circle" style={{
                backgroundColor: `${mood.color}08`,
                boxShadow: `0 0 80px ${mood.color}30, inset 0 0 40px ${mood.color}10`
              }}></div>

              <button
                className={`play-button-central ${isPlaying ? 'playing' : ''}`}
                onClick={handlePlay}
                style={{
                  backgroundColor: mood.color,
                  boxShadow: `0 8px 32px ${mood.color}60, 0 0 0 0 ${mood.color}40`
                }}
              >
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" fill="white" className="pause-icon">
                    <rect x="6" y="4" width="4" height="16" rx="2"/>
                    <rect x="14" y="4" width="4" height="16" rx="2"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="white" className="play-icon-svg">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              {isPlaying && (
                <div className="audio-visualizer">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="visualizer-bar"
                      style={{
                        backgroundColor: mood.color,
                        animationDelay: `${i * 0.15}s`
                      }}
                    ></div>
                  ))}
                </div>
              )}

              <p className="audio-instruction">
                {isPlaying ? 'En lecture...' : 'Appuie pour commencer'}
              </p>
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
          <div className="speed-control-premium" onClick={(e) => e.stopPropagation()}>
            <div className="speed-header">
              <span className="speed-icon">⚡</span>
              <span className="speed-label-current">{playbackSpeed.toFixed(2)}x</span>
            </div>
            <div className="speed-options">
              {[
                { value: 0.75, label: 'Lent' },
                { value: 1.0, label: 'Normal' },
                { value: 1.25, label: 'Rapide' }
              ].map(option => (
                <button
                  key={option.value}
                  className={`speed-option ${playbackSpeed === option.value ? 'active' : ''}`}
                  onClick={() => handleSpeedChange(option.value)}
                  style={{
                    borderColor: playbackSpeed === option.value ? mood.color : 'rgba(255, 255, 255, 0.1)',
                    backgroundColor: playbackSpeed === option.value ? `${mood.color}15` : 'transparent',
                    color: playbackSpeed === option.value ? mood.color : 'rgba(255, 255, 255, 0.6)'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Premium text container with card design */}
        <div className="meditation-text-card">
          <div className="card-glow" style={{
            background: `linear-gradient(135deg, ${mood.color}08, transparent)`
          }}></div>

          <div className="meditation-text-premium">
            {meditationText.split('\n\n').map((paragraph, index) => (
              <p key={index} className="meditation-paragraph-premium">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {dailyInspiration && (
          <div className="daily-inspiration-premium">
            <div className="inspiration-header">
              <div className="inspiration-icon-premium">✦</div>
              <span className="inspiration-label-premium">Inspiration du jour</span>
            </div>
            <p className="inspiration-text-premium">{dailyInspiration}</p>
          </div>
        )}

        <button
          className="save-button-premium"
          onClick={(e) => {
            e.stopPropagation();
            handleComplete();
          }}
          style={{
            backgroundColor: mood.color,
            boxShadow: `0 4px 20px ${mood.color}40`
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          <span>Enregistrer</span>
        </button>
      </div>
    </div>
  );
}
