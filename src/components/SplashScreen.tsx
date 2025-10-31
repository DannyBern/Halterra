import { useEffect, useState } from 'react';
import './SplashScreen.css';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Animation complète après 3 secondes
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 600); // Attendre la fin du fade-out
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`splash-screen ${!isVisible ? 'fade-out' : ''}`}>
      {/* Background gradient animé */}
      <div className="splash-bg">
        <div className="splash-gradient-1"></div>
        <div className="splash-gradient-2"></div>
        <div className="splash-gradient-3"></div>
      </div>

      {/* Logo avec animation */}
      <div className="splash-content">
        <div className="splash-logo-container">
          {/* Anneaux pulsants */}
          <div className="splash-ring splash-ring-outer"></div>
          <div className="splash-ring splash-ring-middle"></div>
          <div className="splash-ring splash-ring-inner"></div>

          {/* Logo SVG */}
          <div className="splash-logo">
            <img src="/Halterra/logo.svg" alt="Halterra" />
          </div>
        </div>

        {/* Nom de l'app */}
        <h1 className="splash-title">HALTERRA</h1>
        <p className="splash-tagline">Votre moment de pause quotidien</p>
      </div>

      {/* Particules flottantes */}
      <div className="splash-particles">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="splash-particle"
            style={{
              left: `${15 + Math.random() * 70}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
