/**
 * FixedBackground - Image de fond plein écran fixe avec mode fullscreen
 * L'image reste fixe pendant que le contenu défile par-dessus
 * Clic en dehors des éléments UI = affichage plein écran sans overlay
 *
 * IMPORTANT: Utilise createPortal pour rendre directement dans le body
 * car les éléments avec transform (comme PullToRefresh) cassent position: fixed
 */

import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './FixedBackground.css';

interface FixedBackgroundProps {
  src: string;
  alt?: string;
  overlayOpacity?: number;
  enableFullscreen?: boolean;
  onBackgroundClick?: () => void;
}

export default function FixedBackground({
  src,
  alt = 'Background',
  overlayOpacity = 0.25,
  enableFullscreen = true
}: FixedBackgroundProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const closeFullscreen = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsFullscreen(false);
      setIsClosing(false);
    }, 400);
  }, []);

  const openFullscreen = useCallback(() => {
    if (!enableFullscreen) return;
    setIsFullscreen(true);
    setIsClosing(false);
  }, [enableFullscreen]);

  // Rendu via Portal directement dans le body pour éviter les problèmes de transform
  const backgroundContent = (
    <>
      {/* Background fixe normal */}
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

      {/* Zone cliquable invisible pour ouvrir fullscreen */}
      {enableFullscreen && !isFullscreen && (
        <div
          className="fixed-background-click-zone"
          onClick={openFullscreen}
        />
      )}

      {/* Fullscreen viewer (sans overlay, image pure) */}
      {isFullscreen && (
        <div
          className={`fullscreen-background-viewer ${isClosing ? 'closing' : ''}`}
          onClick={closeFullscreen}
        >
          <img
            src={src}
            alt={alt}
            className="fullscreen-background-image"
          />
        </div>
      )}
    </>
  );

  // Utiliser createPortal pour rendre directement dans document.body
  return createPortal(backgroundContent, document.body);
}
