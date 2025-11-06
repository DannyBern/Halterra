import { useState } from 'react';
import type { User } from '../types';
import { useFullscreenBackground } from '../hooks/useFullscreenBackground';
import './Onboarding.css';

interface OnboardingProps {
  onComplete: (user: User) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backgroundImage = `${import.meta.env.BASE_URL}ultra_detailed_cinematic_mobile_app_background_minimalistic_and.jpeg`;
  const { FullscreenViewer, handlePressStart, handlePressEnd } = useFullscreenBackground(backgroundImage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsSubmitting(true);
      setTimeout(() => {
        onComplete({
          name: name.trim(),
          createdAt: new Date().toISOString()
        });
      }, 400);
    }
  };

  return (
    <div
      className={`onboarding ${isSubmitting ? 'fade-out' : ''}`}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
    >
      <div className="onboarding-content fade-in">
        <div className="onboarding-icon">🌱</div>

        <h2 className="onboarding-title">Bienvenue</h2>

        <p className="onboarding-text">
          Pour personnaliser votre expérience et créer un espace qui vous est propre,
          comment aimeriez-vous être appelé ?
        </p>

        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="input-wrapper">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre prénom"
              className="onboarding-input"
              autoFocus
              maxLength={30}
            />
            <div className="input-underline"></div>
          </div>

          <button
            type="submit"
            className="onboarding-button"
            disabled={!name.trim()}
          >
            Continuer
          </button>
        </form>

        <p className="onboarding-note">
          Vos données restent privées et sont stockées localement sur votre appareil.
        </p>
      </div>

      {/* Fullscreen Background Viewer */}
      <FullscreenViewer />
    </div>
  );
}
