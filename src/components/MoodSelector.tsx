import { useState } from 'react';
import type { Mood } from '../types';
import { moods } from '../data/moods';
import MoodIcon from './MoodIcon';
import FixedBackground from './FixedBackground';
import StickyHeader from './StickyHeader';
import './MoodSelector.css';

interface MoodSelectorProps {
  userName: string;
  onMoodSelect: (mood: Mood) => void;
  onBack: () => void;
  onHistory: () => void;
}

export default function MoodSelector({ userName, onMoodSelect, onBack, onHistory }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const backgroundImage = `${import.meta.env.BASE_URL}ultra_detailed_cinematic_mobile_app_background_minimalistic_and.jpeg`;

  const handleMoodClick = (mood: Mood) => {
    setSelectedMood(mood.id);
    setIsTransitioning(true);
    setTimeout(() => {
      onMoodSelect(mood);
    }, 600);
  };

  return (
    <div className={`mood-selector ${isTransitioning ? 'fade-out' : ''}`}>
      <FixedBackground src={backgroundImage} alt="Mood selector background" overlayOpacity={0.2} />
      <StickyHeader onBack={onBack} onHistory={onHistory} showHistory={true} />

      <div className="mood-content fade-in">
        <h2 className="mood-title">{userName}, comment vous sentez-vous ce matin ?</h2>

        <p className="mood-subtitle">
          Choisissez l'état d'esprit qui résonne le plus avec vous en ce moment.
        </p>

        <div className="moods-grid">
          {moods.map((mood, index) => (
            <button
              key={mood.id}
              className={`mood-card ${selectedMood === mood.id ? 'selected' : ''}`}
              onClick={() => handleMoodClick(mood)}
              style={{
                animationDelay: `${index * 0.1}s`,
                borderColor: selectedMood === mood.id ? mood.color : 'transparent'
              }}
            >
              <div className="mood-icon" style={{ color: mood.color }}>
                <MoodIcon moodId={mood.id} size={64} />
              </div>
              <h3 className="mood-name">{mood.name}</h3>
              <p className="mood-description">{mood.description}</p>

              <div
                className="mood-glow"
                style={{ background: `radial-gradient(circle, ${mood.color}33 0%, transparent 70%)` }}
              ></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
