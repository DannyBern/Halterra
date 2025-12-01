/**
 * FixedBackground - Image de fond plein écran fixe
 * L'image reste fixe pendant que le contenu défile par-dessus
 * Optimisé pour tous les formats d'écran mobile (Pixel 8 Pro, iPhone, etc.)
 */

import './FixedBackground.css';

interface FixedBackgroundProps {
  src: string;
  alt?: string;
  overlayOpacity?: number;
}

export default function FixedBackground({
  src,
  alt = 'Background',
  overlayOpacity = 0.25
}: FixedBackgroundProps) {
  return (
    <div className="fixed-background">
      <img
        src={src}
        alt={alt}
        className="fixed-background-image"
      />
      <div
        className="fixed-background-overlay"
        style={{
          background: `linear-gradient(
            135deg,
            rgba(0, 0, 0, ${overlayOpacity + 0.05}) 0%,
            rgba(0, 0, 0, ${overlayOpacity}) 50%,
            rgba(0, 0, 0, ${overlayOpacity + 0.05}) 100%
          )`
        }}
      />
    </div>
  );
}
