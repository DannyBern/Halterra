/**
 * Modal de partage social - Design premium et minimaliste
 */

import { useState } from 'react';
import type { SharePlatform, ShareableSession, ShareResult } from '../types/share';
import { shareSession, isNativeShareAvailable, trackShare } from '../services/shareService';
import './ShareModal.css';

interface ShareModalProps {
  session: ShareableSession;
  isOpen: boolean;
  onClose: () => void;
}

// Configuration des plateformes avec icônes
const PLATFORMS: Array<{
  id: SharePlatform;
  name: string;
  icon: string;
  color: string;
  available: boolean;
}> = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    color: '#E4405F',
    available: true,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '👥',
    color: '#1877F2',
    available: true,
  },
  {
    id: 'twitter',
    name: 'X',
    icon: '🐦',
    color: '#000000',
    available: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: '#0A66C2',
    available: true,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    color: '#25D366',
    available: true,
  },
  {
    id: 'copy-link',
    name: 'Copier le lien',
    icon: '🔗',
    color: '#667eea',
    available: true,
  },
];

export default function ShareModal({ session, isOpen, onClose }: ShareModalProps) {
  const [sharing, setSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState<{
    platform?: SharePlatform;
    message?: string;
    type?: 'success' | 'error';
  }>({});

  const handleShare = async (platform: SharePlatform) => {
    setSharing(true);
    setShareStatus({});

    try {
      const result: ShareResult = await shareSession(session, {
        platform,
        format: platform === 'instagram' ? 'image' : 'link',
        includeQuote: true,
      });

      if (result.success) {
        setShareStatus({
          platform,
          message:
            platform === 'copy-link'
              ? 'Lien copié!'
              : platform === 'instagram'
                ? 'Texte copié! Ouvre Instagram pour partager.'
                : 'Partagé avec succès!',
          type: 'success',
        });

        // Track le partage
        await trackShare(result, session);

        // Fermer automatiquement après 2s si c'est un succès (sauf Instagram/copy)
        if (platform !== 'instagram' && platform !== 'copy-link') {
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } else {
        setShareStatus({
          platform,
          message: result.error || 'Erreur lors du partage',
          type: 'error',
        });
      }
    } catch (error) {
      setShareStatus({
        platform,
        message: 'Une erreur est survenue',
        type: 'error',
      });
    } finally {
      setSharing(false);
    }
  };

  // Utiliser le partage natif si disponible sur mobile
  const nativeShareAvailable = isNativeShareAvailable();
  const platformsToShow = nativeShareAvailable
    ? [
        { id: 'native' as SharePlatform, name: 'Partager', icon: '📤', color: '#667eea', available: true },
        ...PLATFORMS,
      ]
    : PLATFORMS;

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="share-modal-header">
          <h2 className="share-modal-title">Partager ma méditation</h2>
          <button className="share-modal-close" onClick={onClose} aria-label="Fermer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Aperçu de la session */}
        <div className="share-preview">
          <div className="share-preview-mood" style={{ backgroundColor: `${session.mood.color}20` }}>
            <span className="share-preview-icon">{session.mood.icon}</span>
          </div>
          <div className="share-preview-content">
            <h3 className="share-preview-title">
              {session.intention || 'Ma méditation'}
            </h3>
            <p className="share-preview-mood-name" style={{ color: session.mood.color }}>
              {session.mood.name}
            </p>
          </div>
        </div>

        {/* Status message */}
        {shareStatus.message && (
          <div className={`share-status share-status-${shareStatus.type}`}>
            <span className="share-status-icon">
              {shareStatus.type === 'success' ? '✓' : '⚠'}
            </span>
            <span className="share-status-message">{shareStatus.message}</span>
          </div>
        )}

        {/* Grid de plateformes */}
        <div className="share-platforms-grid">
          {platformsToShow.map((platform) => (
            <button
              key={platform.id}
              className={`share-platform-btn ${sharing && shareStatus.platform === platform.id ? 'share-platform-btn-loading' : ''}`}
              onClick={() => handleShare(platform.id)}
              disabled={sharing}
              style={{
                '--platform-color': platform.color,
              } as React.CSSProperties}
            >
              <span className="share-platform-icon">{platform.icon}</span>
              <span className="share-platform-name">{platform.name}</span>
            </button>
          ))}
        </div>

        {/* Footer avec tips */}
        <div className="share-modal-footer">
          <p className="share-tip">
            💡 Partager ta méditation inspire d'autres personnes à prendre soin d'elles
          </p>
        </div>
      </div>
    </div>
  );
}
