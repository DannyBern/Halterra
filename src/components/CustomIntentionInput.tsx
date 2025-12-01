import { useState, useEffect, useRef } from 'react';
import type { Mood } from '../types';
import FixedBackground from './FixedBackground';
import StickyHeader from './StickyHeader';
import './CustomIntentionInput.css';

interface CustomIntentionInputProps {
  mood: Mood;
  onSubmit: (intention: string) => void;
  onBack: () => void;
  onHistory: () => void;
}

export const CustomIntentionInput: React.FC<CustomIntentionInputProps> = ({
  mood,
  onSubmit,
  onBack,
  onHistory
}) => {
  const [intention, setIntention] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const isListeningRef = useRef<boolean>(false);
  const longPressTimerRef = useRef<number | null>(null);
  const justClosedFullscreenRef = useRef<boolean>(false);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'fr-FR';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        console.log('📝 Received transcript:', transcript);

        setIntention(prev => {
          const newValue = prev + (prev ? ' ' : '') + transcript;
          console.log('✍️ New intention:', newValue);
          return newValue;
        });

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        silenceTimerRef.current = setTimeout(() => {
          if (recognitionRef.current && isListeningRef.current) {
            console.log('⏱️ Silence timer - stopping recognition');
            recognitionRef.current.stop();
            setIsListening(false);
          }
        }, 5000);
      };

      recognitionRef.current.onend = () => {
        console.log('🛑 Recognition ended, isListening:', isListeningRef.current);

        if (isListeningRef.current) {
          setTimeout(() => {
            if (isListeningRef.current) {
              try {
                console.log('🔄 Restarting recognition...');
                recognitionRef.current.start();
              } catch (err) {
                console.log('Failed to restart recognition:', err);
              }
            }
          }, 300);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          if (isListeningRef.current) {
            try {
              recognitionRef.current.start();
            } catch (err) {
              console.log('Failed to restart after no-speech:', err);
            }
          }
        } else if (event.error !== 'aborted') {
          setError('Erreur de reconnaissance vocale. Veuillez réessayer.');
          setIsListening(false);
        }
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore errors on cleanup
        }
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      setError('Reconnaissance vocale non supportée par ce navigateur.');
      return;
    }

    setError(null);
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.log('Failed to start recognition:', err);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    setIsListening(false);
  };

  const handleSubmit = () => {
    const trimmedIntention = intention.trim();
    if (trimmedIntention.length < 5) {
      setError('Ton intention doit contenir au moins 5 caractères.');
      return;
    }
    if (trimmedIntention.length > 300) {
      setError('Ton intention ne peut pas dépasser 300 caractères.');
      return;
    }
    onSubmit(trimmedIntention);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIntention(e.target.value);
    setError(null);
  };

  // Long press handlers for fullscreen background
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    // Don't trigger long press if already in fullscreen or just closed it
    if (isFullscreen || justClosedFullscreenRef.current) return;

    // Prevent text selection on long press
    e.preventDefault();
    longPressTimerRef.current = setTimeout(() => {
      setIsFullscreen(true);
    }, 500); // 500ms long press
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  // Prevent context menu on long press
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleFullscreenClose = () => {
    setIsFullscreen(false);
    // Prevent immediately reopening fullscreen from lingering touch events
    justClosedFullscreenRef.current = true;
    setTimeout(() => {
      justClosedFullscreenRef.current = false;
    }, 600);
  };

  const isValid = intention.trim().length >= 5 && intention.trim().length <= 300;

  const categoryIcon = `${import.meta.env.BASE_URL}Intention Libre icon.jpeg`;
  const backgroundImage = `${import.meta.env.BASE_URL}cinematic_night_landscape_showing_the_milky_way.jpeg`;

  return (
    <div
      className="custom-intention-page"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onContextMenu={handleContextMenu}
    >
      <FixedBackground src={backgroundImage} alt="Intention libre background" overlayOpacity={0.3} />
      <StickyHeader onBack={onBack} onHistory={onHistory} showHistory={true} />

      <div className="custom-intention-content">
        {/* Header */}
        <div className="custom-intention-header">
          <div className="custom-intention-icon">
            <img
              src={categoryIcon}
              alt="Intention Libre"
            />
          </div>
          <h1 className="custom-intention-title">
            Exprime ton intention
          </h1>
          <p className="custom-intention-subtitle">
            Écris ou dicte librement ce que tu souhaites explorer
          </p>
        </div>

        {/* Form Card */}
        <div
          className="custom-intention-card"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            borderColor: `${mood.color}30`,
            background: `linear-gradient(135deg, ${mood.color}08, ${mood.color}03)`
          }}
        >
          {/* Textarea */}
          <div className="custom-intention-textarea-container">
            <textarea
              ref={textareaRef}
              className="custom-intention-textarea"
              placeholder="Ex: Je veux développer ma confiance en moi dans mes relations professionnelles..."
              value={intention}
              onChange={handleTextareaChange}
              maxLength={300}
              rows={5}
              style={{
                borderColor: isValid ? `${mood.color}30` : 'rgba(255, 255, 255, 0.1)',
                background: 'rgba(0, 0, 0, 0.3)'
              }}
            />
            <div className="character-count">
              <span style={{ color: intention.length > 280 ? '#ff6b6b' : 'rgba(255, 255, 255, 0.5)' }}>
                {intention.length}/300
              </span>
            </div>
          </div>

          {/* Voice Input Button */}
          <div className="voice-input-container">
            <button
              className={`voice-input-button ${isListening ? 'listening' : ''}`}
              onClick={isListening ? stopListening : startListening}
              style={{
                backgroundColor: isListening ? mood.color : `${mood.color}15`,
                borderColor: mood.color,
                color: isListening ? 'white' : mood.color
              }}
            >
            {isListening ? (
              <>
                <div className="voice-pulse"></div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="2"/>
                  <rect x="14" y="4" width="4" height="16" rx="2"/>
                </svg>
                <span>Arrêter l'enregistrement</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" x2="12" y1="19" y2="22"/>
                </svg>
                <span>Dicter ton intention</span>
              </>
            )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="custom-intention-error fade-in">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="custom-intention-actions">
            <button
              className="custom-intention-cancel"
              onClick={onBack}
            >
              Annuler
            </button>
            <button
              className="custom-intention-submit"
              onClick={handleSubmit}
              disabled={!isValid}
              style={{
                backgroundColor: isValid ? mood.color : 'rgba(255, 255, 255, 0.1)',
                borderColor: isValid ? mood.color : 'rgba(255, 255, 255, 0.2)',
                opacity: isValid ? 1 : 0.5,
                cursor: isValid ? 'pointer' : 'not-allowed'
              }}
            >
              Continuer
            </button>
          </div>
        </div>

        {/* Long press hint */}
        <p className="fullscreen-hint">
          Maintiens appuyé pour voir l'image en plein écran
        </p>
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div
          className="fullscreen-overlay"
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFullscreenClose();
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleFullscreenClose();
          }}
        >
          <img
            src={backgroundImage}
            alt="Fond d'écran en plein écran"
            className="fullscreen-image"
          />
          <button
            className="fullscreen-close"
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFullscreenClose();
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleFullscreenClose();
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
