import './GuideSelector.css';

interface GuideSelectorProps {
  userName: string;
  onSelectGuide: (guideType: 'meditation' | 'reflection') => void;
  onBack: () => void;
}

export default function GuideSelector({ userName, onSelectGuide, onBack }: GuideSelectorProps) {
  return (
    <div className="guide-selector fade-in">
      <div className="guide-bg"></div>

      <button className="back-button" onClick={onBack} aria-label="Retour">
        ← Retour
      </button>

      <div className="guide-content">
        <div className="guide-header">
          <div className="guide-ornament">✦</div>
          <h1 className="guide-title">Choisissez votre guide</h1>
          <p className="guide-subtitle">
            {userName}, quel accompagnement choisissez-vous aujourd'hui ?
          </p>
        </div>

        <div className="guide-cards">
          {/* Meditation Guide Card */}
          <button
            className="guide-card meditation-card"
            onClick={() => onSelectGuide('meditation')}
            aria-label="Guide de méditation avec Iza"
          >
            <div className="guide-card-image-container">
              <img
                src="/Halterra/guide-meditation.webp.jpeg"
                alt="Iza - Guide de méditation"
                loading="lazy"
                className="guide-card-image"
              />
              <div className="guide-card-gradient"></div>
              <div className="guide-card-overlay-content">
                <div className="guide-type-label">Méditation</div>
                <h2 className="guide-name">Iza</h2>
                <p className="guide-tagline">Calme & Présence</p>
              </div>
            </div>
            <div className="guide-card-details">
              <p className="guide-description">
                Une voix douce vous accompagne vers un état de paix profonde.
                Reconnectez-vous à l'instant présent à travers la respiration et la conscience du corps.
              </p>
              <div className="guide-arrow">→</div>
            </div>
          </button>

          {/* Reflection Guide Card */}
          <button
            className="guide-card reflection-card"
            onClick={() => onSelectGuide('reflection')}
            aria-label="Guide de réflexion avec Dann"
          >
            <div className="guide-card-image-container">
              <img
                src="/Halterra/guide-reflection.webp.jpeg"
                alt="Dann - Guide de réflexion"
                loading="lazy"
                className="guide-card-image"
              />
              <div className="guide-card-gradient"></div>
              <div className="guide-card-overlay-content">
                <div className="guide-type-label">Réflexion</div>
                <h2 className="guide-name">Dann</h2>
                <p className="guide-tagline">Clarté & Introspection</p>
              </div>
            </div>
            <div className="guide-card-details">
              <p className="guide-description">
                Une présence bienveillante vous invite à explorer vos pensées et émotions.
                Gagnez en perspective et découvrez de nouvelles façons de voir les choses.
              </p>
              <div className="guide-arrow">→</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
