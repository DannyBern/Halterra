/**
 * FixedBackground - Image de fond plein écran fixe avec mode fullscreen
 * L'image reste fixe pendant que le contenu défile par-dessus
 * Clic en dehors des éléments UI = affichage plein écran sans overlay
 */

import { useState, useCallback } from 'react';
import './FixedBackground.css';

interface FixedBackgroundProps {
  src: string;
  alt?: string;
  overlayOpacity?: number;
  enableFullscreen?: boolean;
}

export default function FixedBackground({
  src,
  alt = 'Background',
  overlayOpacity = 0.25,
  enableFullscreen = true
}: FixedBackgroundProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsFullscreen(false);
        setIsClosing(false);
      }, 400);
    } else {
      setIsFullscreen(true);
      setIsClosing(false);
    }
  }, [isFullscreen]);

  const handleBackgroundClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!enableFullscreen) return;

    const target = e.target as HTMLElement;

    // Ne pas déclencher sur les éléments interactifs
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'A' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('a') ||
      target.closest('select') ||
      target.closest('textarea') ||
      target.closest('.interactive') ||
      target.closest('.mood-card') ||
      target.closest('.category-card') ||
      target.closest('.duration-button') ||
      target.closest('.audio-toggle') ||
      target.closest('.guide-card') ||
      target.closest('.session-card') ||
      target.closest('.session-actions') ||
      target.closest('.delete-modal') ||
      target.closest('.share-modal')
    ) {
      return;
    }

    toggleFullscreen();
  }, [enableFullscreen, toggleFullscreen]);

  return (
    <>
      {/* Background fixe normal */}
      <div
        className="fixed-background"
        onClick={handleBackgroundClick}
      >
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

      {/* Fullscreen viewer (sans overlay, image pure) */}
      {isFullscreen && (
        <div
          className={`fullscreen-background-viewer ${isClosing ? 'closing' : ''}`}
          onClick={toggleFullscreen}
          onTouchStart={toggleFullscreen}
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
}
