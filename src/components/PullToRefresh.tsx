/**
 * PullToRefresh - Composant premium pour rafraîchir l'app en tirant vers le bas
 * Design centré, épuré et sophistiqué avec cercle de progression
 *
 * Le pull-to-refresh ne se déclenche que si:
 * 1. L'utilisateur est en haut de la page (scrollTop < 5px)
 * 2. Le touch commence dans le premier QUART (25%) de l'écran
 */

import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import './PullToRefresh.css';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh?: () => void | Promise<void>;
  threshold?: number;
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

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop > 5) return;

    const screenHeight = window.innerHeight;
    const topQuarter = screenHeight * 0.25;
    const touchY = e.touches[0].clientY;

    if (touchY > topQuarter) return;

    startY.current = touchY;
    setIsPulling(true);
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;

    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0) {
      const resistance = 0.4;
      const distance = Math.min(diff * resistance, threshold * 1.5);
      setPullDistance(distance);

      if (distance > 10) {
        e.preventDefault();
      }
    }
  }, [isPulling, disabled, isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;

    setIsPulling(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold * 0.6);

      try {
        if (onRefresh) {
          await onRefresh();
        } else {
          window.location.reload();
        }
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 300);
      }
    } else {
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

  // Calcul du stroke-dashoffset pour le cercle de progression
  // circumference = 2 * PI * rayon (25) ≈ 157
  const circumference = 157;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <div ref={containerRef} className="pull-to-refresh-container">
      {/* Overlay subtil pendant le pull */}
      <div className={`pull-overlay ${isPulling || isRefreshing ? 'visible' : ''}`} />

      {/* Indicateur centré premium */}
      <div
        className={`pull-indicator ${isPulling || isRefreshing ? 'visible' : ''} ${shouldTrigger ? 'ready' : ''} ${isRefreshing ? 'refreshing' : ''}`}
        style={{
          opacity: isPulling || isRefreshing ? Math.min(progress * 2, 1) : 0
        }}
      >
        <div className="pull-indicator-content">
          {/* Cercle de progression avec icône centrale */}
          <div className="pull-progress-ring">
            <svg viewBox="0 0 56 56">
              <circle
                className="ring-bg"
                cx="28"
                cy="28"
                r="25"
              />
              <circle
                className="ring-progress"
                cx="28"
                cy="28"
                r="25"
                style={{
                  strokeDashoffset: isRefreshing ? 0 : strokeDashoffset
                }}
              />
            </svg>
            <div className="pull-icon-container">
              {isRefreshing ? (
                <div className="pull-spinner" />
              ) : (
                <svg
                  className="pull-arrow"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5" />
                  <path d="M5 12l7-7 7 7" />
                </svg>
              )}
            </div>
          </div>

          {/* Texte indicateur */}
          <span className="pull-text">
            {isRefreshing
              ? 'Actualisation...'
              : shouldTrigger
                ? 'Relâcher'
                : 'Tirer pour actualiser'}
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
