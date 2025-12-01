/**
 * FixedBackground - Image de fond plein écran fixe avec mode visualisation
 * L'image reste fixe pendant que le contenu défile par-dessus
 *
 * Fonctionnalités:
 * - Long press (500ms) = active le mode visualisation (image pure sans overlay)
 * - Simple tap en mode visualisation = ferme et revient à l'UI
 * - Feedback haptique quand le long press est reconnu
 *
 * IMPORTANT: Utilise createPortal pour rendre directement dans le body
 * car les éléments avec transform (comme PullToRefresh) cassent position: fixed.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './FixedBackground.css';

interface FixedBackgroundProps {
  src: string;
  alt?: string;
  overlayOpacity?: number;
  enableViewer?: boolean;
}

// Fonction pour déclencher le feedback haptique
const triggerHapticFeedback = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(50); // Vibration courte de 50ms
  }
};

export default function FixedBackground({
  src,
  alt = 'Background',
  overlayOpacity = 0.25,
  enableViewer = true
}: FixedBackgroundProps) {
  const [isViewing, setIsViewing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressing = useRef(false);

  const LONG_PRESS_DURATION = 500; // 500ms pour activer

  // Ouvrir le mode visualisation
  const openViewer = useCallback(() => {
    if (!enableViewer) return;
    triggerHapticFeedback();
    setIsViewing(true);
    setIsClosing(false);
  }, [enableViewer]);

  // Fermer le mode visualisation avec animation
  const closeViewer = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsViewing(false);
      setIsClosing(false);
    }, 400); // Durée de l'animation de fermeture
  }, []);

  // Gestion du long press
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enableViewer || isViewing) return;

    isLongPressing.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPressing.current = true;
      openViewer();
    }, LONG_PRESS_DURATION);
  }, [enableViewer, isViewing, openViewer]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    // Annuler le long press si l'utilisateur bouge (scroll)
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Mouse events pour desktop
  const handleMouseDown = useCallback(() => {
    if (!enableViewer || isViewing) return;

    isLongPressing.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPressing.current = true;
      openViewer();
    }, LONG_PRESS_DURATION);
  }, [enableViewer, isViewing, openViewer]);

  const handleMouseUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Attacher les event listeners au document pour capturer les long press partout
  useEffect(() => {
    if (!enableViewer) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);

      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [enableViewer, handleTouchStart, handleTouchEnd, handleTouchMove, handleMouseDown, handleMouseUp, handleMouseLeave]);

  // Rendu via Portal directement dans le body
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

      {/* Mode visualisation - image pure sans overlay */}
      {isViewing && (
        <div
          className={`fullscreen-viewer ${isClosing ? 'closing' : ''}`}
          onClick={closeViewer}
          onTouchEnd={(e) => {
            e.preventDefault();
            closeViewer();
          }}
        >
          <img
            src={src}
            alt={alt}
            className="fullscreen-viewer-image"
          />
          <div className="fullscreen-viewer-hint">
            Touchez pour fermer
          </div>
        </div>
      )}
    </>
  );

  return createPortal(backgroundContent, document.body);
}
