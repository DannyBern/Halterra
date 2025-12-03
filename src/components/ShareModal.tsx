/**
 * Modal de partage social - Design premium et minimaliste
 * Avec Share Card preview et sélecteur de format
 *
 * IMPORTANT: Utilise createPortal pour rendre directement dans le body
 * car les éléments avec transform (comme PullToRefresh) cassent position: fixed.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { SharePlatform, ShareableSession, ShareResult } from '../types/share';
import { shareSession, isNativeShareAvailable, trackShare } from '../services/shareService';
import ShareCardPreview, { useShareCardDownload, useShareCardClipboard, TEMPLATES, type ShareCardTemplate } from './ShareCardPreview';
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
    id: 'messenger',
    name: 'Messenger',
    icon: '💬',
    color: '#0084FF',
    available: true,
  },
  {
    id: 'email',
    name: 'Email',
    icon: '✉️',
    color: '#EA4335',
    available: true,
  },
  {
    id: 'sms',
    name: 'SMS',
    icon: '📱',
    color: '#34C759',
    available: true,
  },
];

// Liste ordonnée des templates pour l'affichage
const TEMPLATE_ORDER: ShareCardTemplate[] = ['dark', 'turquoise', 'midnight', 'peach', 'cloud'];

export default function ShareModal({ session, isOpen, onClose }: ShareModalProps) {
  const [sharing, setSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState<{
    message?: string;
    type?: 'success' | 'error';
  }>({});
  const [cardBlob, setCardBlob] = useState<Blob | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ShareCardTemplate>('dark');
  const modalRef = useRef<HTMLDivElement>(null);

  const { downloadCard } = useShareCardDownload();
  const { copyToClipboard } = useShareCardClipboard();

  // Scroll au top quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  const handleImageReady = useCallback((blob: Blob) => {
    setCardBlob(blob);
  }, []);

  const handleDownload = useCallback(() => {
    if (cardBlob) {
      downloadCard(cardBlob, 'halterra-meditation.png');
      setShareStatus({
        message: 'Image téléchargée!',
        type: 'success',
      });
    }
  }, [cardBlob, downloadCard]);

  const handleCopyImage = useCallback(async () => {
    if (cardBlob) {
      const success = await copyToClipboard(cardBlob);
      if (success) {
        setShareStatus({
          message: 'Image copiée!',
          type: 'success',
        });
      } else {
        // Fallback to download
        handleDownload();
      }
    }
  }, [cardBlob, copyToClipboard, handleDownload]);

  // Partage avec image via Web Share API (pour Messenger, native, etc.)
  const shareWithImage = async (platform: SharePlatform): Promise<ShareResult> => {
    if (!cardBlob) {
      return { success: false, platform, error: 'Image non prête' };
    }

    // Vérifier si le navigateur supporte le partage de fichiers
    const canShareFiles = navigator.canShare?.({
      files: [new File([cardBlob], 'meditation.png', { type: 'image/png' })]
    });

    if (!canShareFiles) {
      // Fallback: copier l'image et informer l'utilisateur
      const copied = await copyToClipboard(cardBlob);
      if (copied) {
        return { success: true, platform, error: 'Image copiée! Colle-la dans Messenger.' };
      }
      return { success: false, platform, error: 'Partage non supporté sur ce navigateur' };
    }

    try {
      const file = new File([cardBlob], 'halterra-meditation.png', { type: 'image/png' });
      const shareText = `${session.mood.icon} Ma méditation Halterra\n\nDécouvre Halterra - des méditations personnalisées par IA!\nhttps://halterra.vercel.app`;

      await navigator.share({
        title: 'Ma méditation Halterra',
        text: shareText,
        files: [file],
      });

      return { success: true, platform };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, platform, error: 'Partage annulé' };
      }
      return { success: false, platform, error: 'Erreur lors du partage' };
    }
  };

  const handleShare = async (platform: SharePlatform) => {
    setSharing(true);
    setShareStatus({});

    try {
      let result: ShareResult;

      // Pour Messenger et native, utiliser le partage avec image
      if (platform === 'messenger' || platform === 'native') {
        result = await shareWithImage(platform);
      } else {
        result = await shareSession(session, {
          platform,
          format: platform === 'instagram' ? 'image' : 'link',
          includeQuote: true,
        });
      }

      if (result.success) {
        const messages: Record<string, string> = {
          instagram: 'Texte copié! Ouvre Instagram pour partager.',
          messenger: 'Partagé avec succès!',
          facebook: 'Ouverture de Facebook...',
          email: 'Ouverture de l\'application email...',
          sms: 'Ouverture des messages...',
          native: 'Partagé avec succès!',
        };

        setShareStatus({
          message: result.error || messages[platform] || 'Partagé avec succès!',
          type: 'success',
        });

        // Track le partage
        await trackShare(result, session);

        // Fermer automatiquement après 2s pour email/sms
        if (['email', 'sms'].includes(platform)) {
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } else {
        setShareStatus({
          message: result.error || 'Erreur lors du partage',
          type: 'error',
        });
      }
    } catch (error) {
      setShareStatus({
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

  // Utiliser createPortal pour rendre directement dans body
  // Cela évite les problèmes de position: fixed causés par le transform de PullToRefresh
  const modalContent = (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
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

        {/* Template Selector */}
        <div className="template-selector">
          <p className="template-selector-label">Choisis ton style</p>
          <div className="template-options">
            {TEMPLATE_ORDER.map((templateId) => {
              const tmpl = TEMPLATES[templateId];
              return (
                <button
                  key={templateId}
                  className={`template-option ${selectedTemplate === templateId ? 'template-option-active' : ''}`}
                  onClick={() => setSelectedTemplate(templateId)}
                  aria-label={tmpl.name}
                  style={{
                    background: tmpl.background
                      ? `url(${tmpl.background}) center/cover`
                      : tmpl.bgColor,
                  }}
                >
                  <span className="template-option-name" style={{
                    color: tmpl.isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                  }}>
                    {tmpl.name}
                  </span>
                  {selectedTemplate === templateId && (
                    <span className="template-option-check">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Share Card Preview */}
        <div className="share-card-section">
          <ShareCardPreview
            session={session}
            format="square"
            template={selectedTemplate}
            onImageReady={handleImageReady}
          />

          {/* Quick actions */}
          <div className="share-quick-actions">
            <button className="share-quick-btn" onClick={handleDownload} disabled={!cardBlob}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Télécharger</span>
            </button>
            <button className="share-quick-btn" onClick={handleCopyImage} disabled={!cardBlob}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copier</span>
            </button>
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
              className={`share-platform-btn ${sharing ? 'share-platform-btn-loading' : ''}`}
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

  return createPortal(modalContent, document.body);
}
