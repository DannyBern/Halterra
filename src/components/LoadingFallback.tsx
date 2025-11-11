import React from 'react';
import './LoadingFallback.css';

/**
 * Composant de fallback pour React.Suspense
 * Affiché pendant le chargement des composants lazy-loaded
 */
const LoadingFallback: React.FC = () => {
  return (
    <div className="loading-fallback">
      <div className="loading-fallback-content">
        <div className="loading-spinner" />
        <p className="loading-text">Chargement...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
