import { useState, useCallback } from 'react';
import type { ReactElement } from 'react';

interface UseFullscreenBackgroundReturn {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  FullscreenViewer: () => ReactElement | null;
  handleBackgroundClick: (e: React.MouseEvent | React.TouchEvent) => void;
}

export function useFullscreenBackground(backgroundImageUrl: string): UseFullscreenBackgroundReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      // Hide with animation
      setIsClosing(true);
      setTimeout(() => {
        setIsFullscreen(false);
        setIsClosing(false);
      }, 400); // Duration of exit animation
    } else {
      // Show immediately
      setIsFullscreen(true);
      setIsClosing(false);
    }
  }, [isFullscreen]);

  // Handle background click - toggle fullscreen mode
  const handleBackgroundClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
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
      target.closest('.audio-toggle') ||
      target.closest('.guide-card')
    ) {
      return; // Don't trigger on interactive elements
    }

    e.stopPropagation();
    toggleFullscreen();
  }, [toggleFullscreen]);

  const FullscreenViewer = useCallback(() => {
    if (!isFullscreen) return null;

    return (
      <div
        className={`fullscreen-background-overlay ${isClosing ? 'closing' : ''}`}
        onClick={toggleFullscreen}
        onTouchStart={toggleFullscreen}
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      />
    );
  }, [isFullscreen, isClosing, backgroundImageUrl, toggleFullscreen]);

  return {
    isFullscreen,
    toggleFullscreen,
    FullscreenViewer,
    handleBackgroundClick,
  };
}
