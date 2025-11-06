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
  const [isClosing, setIsClosing] = useState(false);
  const [pressTimer, setPressTimer] = useState<number | null>(null);

  const showFullscreen = useCallback(() => {
    setIsFullscreen(true);
    setIsClosing(false);
  }, []);

  const hideFullscreen = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsFullscreen(false);
      setIsClosing(false);
    }, 500); // Duration of exit animation

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
      target.closest('.audio-toggle')
    ) {
      return; // Don't trigger on interactive elements
    }

    const timer = window.setTimeout(() => {
      showFullscreen();
    }, 700); // 700ms long-press for better UX
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
        className={`fullscreen-background-overlay ${isClosing ? 'closing' : ''}`}
        onClick={hideFullscreen}
        onTouchStart={hideFullscreen}
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      />
    );
  }, [isFullscreen, isClosing, backgroundImageUrl, hideFullscreen]);

  return {
    isFullscreen,
    showFullscreen,
    hideFullscreen,
    FullscreenViewer,
    handlePressStart,
    handlePressEnd
  };
}
