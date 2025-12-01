import { createPortal } from 'react-dom';

interface StickyHeaderProps {
  onBack: () => void;
  onHistory?: () => void;
  showHistory?: boolean;
  backLabel?: string;
}

export default function StickyHeader({
  onBack,
  onHistory,
  showHistory = false,
  backLabel = 'Retour'
}: StickyHeaderProps) {
  // Use portal to render directly in body, ensuring position: fixed works
  // regardless of parent CSS (transform, overflow, etc.)
  return createPortal(
    <div className="sticky-header">
      <button
        className="sticky-header-btn sticky-header-back"
        onClick={(e) => {
          e.stopPropagation();
          onBack();
        }}
        aria-label="Retour"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>{backLabel}</span>
      </button>

      {showHistory && onHistory && (
        <button
          className="sticky-header-btn sticky-header-history"
          onClick={(e) => {
            e.stopPropagation();
            onHistory();
          }}
          aria-label="Historique"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Historique</span>
        </button>
      )}
    </div>,
    document.body
  );
}
