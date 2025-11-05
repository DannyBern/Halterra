import React from 'react';
import './DurationSelection.css';

interface DurationSelectionProps {
  guideType: 'meditation' | 'reflection';
  onSelect: (duration: 2 | 5 | 10) => void;
  onBack: () => void;
}

export const DurationSelection: React.FC<DurationSelectionProps> = ({
  guideType,
  onSelect,
  onBack
}) => {
  const guideName = guideType === 'meditation' ? 'Iza' : 'Dann';
  const guideTitle = guideType === 'meditation' ? 'Méditation' : 'Réflexion';

  return (
    <div className={`duration-selection ${guideType}`}>
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
          >
            <span className="duration-time">2</span>
            <span className="duration-label">minutes</span>
          </button>

          <button
            className="duration-button featured"
            onClick={() => onSelect(5)}
          >
            <span className="duration-time">5</span>
            <span className="duration-label">minutes</span>
            <span className="duration-badge">Recommandé</span>
          </button>

          <button
            className="duration-button"
            onClick={() => onSelect(10)}
          >
            <span className="duration-time">10</span>
            <span className="duration-label">minutes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
