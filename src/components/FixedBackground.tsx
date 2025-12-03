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
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const LONG_PRESS_DURATION = 500; // 500ms pour activer
  const MOVE_THRESHOLD = 10; // pixels de mouvement avant d'annuler

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

  // Nettoyer le timer
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    touchStartPos.current = null;
  }, []);

  // Vérifie si l'élément touché est un élément UI interactif
  const isInteractiveElement = useCallback((element: EventTarget | null): boolean => {
    if (!element || !(element instanceof HTMLElement)) return false;

    // Liste des éléments interactifs à ignorer
    const interactiveTags = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT', 'LABEL'];
    const interactiveRoles = ['button', 'link', 'menuitem', 'tab', 'checkbox', 'radio'];

    let current: HTMLElement | null = element;
    while (current) {
      // Vérifier le tag
      if (interactiveTags.includes(current.tagName)) return true;

      // Vérifier le role ARIA
      const role = current.getAttribute('role');
      if (role && interactiveRoles.includes(role)) return true;

      // Vérifier les classes spécifiques de l'app (boutons, cards cliquables, etc.)
      if (current.classList.contains('floating-history-button') ||
          current.classList.contains('music-toggle-button') ||
          current.classList.contains('back-button') ||
          current.classList.contains('mood-card') ||
          current.classList.contains('duration-card') ||
          current.classList.contains('category-button') ||
          current.classList.contains('guide-card') ||
          current.classList.contains('session-card') ||
          current.classList.contains('intro-replay-link') ||
          current.onclick !== null) {
        return true;
      }

      current = current.parentElement;
    }
    return false;
  }, []);

  // Gestion du long press - Touch
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enableViewer || isViewing) return;

    // Ignorer si l'utilisateur touche un élément UI interactif
    if (isInteractiveElement(e.target)) return;

    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };

    longPressTimer.current = setTimeout(() => {
      openViewer();
    }, LONG_PRESS_DURATION);
  }, [enableViewer, isViewing, openViewer, isInteractiveElement]);

  const handleTouchEnd = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Annuler le long press si l'utilisateur bouge trop (scroll)
    if (longPressTimer.current && touchStartPos.current) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);

      if (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD) {
        clearLongPressTimer();
      }
    }
  }, [clearLongPressTimer]);

  // Mouse events pour desktop
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!enableViewer || isViewing) return;

    // Ignorer si l'utilisateur clique sur un élément UI interactif
    if (isInteractiveElement(e.target)) return;

    longPressTimer.current = setTimeout(() => {
      openViewer();
    }, LONG_PRESS_DURATION);
  }, [enableViewer, isViewing, openViewer, isInteractiveElement]);

  const handleMouseUp = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  const handleMouseLeave = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  // Attacher les event listeners au document pour capturer les long press partout
  useEffect(() => {
    if (!enableViewer) return;

    // Utiliser capture: true pour intercepter avant les autres éléments
    document.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true, capture: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true, capture: true });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: true, capture: true });
    document.addEventListener('mousedown', handleMouseDown, { capture: true });
    document.addEventListener('mouseup', handleMouseUp, { capture: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, { capture: true });
      document.removeEventListener('touchend', handleTouchEnd, { capture: true });
      document.removeEventListener('touchmove', handleTouchMove, { capture: true });
      document.removeEventListener('touchcancel', handleTouchEnd, { capture: true });
      document.removeEventListener('mousedown', handleMouseDown, { capture: true });
      document.removeEventListener('mouseup', handleMouseUp, { capture: true });
      document.removeEventListener('mouseleave', handleMouseLeave);

      clearLongPressTimer();
    };
  }, [enableViewer, handleTouchStart, handleTouchEnd, handleTouchMove, handleMouseDown, handleMouseUp, handleMouseLeave, clearLongPressTimer]);

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
