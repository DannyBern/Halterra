import React from 'react';
import type { Mood } from '../types';
import './DurationSelection.css';

interface DurationSelectionProps {
  guideType: 'meditation' | 'reflection';
  mood: Mood;
  onSelect: (duration: 2 | 5 | 10) => void;
  onBack: () => void;
}

export const DurationSelection: React.FC<DurationSelectionProps> = ({
  guideType,
  mood,
  onSelect,
  onBack
}) => {
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

  return (
    <div
      className={`duration-selection ${guideType}`}
      style={{
        backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
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
            onClick={() => onSelect(2)}
            style={{
              borderColor: `${mood.color}40`,
              background: `linear-gradient(135deg, ${mood.color}15, ${mood.color}05)`
            }}
          >
            <span className="duration-time" style={{ color: mood.color }}>2</span>
            <span className="duration-label">minutes</span>
          </button>

          <button
            className="duration-button featured"
            onClick={() => onSelect(5)}
            style={{
              borderColor: `${mood.color}60`,
              background: `linear-gradient(135deg, ${mood.color}25, ${mood.color}10)`,
              boxShadow: `0 8px 32px ${mood.color}30`
            }}
          >
            <span className="duration-time" style={{ color: mood.color }}>5</span>
            <span className="duration-label">minutes</span>
            <span className="duration-badge" style={{ background: mood.color }}>Recommandé</span>
          </button>

          <button
            className="duration-button"
            onClick={() => onSelect(10)}
            style={{
              borderColor: `${mood.color}40`,
              background: `linear-gradient(135deg, ${mood.color}15, ${mood.color}05)`
            }}
          >
            <span className="duration-time" style={{ color: mood.color }}>10</span>
            <span className="duration-label">minutes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
