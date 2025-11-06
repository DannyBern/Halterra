import { useState, useEffect } from 'react';
import { useFullscreenBackground } from '../hooks/useFullscreenBackground';
import './Landing.css';

interface LandingProps {
  onStart: () => void;
}

export default function Landing({ onStart }: LandingProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const backgroundImage = `${import.meta.env.BASE_URL}ultra_detailed_cinematic_mobile_app_background_minimalistic_and.jpeg`;
  const { FullscreenViewer, handlePressStart, handlePressEnd } = useFullscreenBackground(backgroundImage);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleStart = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onStart();
    }, 600);
  };

  return (
    <div
      className={`landing ${isAnimating ? 'fade-out' : ''}`}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
    >
      {/* Background */}
      <div className="landing-bg"></div>

      <div className={`landing-content ${isLoaded ? 'loaded' : ''}`}>
        {/* Main heading */}
        <h1 className="landing-title">
          Halterra
        </h1>

        {/* Tagline */}
        <div className="landing-tagline">
          <p className="tagline-line">Un moment de pause.</p>
          <p className="tagline-line">Une réflexion guidée.</p>
          <p className="tagline-line">Votre esprit transformé.</p>
        </div>

        {/* Description */}
        <div className="landing-description">
          <p>
            Accordez-vous un moment de méditation personnalisée qui
            honore votre état d'esprit et illumine votre chemin.
          </p>
        </div>

        {/* Premium CTA button */}
        <button className="landing-cta" onClick={handleStart}>
          <span className="cta-text">Commencer</span>
          <svg className="cta-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Feature highlights - icons statiques */}
        <div className="landing-features">
          <div className="feature">
            <span className="feature-icon">✨</span>
            <span>Méditations personnalisées</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🎧</span>
            <span>Audio IA haute qualité</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📱</span>
            <span>Accès partout</span>
          </div>
        </div>
      </div>

      {/* Fullscreen Background Viewer */}
      <FullscreenViewer />
    </div>
  );
}
