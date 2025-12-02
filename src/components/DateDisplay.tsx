import './DateDisplay.css';
import type { AstrologicalProfile } from '../types';
import { generateDailyInsight, getInsightLabel } from '../utils/dailyInsight';
import { useEffect, useState, useRef, useCallback } from 'react';

interface DateDisplayProps {
  userName: string;
  astrologicalProfile?: AstrologicalProfile;
  onContinue: () => void;
}

export default function DateDisplay({ userName, astrologicalProfile, onContinue }: DateDisplayProps) {
  const [isReady, setIsReady] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [dailyInsight, setDailyInsight] = useState<string | null>(null);
  const [insightLabel, setInsightLabel] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = new Date();

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };

  const formattedDate = today.toLocaleDateString('fr-FR', options);
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  useEffect(() => {
    // Staggered reveal animation
    const timer = setTimeout(() => setIsReady(true), 100);
    // Show hint after a moment of contemplation
    const hintTimer = setTimeout(() => setShowHint(true), 4000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hintTimer);
    };
  }, []);

  // Generate daily insight based on cosmic energies
  useEffect(() => {
    if (!astrologicalProfile) return;

    // Generate insight from natal profile + current cosmic positions
    const insight = generateDailyInsight(astrologicalProfile);
    const label = getInsightLabel();

    setDailyInsight(insight);
    setInsightLabel(label);
    setIsLoadingInsight(false);
  }, [astrologicalProfile]);

  // Handle swipe up gesture
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    // Swipe up threshold
    if (deltaY > 50) {
      onContinue();
    }
    touchStartY.current = null;
  }, [onContinue]);

  return (
    <div
      className={`welcome-sanctuary ${isReady ? 'is-ready' : ''}`}
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onContinue}
    >
      {/* Cinematic background */}
      <div className="sanctuary-backdrop">
        <div className="sanctuary-image"></div>
        <div className="sanctuary-vignette"></div>
        <div className="sanctuary-warmth"></div>
      </div>

      {/* Ambient breathing light */}
      <div className="sanctuary-ambience">
        <div className="ambience-orb ambience-orb-1"></div>
        <div className="ambience-orb ambience-orb-2"></div>
      </div>

      {/* Content floating on the scene */}
      <div className="sanctuary-content">
        {/* Upper section - Greeting */}
        <div className="sanctuary-header">
          <div className="sanctuary-star">✦</div>
          <h1 className="sanctuary-greeting">
            {getGreeting()}, <span className="sanctuary-name">{userName}</span>
          </h1>
          <p className="sanctuary-date">{capitalizedDate}</p>
        </div>

        {/* Center section - Personal insight */}
        {astrologicalProfile && (
          <div className={`sanctuary-insight ${isLoadingInsight ? 'is-loading' : ''}`}>
            {dailyInsight ? (
              <>
                <span className="insight-label">{insightLabel}</span>
                <p className="insight-text">{dailyInsight}</p>
              </>
            ) : (
              <div className="insight-loading">
                <div className="insight-loading-dot"></div>
                <div className="insight-loading-dot"></div>
                <div className="insight-loading-dot"></div>
              </div>
            )}
          </div>
        )}

        {/* Bottom section - Subtle invitation */}
        <div className={`sanctuary-invitation ${showHint ? 'is-visible' : ''}`}>
          <div className="invitation-line"></div>
          <p className="invitation-text">Touchez pour commencer</p>
          <div className="invitation-chevron">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
