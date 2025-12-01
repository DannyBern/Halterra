/**
 * ShareCardPreview - Génération d'images de partage premium
 * Utilise Canvas HTML5 pour créer des Share Cards élégantes côté client
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ShareableSession } from '../types/share';
import './ShareCardPreview.css';

export type ShareCardFormat = 'story' | 'square' | 'wide';

interface ShareCardPreviewProps {
  session: ShareableSession;
  format: ShareCardFormat;
  onImageReady?: (blob: Blob, dataUrl: string) => void;
}

// Dimensions pour chaque format
const DIMENSIONS: Record<ShareCardFormat, { width: number; height: number }> = {
  story: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
  wide: { width: 1200, height: 630 },
};

// Scale pour l'affichage (canvas interne vs preview)
// Story est plus petit car très grand verticalement
const PREVIEW_SCALES: Record<ShareCardFormat, number> = {
  story: 0.15,
  square: 0.22,
  wide: 0.25,
};

/**
 * Extrait une citation inspirante du texte de méditation
 */
function extractQuote(text: string, maxLength: number = 150): string {
  // Nettoyer et diviser en phrases
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const sentences = cleaned.split(/(?<=[.!?])\s+/);

  // Chercher une phrase inspirante (éviter les instructions directes)
  const inspiringPhrases = sentences.filter(s =>
    s.length >= 30 &&
    s.length <= maxLength &&
    !s.toLowerCase().startsWith('maintenant') &&
    !s.toLowerCase().startsWith('respire') &&
    !s.toLowerCase().startsWith('ferme')
  );

  if (inspiringPhrases.length > 0) {
    // Prendre une phrase du milieu ou de la fin (souvent plus profonde)
    const idx = Math.floor(inspiringPhrases.length * 0.6);
    return inspiringPhrases[idx];
  }

  // Fallback: prendre les premiers mots
  if (cleaned.length <= maxLength) return cleaned;
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace) + '...';
}

/**
 * Parse une couleur hex en RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 102, g: 126, b: 234 }; // fallback
}

/**
 * Crée un gradient premium basé sur la couleur du mood
 */
function createGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  moodColor: string
): CanvasGradient {
  const { r, g, b } = hexToRgb(moodColor);

  // Gradient diagonal élégant
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, `rgba(15, 23, 42, 1)`); // Slate-900
  gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.15)`);
  gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.08)`);
  gradient.addColorStop(1, `rgba(15, 23, 42, 1)`);

  return gradient;
}

/**
 * Dessine du texte avec word wrap
 */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: CanvasTextAlign = 'center'
): number {
  ctx.textAlign = align;
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);

  return currentY;
}

export default function ShareCardPreview({
  session,
  format,
  onImageReady
}: ShareCardPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);

  const renderCard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = DIMENSIONS[format];
    canvas.width = width;
    canvas.height = height;

    // === FOND AVEC GRADIENT ===
    const gradient = createGradient(ctx, width, height, session.mood.color);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // === OVERLAY SUBTIL ===
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.fillRect(0, 0, width, height);

    // === PARTICULES DÉCORATIVES ===
    const { r, g, b } = hexToRgb(session.mood.color);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
    for (let i = 0; i < 20; i++) {
      const px = Math.random() * width;
      const py = Math.random() * height;
      const size = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // === CARD CENTRALE (GLASSMORPHISM) ===
    const cardPadding = width * 0.08;
    const cardWidth = width - (cardPadding * 2);
    const cardHeight = format === 'story' ? height * 0.5 : height * 0.7;
    const cardY = (height - cardHeight) / 2;

    // Fond de la card
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(cardPadding, cardY, cardWidth, cardHeight, 40);
    ctx.fill();

    // Bordure de la card
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // === ICÔNE MOOD ===
    const iconY = cardY + (format === 'story' ? 120 : 80);
    ctx.font = `${format === 'story' ? 80 : 64}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(session.mood.icon, width / 2, iconY);

    // === CITATION ===
    const quote = extractQuote(session.meditationText);
    const quoteY = iconY + (format === 'story' ? 100 : 70);
    const quoteMaxWidth = cardWidth - 80;

    ctx.font = `italic ${format === 'story' ? 42 : 32}px Georgia, serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';

    const finalQuoteY = drawWrappedText(
      ctx,
      `"${quote}"`,
      width / 2,
      quoteY,
      quoteMaxWidth,
      format === 'story' ? 56 : 44
    );

    // === LIGNE SÉPARATRICE ===
    const separatorY = finalQuoteY + (format === 'story' ? 60 : 40);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 60, separatorY);
    ctx.lineTo(width / 2 + 60, separatorY);
    ctx.stroke();

    // === DÉTAILS DE LA SESSION ===
    const detailsY = separatorY + (format === 'story' ? 50 : 35);
    ctx.font = `600 ${format === 'story' ? 32 : 24}px Inter, -apple-system, sans-serif`;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
    ctx.fillText(session.mood.name, width / 2, detailsY);

    // Durée et guide
    const durationText = session.duration
      ? `${session.duration} min avec ${session.guideType === 'meditation' ? 'Iza' : 'Dann'}`
      : 'Méditation guidée';
    ctx.font = `400 ${format === 'story' ? 26 : 20}px Inter, -apple-system, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(durationText, width / 2, detailsY + (format === 'story' ? 45 : 35));

    // === LOGO / BRANDING ===
    const brandY = cardY + cardHeight - (format === 'story' ? 80 : 60);

    // Texte "Halterra"
    ctx.font = `700 ${format === 'story' ? 36 : 28}px Inter, -apple-system, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('Halterra', width / 2, brandY);

    // Tagline
    ctx.font = `400 ${format === 'story' ? 22 : 18}px Inter, -apple-system, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('Méditations personnalisées par IA', width / 2, brandY + (format === 'story' ? 35 : 28));

    // === EXPORT ===
    setIsRendering(false);

    if (onImageReady) {
      canvas.toBlob((blob) => {
        if (blob) {
          const dataUrl = canvas.toDataURL('image/png');
          onImageReady(blob, dataUrl);
        }
      }, 'image/png', 1.0);
    }
  }, [session, format, onImageReady]);

  useEffect(() => {
    setIsRendering(true);
    renderCard();
  }, [renderCard]);

  const { width, height } = DIMENSIONS[format];
  const previewScale = PREVIEW_SCALES[format];
  const previewWidth = width * previewScale;
  const previewHeight = height * previewScale;

  return (
    <div className="share-card-preview-container">
      <div
        className={`share-card-preview ${isRendering ? 'share-card-preview-loading' : ''}`}
        style={{
          width: previewWidth,
          height: previewHeight,
          aspectRatio: `${width} / ${height}`
        }}
      >
        <canvas
          ref={canvasRef}
          className="share-card-canvas"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
        {isRendering && (
          <div className="share-card-loading">
            <div className="share-card-spinner" />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook pour générer et télécharger une Share Card
 */
export function useShareCardDownload() {
  const downloadCard = useCallback((blob: Blob, filename: string = 'halterra-meditation.png') => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return { downloadCard };
}

/**
 * Hook pour copier la Share Card dans le presse-papiers
 */
export function useShareCardClipboard() {
  const copyToClipboard = useCallback(async (blob: Blob): Promise<boolean> => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      return true;
    } catch {
      console.warn('Clipboard API not supported, falling back to download');
      return false;
    }
  }, []);

  return { copyToClipboard };
}
