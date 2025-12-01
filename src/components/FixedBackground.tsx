/**
 * FixedBackground - Image de fond plein écran fixe
 * L'image reste fixe pendant que le contenu défile par-dessus
 *
 * IMPORTANT: Utilise createPortal pour rendre directement dans le body
 * car les éléments avec transform (comme PullToRefresh) cassent position: fixed.
 * Utilise des z-index négatifs pour rester derrière le contenu de l'app.
 */

import { createPortal } from 'react-dom';
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
  // Rendu via Portal directement dans le body pour éviter les problèmes de transform
  const backgroundContent = (
    <>
      {/* Background fixe - z-index négatifs pour rester derrière l'app */}
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
    </>
  );

  // Utiliser createPortal pour rendre directement dans document.body
  return createPortal(backgroundContent, document.body);
}
