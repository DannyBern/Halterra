import { useState, useCallback, useEffect } from 'react';
import type { ReactElement } from 'react';

interface UseFullscreenBackgroundReturn {
  isFullscreen: boolean;
  showFullscreen: () => void;
  hideFullscreen: () => void;
  FullscreenViewer: () => ReactElement | null;
  handlePressStart: (e: React.MouseEvent | React.TouchEvent) => void;
  handlePressEnd: () => void;
}

export function useFullscreenBackground(backgroundImageUrl: string): UseFullscreenBackgroundReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pressTimer, setPressTimer] = useState<number | null>(null);

  const showFullscreen = useCallback(() => {
    setIsFullscreen(true);
  }, []);

  const hideFullscreen = useCallback(() => {
    setIsFullscreen(false);
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  }, [pressTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
      }
    };
  }, [pressTimer]);

  // Handle long-press start
  const handlePressStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Check if the click/touch is on a button or interactive element
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'A' ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('a') ||
      target.closest('.interactive')
    ) {
      return; // Don't trigger on interactive elements
    }

    const timer = window.setTimeout(() => {
      showFullscreen();
    }, 500); // 500ms long-press
    setPressTimer(timer);
  }, [showFullscreen]);

  // Handle long-press end
  const handlePressEnd = useCallback(() => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  }, [pressTimer]);

  const FullscreenViewer = useCallback(() => {
    if (!isFullscreen) return null;

    return (
      <div
        className="fullscreen-background-overlay"
        onClick={hideFullscreen}
        onTouchEnd={hideFullscreen}
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      >
        <button
          className="fullscreen-close-button"
          onClick={hideFullscreen}
          aria-label="Fermer la vue plein écran"
        >
          <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" fill="none" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <div className="fullscreen-hint">Touchez n'importe où pour fermer</div>
      </div>
    );
  }, [isFullscreen, backgroundImageUrl, hideFullscreen]);

  return {
    isFullscreen,
    showFullscreen,
    hideFullscreen,
    FullscreenViewer,
    handlePressStart,
    handlePressEnd
  };
}
