import { useState } from 'react';
import type { User } from '../types';
import { useFullscreenBackground } from '../hooks/useFullscreenBackground';
import { calculateHumanDesign } from '../utils/humanDesign';
import './Onboarding.css';

interface OnboardingProps {
  onComplete: (user: User) => void;
}

type OnboardingStep = 'name' | 'birth-info';

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>('name');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skipAstrologicalProfile, setSkipAstrologicalProfile] = useState(false);

  const backgroundImage = `${import.meta.env.BASE_URL}macro_close_up_of_a_fern_leaf_unfolding.jpeg`;
  const { FullscreenViewer, handlePressStart, handlePressEnd } = useFullscreenBackground(backgroundImage);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setStep('birth-info');
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const user: User = {
        name: name.trim(),
        createdAt: new Date().toISOString()
      };

      // Calculate Astrological Profile if data provided
      if (!skipAstrologicalProfile && birthDate && birthTime && birthLocation) {
        const astrologicalProfile = await calculateHumanDesign({
          date: birthDate,
          time: birthTime,
          location: birthLocation
        });
        user.astrologicalProfile = astrologicalProfile;
      }

      setTimeout(() => {
        onComplete(user);
      }, 400);
    } catch (error) {
      console.error('Error calculating Human Design:', error);
      // Continue without Human Design data
      setTimeout(() => {
        onComplete({
          name: name.trim(),
          createdAt: new Date().toISOString()
        });
      }, 400);
    }
  };

  const handleSkip = () => {
    setSkipAstrologicalProfile(true);
    setIsSubmitting(true);
    setTimeout(() => {
      onComplete({
        name: name.trim(),
        createdAt: new Date().toISOString()
      });
    }, 400);
  };

  const isNameValid = name.trim().length > 0;
  const isBirthInfoValid = birthDate && birthTime && birthLocation.trim();

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
        {step === 'name' && (
          <>
            <div className="onboarding-icon">🌱</div>

            <h2 className="onboarding-title">Bienvenue</h2>

            <p className="onboarding-text">
              Pour personnaliser votre expérience et créer un espace qui vous est propre,
              comment aimeriez-vous être appelé ?
            </p>

            <form onSubmit={handleNameSubmit} className="onboarding-form">
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
                disabled={!isNameValid}
              >
                Continuer
              </button>
            </form>
          </>
        )}

        {step === 'birth-info' && (
          <>
            <div className="onboarding-icon">✨</div>

            <h2 className="onboarding-title">Votre Profil Personnel</h2>

            <p className="onboarding-text">
              Ces informations nous permettent de mieux comprendre votre personnalité et d'adapter les méditations à votre manière d'être.
              Basé sur votre astrologie et numérologie personnelles.
            </p>

            <form onSubmit={handleFinalSubmit} className="onboarding-form">
              <div className="input-group">
                <label className="input-label">📅 Date de naissance</label>
                <div className="input-wrapper">
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="onboarding-input"
                    autoFocus
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">🕐 Heure de naissance</label>
                <div className="input-wrapper">
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="onboarding-input"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">📍 Lieu de naissance</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={birthLocation}
                    onChange={(e) => setBirthLocation(e.target.value)}
                    placeholder="Ex: Montréal, Canada"
                    className="onboarding-input"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="button-group">
                <button
                  type="submit"
                  className="onboarding-button"
                  disabled={!isBirthInfoValid}
                >
                  Créer mon profil
                </button>

                <button
                  type="button"
                  className="onboarding-button-secondary"
                  onClick={handleSkip}
                >
                  Passer cette étape
                </button>
              </div>
            </form>
          </>
        )}

        <p className="onboarding-note">
          Vos données restent privées et sont stockées localement sur votre appareil.
        </p>
      </div>

      {/* Fullscreen Background Viewer */}
      <FullscreenViewer />
    </div>
  );
}
