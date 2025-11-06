import React from 'react';
import type { Mood } from '../types';
import { useFullscreenBackground } from '../hooks/useFullscreenBackground';
import './DurationSelection.css';

interface DurationSelectionProps {
  guideType: 'meditation' | 'reflection';
  mood: Mood;
  onSelect: (duration: 2 | 5 | 10, generateAudio: boolean) => void;
  onBack: () => void;
}

export const DurationSelection: React.FC<DurationSelectionProps> = ({
  guideType,
  mood,
  onSelect,
  onBack
}) => {
  const [generateAudio, setGenerateAudio] = React.useState(true);
  const guideName = guideType === 'meditation' ? 'Iza' : 'Dann';
  const guideTitle = guideType === 'meditation' ? 'Méditation' : 'Réflexion';

  // Get mood background image
  const moodImageMap: Record<string, string> = {
    'aligned': 'Aligné  En flow.jpeg',
    'motivated': 'Motivé  Inspiré.jpeg',
    'anxious': 'Anxieux  Inquiet.jpeg',
    'exhausted': 'Épuisé  Vidé.jpeg',
    'sad': 'Triste  Découragé.jpeg',
    'frustrated': 'Frustré  En colère.jpeg',
    'lost': 'Perdu  Confus.jpeg',
    'alone': 'Seul  Isolé.jpeg',
    'overwhelmed': 'Submergé  Sous pression.jpeg',
    'calm': 'Calme  Serein.jpeg'
  };

  const moodImage = moodImageMap[mood.id] || '';
  const backgroundImageUrl = moodImage ? `${import.meta.env.BASE_URL}${encodeURIComponent(moodImage)}` : '';

  const { FullscreenViewer, handlePressStart, handlePressEnd } = useFullscreenBackground(backgroundImageUrl);

  return (
    <div
      className={`duration-selection ${guideType}`}
      style={{
        backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
    >
      <button className="back-button" onClick={onBack}>
        ← Retour
      </button>

      <div className="duration-content">
        <h1 className="duration-title">
          {guideTitle} avec {guideName}
        </h1>
        <p className="duration-subtitle">
          Choisis la durée de ta session
        </p>

        <div className="duration-options">
          <button
            className="duration-button"
            onClick={() => onSelect(2, generateAudio)}
            style={{
              borderColor: `${mood.color}20`,
              background: `linear-gradient(135deg, ${mood.color}0B, ${mood.color}03)`
            }}
          >
            <span className="duration-time" style={{ color: mood.color }}>2</span>
            <span className="duration-label">minutes</span>
          </button>

          <button
            className="duration-button featured"
            onClick={() => onSelect(5, generateAudio)}
            style={{
              borderColor: `${mood.color}30`,
              background: `linear-gradient(135deg, ${mood.color}13, ${mood.color}08)`,
              boxShadow: `0 8px 32px ${mood.color}18`
            }}
          >
            <span className="duration-time" style={{ color: mood.color }}>5</span>
            <span className="duration-label">minutes</span>
            <span className="duration-badge" style={{ background: mood.color }}>Recommandé</span>
          </button>

          <button
            className="duration-button"
            onClick={() => onSelect(10, generateAudio)}
            style={{
              borderColor: `${mood.color}20`,
              background: `linear-gradient(135deg, ${mood.color}0B, ${mood.color}03)`
            }}
          >
            <span className="duration-time" style={{ color: mood.color }}>10</span>
            <span className="duration-label">minutes</span>
          </button>
        </div>

        {/* Audio generation toggle */}
        <div className="audio-option-container">
          <button
            className={`audio-toggle ${generateAudio ? 'enabled' : 'disabled'}`}
            onClick={() => setGenerateAudio(!generateAudio)}
            style={{
              borderColor: generateAudio ? mood.color : 'rgba(255, 255, 255, 0.2)',
              background: generateAudio
                ? `linear-gradient(135deg, ${mood.color}15, ${mood.color}08)`
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))'
            }}
          >
            <div className="audio-toggle-icon">
              {generateAudio ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" x2="12" y1="19" y2="22"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              )}
            </div>
            <div className="audio-toggle-text">
              <div className="audio-toggle-title" style={{ color: generateAudio ? mood.color : 'rgba(255, 255, 255, 0.6)' }}>
                {generateAudio ? 'Narration audio activée' : 'Lecture seule'}
              </div>
              <div className="audio-toggle-subtitle">
                {generateAudio ? `Voix de ${guideName} incluse` : 'Texte seulement'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Fullscreen Background Viewer */}
      <FullscreenViewer />
    </div>
  );
};
