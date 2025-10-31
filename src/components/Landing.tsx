import { useState } from 'react';
import './Landing.css';

interface LandingProps {
  onStart: () => void;
}

export default function Landing({ onStart }: LandingProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleStart = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onStart();
    }, 600);
  };

  return (
    <div className={`landing ${isAnimating ? 'fade-out' : ''}`}>
      <div className="landing-content fade-in">
        <div className="landing-logo">
          <div className="lotus-icon">🪷</div>
        </div>

        <h1 className="landing-title">Halterra</h1>

        <p className="landing-subtitle">
          Un moment de pause.<br />
          Une réflexion guidée.<br />
          Votre journée transformée.
        </p>

        <div className="landing-description">
          <p>
            Commencez chaque matin par une méditation personnalisée qui honore
            votre état d'esprit et illumine votre chemin.
          </p>
        </div>

        <button className="landing-button" onClick={handleStart}>
          <span>Commencer</span>
          <div className="button-glow"></div>
        </button>

        <div className="landing-ornament">
          <div className="breath-circle"></div>
        </div>
      </div>
    </div>
  );
}
