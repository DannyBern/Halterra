/**
 * Modal de partage social - Design premium et minimaliste
 * Avec Share Card preview et sélecteur de format
 *
 * IMPORTANT: Utilise createPortal pour rendre directement dans le body
 * car les éléments avec transform (comme PullToRefresh) cassent position: fixed.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ShareableSession } from '../types/share';
import { trackShare } from '../services/shareService';
import ShareCardPreview, { useShareCardDownload, useShareCardClipboard, TEMPLATES, type ShareCardTemplate } from './ShareCardPreview';
import './ShareModal.css';

interface ShareModalProps {
  session: ShareableSession;
  isOpen: boolean;
  onClose: () => void;
}

// Liste ordonnée des templates pour l'affichage
const TEMPLATE_ORDER: ShareCardTemplate[] = ['dark', 'turquoise', 'midnight', 'peach', 'cloud'];

type ShareFormat = 'story' | 'square';

export default function ShareModal({ session, isOpen, onClose }: ShareModalProps) {
  const [sharing, setSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState<{
    message?: string;
    type?: 'success' | 'error';
  }>({});
  const [shareBlob, setShareBlob] = useState<Blob | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ShareCardTemplate>('dark');
  const [selectedFormat, setSelectedFormat] = useState<ShareFormat>('square');
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
    setShareBlob(blob);
  }, []);

  const handleDownload = useCallback(() => {
    if (shareBlob) {
      const filename = selectedFormat === 'story' ? 'halterra-story.png' : 'halterra-post.png';
      downloadCard(shareBlob, filename);
      setShareStatus({
        message: 'Image téléchargée!',
        type: 'success',
      });
    }
  }, [shareBlob, selectedFormat, downloadCard]);

  const handleCopyImage = useCallback(async () => {
    if (shareBlob) {
      const success = await copyToClipboard(shareBlob);
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
  }, [shareBlob, copyToClipboard, handleDownload]);

  // Handler principal de partage via Web Share API
  const handleShare = async () => {
    if (!shareBlob) {
      setShareStatus({ message: 'Image en cours de génération...', type: 'error' });
      return;
    }

    setSharing(true);
    setShareStatus({});

    try {
      const filename = selectedFormat === 'story' ? 'halterra-story.png' : 'halterra-post.png';
      const file = new File([shareBlob], filename, { type: 'image/png' });
      const shareText = `${session.mood.icon} Ma méditation Halterra\n\nDécouvre Halterra!\nhttps://halterra.vercel.app`;

      // Vérifier si Web Share API est disponible
      if (!navigator.share) {
        // Fallback: copier l'image
        const copied = await copyToClipboard(shareBlob);
        if (copied) {
          setShareStatus({
            message: 'Image copiée! Colle-la dans ton app préférée.',
            type: 'success',
          });
        } else {
          setShareStatus({
            message: 'Partage non supporté. Télécharge l\'image.',
            type: 'error',
          });
        }
        setSharing(false);
        return;
      }

      // Vérifier si le partage de fichiers est supporté
      const canShareFiles = navigator.canShare?.({ files: [file] });

      if (!canShareFiles) {
        // Fallback: copier l'image
        const copied = await copyToClipboard(shareBlob);
        if (copied) {
          setShareStatus({
            message: 'Image copiée! Ouvre ton app et colle l\'image.',
            type: 'success',
          });
        } else {
          setShareStatus({
            message: 'Télécharge l\'image pour la partager.',
            type: 'error',
          });
        }
        setSharing(false);
        return;
      }

      // Partager avec Web Share API
      await navigator.share({
        title: 'Ma méditation Halterra',
        text: shareText,
        files: [file],
      });

      setShareStatus({
        message: 'Partagé avec succès!',
        type: 'success',
      });

      // Track le partage
      await trackShare({ success: true, platform: 'native' }, session);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setShareStatus({
          message: 'Partage annulé',
          type: 'error',
        });
      } else {
        setShareStatus({
          message: 'Erreur lors du partage',
          type: 'error',
        });
      }
    } finally {
      setSharing(false);
    }
  };

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

        {/* Format Selector avec recommandations */}
        <div className="share-format-selector-section">
          <p className="format-selector-label">Choisis ton format</p>
          <div className="format-selector">
            <button
              className={`format-btn ${selectedFormat === 'square' ? 'format-btn-active' : ''}`}
              onClick={() => setSelectedFormat('square')}
            >
              <div className="format-icon format-icon-square" />
              <div className="format-info">
                <span className="format-name">Carré</span>
                <span className="format-ratio">1:1</span>
              </div>
              <p className="format-hint">
                Pour posts Instagram, Messenger, WhatsApp
              </p>
            </button>
            <button
              className={`format-btn ${selectedFormat === 'story' ? 'format-btn-active' : ''}`}
              onClick={() => setSelectedFormat('story')}
            >
              <div className="format-icon format-icon-story" />
              <div className="format-info">
                <span className="format-name">Story</span>
                <span className="format-ratio">9:16</span>
              </div>
              <p className="format-hint">
                Pour Instagram Stories, Snapchat, TikTok
              </p>
            </button>
          </div>
        </div>

        {/* Share Card Preview */}
        <div className="share-card-section">
          <ShareCardPreview
            session={session}
            format={selectedFormat}
            template={selectedTemplate}
            onImageReady={handleImageReady}
          />
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

        {/* Actions principales */}
        <div className="share-actions">
          <button
            className="share-main-btn"
            onClick={handleShare}
            disabled={sharing || !shareBlob}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span>{sharing ? 'Partage en cours...' : 'Partager ma méditation'}</span>
          </button>

          {/* Quick actions secondaires */}
          <div className="share-secondary-actions">
            <button className="share-secondary-btn" onClick={handleDownload} disabled={!shareBlob}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Télécharger</span>
            </button>
            <button className="share-secondary-btn" onClick={handleCopyImage} disabled={!shareBlob}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
