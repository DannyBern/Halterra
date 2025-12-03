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

type InstagramFormat = 'story' | 'post';

export default function ShareModal({ session, isOpen, onClose }: ShareModalProps) {
  const [sharing, setSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState<{
    message?: string;
    type?: 'success' | 'error';
  }>({});
  const [cardBlob, setCardBlob] = useState<Blob | null>(null);
  const [instagramBlob, setInstagramBlob] = useState<Blob | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ShareCardTemplate>('dark');
  const [showInstagramPreview, setShowInstagramPreview] = useState(false);
  const [instagramFormat, setInstagramFormat] = useState<InstagramFormat>('story');
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

  const handleInstagramImageReady = useCallback((blob: Blob) => {
    setInstagramBlob(blob);
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
  const shareWithImage = async (platform: SharePlatform, blob: Blob, filename: string): Promise<ShareResult> => {
    // Vérifier si le navigateur supporte le partage de fichiers
    const canShareFiles = navigator.canShare?.({
      files: [new File([blob], filename, { type: 'image/png' })]
    });

    if (!canShareFiles) {
      // Fallback: copier l'image et informer l'utilisateur
      const copied = await copyToClipboard(blob);
      if (copied) {
        const platformName = platform === 'instagram' ? 'Instagram' : 'Messenger';
        return { success: true, platform, error: `Image copiée! Colle-la dans ${platformName}.` };
      }
      return { success: false, platform, error: 'Partage non supporté sur ce navigateur' };
    }

    try {
      const file = new File([blob], filename, { type: 'image/png' });
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

  // Handler pour afficher la preview Instagram
  const handleInstagramClick = () => {
    setShowInstagramPreview(true);
    setShareStatus({});
  };

  // Handler pour le partage Instagram avec l'image
  const handleInstagramShare = async () => {
    if (!instagramBlob) {
      setShareStatus({ message: 'Image en cours de génération...', type: 'error' });
      return;
    }
    setSharing(true);
    setShareStatus({});

    const filename = instagramFormat === 'story' ? 'halterra-story.png' : 'halterra-post.png';
    const result = await shareWithImage('instagram', instagramBlob, filename);

    if (result.success) {
      setShareStatus({
        message: result.error || 'Image prête pour Instagram!',
        type: 'success',
      });
      await trackShare(result, session);
    } else {
      setShareStatus({
        message: result.error || 'Erreur lors du partage',
        type: 'error',
      });
    }
    setSharing(false);
  };

  // Retour à la vue principale depuis Instagram
  const handleBackFromInstagram = () => {
    setShowInstagramPreview(false);
    setShareStatus({});
  };

  const handleShare = async (platform: SharePlatform) => {
    // Instagram a son propre flow avec preview
    if (platform === 'instagram') {
      handleInstagramClick();
      return;
    }

    setSharing(true);
    setShareStatus({});

    try {
      let result: ShareResult;

      // Pour Messenger et native, utiliser le partage avec image
      if (platform === 'messenger' || platform === 'native') {
        if (!cardBlob) {
          result = { success: false, platform, error: 'Image non prête' };
        } else {
          result = await shareWithImage(platform, cardBlob, 'halterra-meditation.png');
        }
      } else {
        result = await shareSession(session, {
          platform,
          format: 'link',
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
          {showInstagramPreview ? (
            <button className="share-modal-back" onClick={handleBackFromInstagram} aria-label="Retour">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 12H5M12 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : null}
          <h2 className="share-modal-title">
            {showInstagramPreview ? 'Partager sur Instagram' : 'Partager ma méditation'}
          </h2>
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

        {/* Template Selector - visible dans les deux vues */}
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
                  <span className="template-option-name">
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

        {/* Vue principale ou Vue Instagram */}
        {showInstagramPreview ? (
          <>
            {/* Sélecteur de format Instagram */}
            <div className="instagram-format-selector">
              <button
                className={`instagram-format-btn ${instagramFormat === 'story' ? 'instagram-format-btn-active' : ''}`}
                onClick={() => setInstagramFormat('story')}
              >
                <div className="instagram-format-icon instagram-format-icon-story" />
                <span>Story</span>
                <span className="instagram-format-ratio">9:16</span>
              </button>
              <button
                className={`instagram-format-btn ${instagramFormat === 'post' ? 'instagram-format-btn-active' : ''}`}
                onClick={() => setInstagramFormat('post')}
              >
                <div className="instagram-format-icon instagram-format-icon-post" />
                <span>Post / Message</span>
                <span className="instagram-format-ratio">Carré</span>
              </button>
            </div>

            {/* Instagram Preview */}
            <div className="share-card-section share-card-section-instagram">
              <ShareCardPreview
                session={session}
                format={instagramFormat === 'story' ? 'story' : 'square'}
                template={selectedTemplate}
                onImageReady={handleInstagramImageReady}
              />

              <p className="instagram-format-hint">
                {instagramFormat === 'story' ? 'Format Story (9:16)' : 'Format carré pour posts et messages'}
              </p>
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

            {/* Bouton de partage Instagram */}
            <div className="instagram-share-actions">
              <button
                className="instagram-share-btn"
                onClick={handleInstagramShare}
                disabled={sharing || !instagramBlob}
              >
                <span className="instagram-share-icon">📷</span>
                <span>{sharing ? 'Partage en cours...' : 'Partager sur Instagram'}</span>
              </button>
              <p className="instagram-share-hint">
                {instagramFormat === 'story'
                  ? 'Partage en Story ou envoie l\'image à tes amis'
                  : 'Partage en post ou envoie en message privé'}
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Share Card Preview - Format carré */}
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
                Partager ta méditation inspire d'autres personnes à prendre soin d'elles
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
