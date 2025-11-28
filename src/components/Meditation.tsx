import { useState, useEffect, useRef } from 'react';
import type { Mood, AstrologicalProfile } from '../types';
import { generateMeditation, generateMeditationStreaming, generateAudio as generateAudioAPI, fetchLoadingQuote as fetchQuoteAPI } from '../services/api';
import { storage } from '../utils/storage';
import { FALLBACK_LOADING_QUOTE } from '../constants/fallbackQuotes';
import MoodIcon from './MoodIcon';
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
  astrologicalProfile?: AstrologicalProfile;
  onComplete: (meditationText: string, audioBase64?: string) => Promise<void>;
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
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [useStreaming] = useState(true); // Feature flag: set to false to disable streaming
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioTextRef = useRef<string>(''); // Store audioText for later audio generation

  useEffect(() => {
    generateContent();
    fetchLoadingQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionnellement vide - exécution unique au montage

  const fetchLoadingQuote = async () => {
    try {
      const data = await fetchQuoteAPI();
      setLoadingQuote(data);
    } catch {
      // Erreur ignorée - fallback silencieux
      console.warn('Failed to fetch loading quote');
      setLoadingQuote(FALLBACK_LOADING_QUOTE);
    }
  };

  const generateContent = async () => {
    try {
      // NOUVEAU: Récupérer les 10 dernières sessions pour analyse de patterns
      const recentSessions = await storage.getAllSessions();
      const last10Sessions = recentSessions.slice(0, 10); // Les plus récentes en premier

      // 🌊 STREAMING MODE - Progressive rendering with instant feedback
      if (useStreaming) {
        setStatus('generating-text');

        await generateMeditationStreaming(
          userName,
          mood,
          category,
          intention,
          guideType,
          duration,
          astrologicalProfile,
          last10Sessions,
          // onChunk: Accumulate but don't display (contains JSON)
          () => {
            // Chunks contain raw JSON - we'll parse and display on complete
            // Just show loading for now
          },
          // onComplete: Display text immediately, generate audio in background
          async (result) => {
            // ✅ Display the clean text immediately
            setMeditationText(result.displayText);
            setDailyInspiration(result.dailyInspiration);
            audioTextRef.current = result.audioText;

            console.log('✅ Streaming completed');
            console.log(`📝 Display text: ${result.displayText.length} chars`);
            console.log(`🎙️ Audio text: ${result.audioText.length} chars`);

            // Skip audio generation if user chose text-only
            if (!generateAudio) {
              setStatus('ready');
              return;
            }

            // 🎵 Generate audio IN BACKGROUND without hiding the text
            setStatus('generating-audio');

            try {
              const audioDataUrl = await generateAudioAPI(result.audioText, guideType);
              setAudioBase64(audioDataUrl);
              setAudioUrl(audioDataUrl);
              setStatus('ready');
            } catch (audioError) {
              console.error('Erreur audio:', audioError);
              // Audio error shouldn't block the experience - text is already ready
              console.warn('Audio generation failed, but text is available');
              setStatus('ready');
            }
          }
        );

        return;
      }

      // 📦 FALLBACK MODE - Traditional non-streaming (for compatibility)
      setStatus('generating-text');

      const { displayText, audioText, dailyInspiration: inspiration } = await generateMeditation(
        userName,
        mood,
        category,
        intention,
        guideType,
        duration,
        astrologicalProfile,
        last10Sessions
      );
      setMeditationText(displayText);
      setDailyInspiration(inspiration);
      audioTextRef.current = audioText;

      // Skip audio generation if user chose text-only
      if (!generateAudio) {
        setStatus('ready');
        return;
      }

      setStatus('generating-audio');

      try {
        const audioDataUrl = await generateAudioAPI(audioText, guideType);
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

      // Message d'erreur plus détaillé et doux
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite';

      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Impossible de se connecter au service. Vérifie ta connexion internet et réessaie dans quelques instants. 🌸');
      } else if (errorMessage.includes('Failed to generate')) {
        setError('Nos guides sont momentanément indisponibles. Prends une pause, respire profondément, et réessaie dans un instant. 🍃');
      } else {
        setError('Une petite turbulence s\'est produite. Prends un moment pour toi, puis réessaie avec un cœur serein. 💫');
      }

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

  const handleComplete = async () => {
    console.log('🔍 handleComplete appelé:', {
      hasText: !!meditationText,
      textLength: meditationText.length,
      hasAudio: !!audioBase64,
      audioLength: audioBase64?.length,
      audioBase64Preview: audioBase64?.substring(0, 50)
    });

    setIsSaving(true);

    try {
      await onComplete(meditationText, audioBase64);
      console.log('✅ Méditation sauvegardée avec succès');

      // Afficher la notification de succès
      setShowSuccessNotification(true);

      // Masquer après 3 secondes
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 3000);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
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

  // 🎵 GENERATING AUDIO - Show text with premium progress bar
  if (status === 'generating-audio') {
    return (
      <div
        className={`meditation meditation-fullscreen fade-in`}
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

        {/* 🎙️ AUDIO GENERATION PROGRESS BAR - Premium design */}
        <div className="audio-progress-banner" style={{
          background: `linear-gradient(135deg, ${mood.color}15, ${mood.color}08)`,
          border: `1px solid ${mood.color}30`
        }}>
          <div className="audio-progress-content">
            <div className="audio-progress-icon" style={{ color: mood.color }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
            </div>
            <div className="audio-progress-text">
              <span className="audio-progress-label">La voix de {guideName} se prépare...</span>
              <div className="audio-progress-bar-container">
                <div
                  className="audio-progress-bar-fill"
                  style={{
                    backgroundColor: mood.color,
                    boxShadow: `0 0 10px ${mood.color}60`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium header with category icon and mood */}
        <div className="meditation-header-premium">
          <div className="header-icons-container">
            <div className="header-category-icon">
              <img src={`/${categoryIcon}`} alt={category} />
            </div>
            <div className="header-mood-icon" style={{ color: mood.color }}>
              <MoodIcon moodId={mood.id} />
            </div>
          </div>
          <div className="header-info">
            <h1 className="meditation-title-premium">
              Ta {guideType === 'meditation' ? 'méditation' : 'réflexion'} avec {guideName}
            </h1>
          </div>
        </div>

        <div className="meditation-content-premium">
          {/* Premium text container - text is visible during audio generation */}
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
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="meditation meditation-fullscreen fade-in">
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

        <div className="meditation-error-premium fade-in">
          {/* Icon de catégorie au centre */}
          <div className="error-icon-container">
            <div className="error-icon-glow" style={{ backgroundColor: `${mood.color}15` }}></div>
            <img
              src={`/${categoryIcon}`}
              alt={category}
              className="error-category-icon"
            />
          </div>

          <h2 className="error-title-premium">Un moment de pause</h2>
          <p className="error-text-premium">{error}</p>

          <button
            className="retry-button-premium"
            onClick={generateContent}
            style={{
              backgroundColor: mood.color,
              boxShadow: `0 4px 20px ${mood.color}40`
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            <span>Réessayer avec douceur</span>
          </button>

          {loadingQuote && (
            <div className="error-quote-premium fade-in">
              <div className="quote-icon">✦</div>
              <p className="quote-text-modern">"{loadingQuote.quote}"</p>
              <p className="quote-author-modern">— {loadingQuote.author}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`meditation meditation-fullscreen fade-in ${isPlaying ? 'playing' : ''}`}
    >
      {/* Success Notification Premium */}
      {showSuccessNotification && (
        <div className="success-notification-overlay">
          <div className="success-notification-premium" style={{
            borderColor: mood.color,
            background: `linear-gradient(135deg, ${mood.color}15, ${mood.color}08)`
          }}>
            <div className="success-icon-container" style={{ backgroundColor: mood.color }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="success-content">
              <h3 className="success-title">Sauvegardée</h3>
              <p className="success-message">Ta méditation est enregistrée</p>
            </div>
          </div>
        </div>
      )}

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
        <div className="header-icons-container">
          <div className="header-category-icon">
            <img src={`/${categoryIcon}`} alt={category} />
          </div>
          <div className="header-mood-icon" style={{ color: mood.color }}>
            <MoodIcon moodId={mood.id} />
          </div>
        </div>
        <div className="header-info">
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
        <div
          className="meditation-text-card"
          onClick={audioUrl ? handlePlay : undefined}
          style={{ cursor: audioUrl ? 'pointer' : 'default' }}
        >
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
          disabled={isSaving}
          style={{
            backgroundColor: mood.color,
            boxShadow: `0 4px 20px ${mood.color}40`,
            opacity: isSaving ? 0.6 : 1,
            cursor: isSaving ? 'not-allowed' : 'pointer'
          }}
        >
          {isSaving ? (
            <>
              <svg className="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" opacity="0.25"/>
                <path d="M12 2 a10 10 0 0 1 10 10" opacity="0.75"/>
              </svg>
              <span>Enregistrement...</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              <span>Enregistrer</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
