/**
 * PullToRefresh - Composant pour rafraîchir l'app en tirant vers le bas
 * Fonctionne sur mobile comme le geste natif des apps iOS/Android
 */

import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import './PullToRefresh.css';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh?: () => void | Promise<void>;
  threshold?: number; // Distance en px pour déclencher le refresh
  disabled?: boolean;
}

export default function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  disabled = false
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;

    // Vérifier si on est en haut de la page
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop > 5) return;

    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;

    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    // Seulement si on tire vers le bas
    if (diff > 0) {
      // Effet de résistance (plus on tire, plus c'est dur)
      const resistance = 0.4;
      const distance = Math.min(diff * resistance, threshold * 1.5);
      setPullDistance(distance);

      // Empêcher le scroll natif pendant le pull
      if (distance > 10) {
        e.preventDefault();
      }
    }
  }, [isPulling, disabled, isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;

    setIsPulling(false);

    if (pullDistance >= threshold && !isRefreshing) {
      // Déclencher le refresh
      setIsRefreshing(true);
      setPullDistance(threshold * 0.6); // Garder un peu visible pendant le refresh

      try {
        if (onRefresh) {
          await onRefresh();
        } else {
          // Comportement par défaut: recharger la page
          window.location.reload();
        }
      } finally {
        // Petit délai pour voir l'animation
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 300);
      }
    } else {
      // Pas assez tiré, annuler
      setPullDistance(0);
    }
  }, [isPulling, disabled, pullDistance, threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    const container = document.body;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div ref={containerRef} className="pull-to-refresh-container">
      {/* Indicateur de pull */}
      <div
        className={`pull-indicator ${isPulling || isRefreshing ? 'visible' : ''} ${shouldTrigger ? 'ready' : ''} ${isRefreshing ? 'refreshing' : ''}`}
        style={{
          transform: `translateY(${pullDistance - 60}px)`,
          opacity: Math.min(progress * 1.5, 1)
        }}
      >
        <div className="pull-indicator-content">
          {isRefreshing ? (
            <div className="pull-spinner" />
          ) : (
            <svg
              className="pull-arrow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                transform: `rotate(${shouldTrigger ? 180 : 0}deg)`,
                transition: 'transform 0.2s ease'
              }}
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          )}
          <span className="pull-text">
            {isRefreshing ? 'Actualisation...' : shouldTrigger ? 'Relâcher pour actualiser' : 'Tirer pour actualiser'}
          </span>
        </div>
      </div>

      {/* Contenu de l'app */}
      <div
        className="pull-content"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : 'none',
          transition: isPulling ? 'none' : 'transform 0.3s ease'
        }}
      >
        {children}
      </div>
    </div>
  );
}
