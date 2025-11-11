import { useState, useEffect, useRef } from 'react';
import type { Mood } from '../types';
import './CustomIntentionInput.css';

interface CustomIntentionInputProps {
  mood: Mood;
  onSubmit: (intention: string) => void;
  onCancel: () => void;
}

export const CustomIntentionInput: React.FC<CustomIntentionInputProps> = ({
  mood,
  onSubmit,
  onCancel
}) => {
  const [intention, setIntention] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const silenceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'fr-FR'; // French language
      recognitionRef.current.continuous = true; // Keep listening continuously
      recognitionRef.current.interimResults = true; // Get interim results to detect pauses
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        // Clear existing silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // Get the latest transcript
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        // Update intention with final results only
        if (event.results[event.results.length - 1].isFinal) {
          setIntention(prev => prev + (prev ? ' ' : '') + transcript);
        }

        // Set new silence timer (5 seconds)
        silenceTimerRef.current = setTimeout(() => {
          if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
          }
        }, 5000); // 5 seconds of silence before auto-stop
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setError('Erreur de reconnaissance vocale. Veuillez réessayer.');
        }
        setIsListening(false);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [isListening]);

  const startListening = () => {
    if (!recognitionRef.current) {
      setError('Reconnaissance vocale non supportée par ce navigateur.');
      return;
    }

    setError(null);
    setIsListening(true);
    recognitionRef.current.start();
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

  const isValid = intention.trim().length >= 5 && intention.trim().length <= 300;

  return (
    <div className="custom-intention-input-overlay" onClick={onCancel}>
      <div
        className="custom-intention-input-modal fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderColor: `${mood.color}30`,
          background: `linear-gradient(135deg, ${mood.color}08, ${mood.color}03)`
        }}
      >
        {/* Header */}
        <div className="custom-intention-header">
          <h2 className="custom-intention-title">
            Exprime ton intention
          </h2>
          <p className="custom-intention-subtitle">
            Écris ou dicte librement ce que tu souhaites explorer
          </p>
        </div>

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
            onClick={onCancel}
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
    </div>
  );
};
