import { useState } from 'react';
import { Mood } from '../types';
import { moods } from '../data/moods';
import './MoodSelector.css';

interface MoodSelectorProps {
  userName: string;
  onMoodSelect: (mood: Mood) => void;
}

export default function MoodSelector({ userName, onMoodSelect }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleMoodClick = (mood: Mood) => {
    setSelectedMood(mood.id);
    setIsTransitioning(true);
    setTimeout(() => {
      onMoodSelect(mood);
    }, 600);
  };

  return (
    <div className={`mood-selector ${isTransitioning ? 'fade-out' : ''}`}>
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
                {mood.icon}
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
