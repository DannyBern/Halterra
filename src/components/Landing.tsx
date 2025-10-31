import { useState, useEffect } from 'react';
import './Landing.css';

interface LandingProps {
  onStart: () => void;
}

export default function Landing({ onStart }: LandingProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

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
    <div className={`landing ${isAnimating ? 'fade-out' : ''}`}>
      {/* Animated gradient orbs background */}
      <div className="landing-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className={`landing-content ${isLoaded ? 'loaded' : ''}`}>
        {/* Hero logo with floating animation */}
        <div className="landing-logo-container">
          <div className="logo-glow"></div>
          <div className="landing-logo">
            <img src="/Halterra/logo.svg" alt="Halterra" className="meditation-logo" />
          </div>
        </div>

        {/* Main heading with gradient */}
        <h1 className="landing-title">
          Halterra
        </h1>

        {/* Tagline with staggered animation */}
        <div className="landing-tagline">
          <p className="tagline-line">Un moment de pause.</p>
          <p className="tagline-line">Une réflexion guidée.</p>
          <p className="tagline-line">Votre journée transformée.</p>
        </div>

        {/* Description in glass card */}
        <div className="landing-description">
          <p>
            Commencez chaque journée par une méditation personnalisée qui
            honore votre état d'esprit et illumine votre chemin.
          </p>
        </div>

        {/* Premium CTA button */}
        <button className="landing-cta" onClick={handleStart}>
          <span className="cta-text">Commencer votre voyage</span>
          <div className="cta-shimmer"></div>
          <svg className="cta-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Feature highlights */}
        <div className="landing-features">
          <div className="feature">
            <div className="feature-icon">✨</div>
            <span>Méditations personnalisées</span>
          </div>
          <div className="feature">
            <div className="feature-icon">🎧</div>
            <span>Audio IA haute qualité</span>
          </div>
          <div className="feature">
            <div className="feature-icon">📱</div>
            <span>Accès partout</span>
          </div>
        </div>
      </div>

      {/* Ambient particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}></div>
        ))}
      </div>
    </div>
  );
}
