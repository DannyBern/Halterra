/**
 * ShareCardPreview - Génération d'images de partage ULTRA PREMIUM
 * Design minimaliste et élégant inspiré des apps de luxe
 * Préserve exactement la structure des paragraphes de la méditation
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

// Largeur fixe, hauteur dynamique selon le contenu
const BASE_WIDTH = 1080;

// Scale pour l'affichage preview
const PREVIEW_SCALE = 0.22;

/**
 * Parse une couleur hex en RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 102, g: 126, b: 234 };
}

/**
 * Calcule la hauteur nécessaire pour un paragraphe
 */
function measureParagraphHeight(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ').filter(w => w.length > 0);
  if (words.length === 0) return 0;

  let line = '';
  let lines = 1;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && n > 0) {
      line = words[n] + ' ';
      lines++;
    } else {
      line = testLine;
    }
  }

  return lines * lineHeight;
}

/**
 * Dessine un paragraphe avec word wrap
 */
function drawParagraph(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ').filter(w => w.length > 0);
  if (words.length === 0) return y;

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

/**
 * Parse le texte de méditation en préservant la structure exacte des paragraphes
 */
function parseMeditationText(text: string): string[] {
  // Séparer par double newline (paragraphes)
  return text
    .split(/\n\n+/)
    .map(p => p.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(p => p.length > 0);
}

/**
 * Calcule la hauteur totale nécessaire pour tous les paragraphes
 */
function measureTotalTextHeight(
  ctx: CanvasRenderingContext2D,
  paragraphs: string[],
  maxWidth: number,
  lineHeight: number,
  paragraphSpacing: number
): number {
  let totalHeight = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    totalHeight += measureParagraphHeight(ctx, paragraphs[i], maxWidth, lineHeight);
    if (i < paragraphs.length - 1) {
      totalHeight += paragraphSpacing;
    }
  }

  return totalHeight;
}

/**
 * Dessine tous les paragraphes avec espacement
 */
function drawAllParagraphs(
  ctx: CanvasRenderingContext2D,
  paragraphs: string[],
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  paragraphSpacing: number
): number {
  let currentY = startY;

  for (let i = 0; i < paragraphs.length; i++) {
    currentY = drawParagraph(ctx, paragraphs[i], x, currentY, maxWidth, lineHeight);
    if (i < paragraphs.length - 1) {
      currentY += paragraphSpacing;
    }
  }

  return currentY;
}

export default function ShareCardPreview({
  session,
  format,
  onImageReady
}: ShareCardPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [dimensions, setDimensions] = useState({ width: BASE_WIDTH, height: 1400 });

  const renderCard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setIsRendering(false);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsRendering(false);
      return;
    }

    const width = BASE_WIDTH;
    const padding = 120; // Plus de marge latérale
    const contentWidth = width - (padding * 2);

    // === CONFIGURATION TYPOGRAPHIQUE - AÉRÉ ===
    const headerHeight = 260;
    const fontSize = 32; // Légèrement plus petit pour plus de lignes courtes
    const lineHeight = 58; // Plus d'espace entre lignes
    const paragraphSpacing = 90; // Encore plus d'espace entre paragraphes
    const footerHeight = 220;

    // === PARSER LE TEXTE EN PARAGRAPHES ===
    const meditationText = session.meditationText || '';
    const paragraphs = parseMeditationText(meditationText);

    // === MESURER LA HAUTEUR NÉCESSAIRE ===
    ctx.font = `400 ${fontSize}px Georgia, 'Times New Roman', serif`;
    const totalTextHeight = measureTotalTextHeight(
      ctx,
      paragraphs,
      contentWidth,
      lineHeight,
      paragraphSpacing
    );

    // Hauteur totale avec marges très généreuses
    const height = Math.max(1400, headerHeight + totalTextHeight + footerHeight + 180);

    canvas.width = width;
    canvas.height = height;
    setDimensions({ width, height });

    // === COULEURS DU MOOD ===
    const { r, g, b } = hexToRgb(session.mood.color);

    // === FOND NOIR PROFOND PREMIUM ===
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // === GRADIENT SUBTIL EN HAUT ===
    const topGlow = ctx.createRadialGradient(
      width / 2, 0, 0,
      width / 2, 0, height * 0.6
    );
    topGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.08)`);
    topGlow.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.02)`);
    topGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, width, height);

    // === BORDURE FINE PREMIUM ===
    const borderPadding = 24;
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.2)`;
    ctx.lineWidth = 1;
    ctx.strokeRect(borderPadding, borderPadding, width - borderPadding * 2, height - borderPadding * 2);

    // === HEADER ===
    let currentY = 100; // Plus d'espace en haut

    // Icône du mood avec glow subtil
    ctx.save();
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.4)`;
    ctx.shadowBlur = 30;
    ctx.font = '56px Arial'; // Légèrement plus petit
    ctx.textAlign = 'center';
    ctx.fillText(session.mood.icon, width / 2, currentY + 45);
    ctx.restore();
    currentY += 100; // Plus d'espace après l'emoji

    // Nom du mood - typographie élégante
    ctx.font = `300 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '4px';
    ctx.fillText(session.mood.name.toUpperCase(), width / 2, currentY + 30);
    currentY += 80; // Plus d'espace après le titre

    // Petite ligne décorative
    const lineWidth = 50;
    ctx.beginPath();
    ctx.moveTo((width - lineWidth) / 2, currentY);
    ctx.lineTo((width + lineWidth) / 2, currentY);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
    ctx.lineWidth = 1;
    ctx.stroke();
    currentY += 70; // Plus d'espace avant le texte

    // === TEXTE DE LA MÉDITATION ===
    ctx.font = `400 ${fontSize}px Georgia, 'Times New Roman', serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.textAlign = 'left';

    currentY = drawAllParagraphs(
      ctx,
      paragraphs,
      padding,
      currentY,
      contentWidth,
      lineHeight,
      paragraphSpacing
    );

    // === FOOTER MINIMALISTE ===
    currentY += 100; // Beaucoup plus d'espace avant le footer

    // Ligne fine
    ctx.beginPath();
    ctx.moveTo(width * 0.35, currentY);
    ctx.lineTo(width * 0.65, currentY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();
    currentY += 50;

    // Logo Halterra Lite - élégant
    ctx.font = `200 38px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.textAlign = 'center';
    ctx.fillText('HALTERRA LITE', width / 2, currentY + 25);
    currentY += 50;

    // Tagline subtile
    ctx.font = `300 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillText('Méditations personnalisées par IA', width / 2, currentY + 10);

    // Company name en bas
    ctx.font = `400 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
    ctx.fillText('Acolyte Solutions Inc', width / 2, height - 50);

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

  const previewWidth = dimensions.width * PREVIEW_SCALE;
  const previewHeight = dimensions.height * PREVIEW_SCALE;

  return (
    <div className="share-card-preview-container">
      <div
        className={`share-card-preview ${isRendering ? 'share-card-preview-loading' : ''}`}
        style={{
          width: previewWidth,
          height: Math.min(previewHeight, 350), // Limiter la hauteur du preview
          overflow: 'hidden',
          borderRadius: '16px',
        }}
      >
        <canvas
          ref={canvasRef}
          className="share-card-canvas"
          style={{
            width: previewWidth,
            height: previewHeight,
            transform: previewHeight > 350 ? 'translateY(0)' : 'none',
          }}
        />
        {isRendering && (
          <div className="share-card-loading">
            <div className="share-card-spinner" />
          </div>
        )}
      </div>
      {previewHeight > 350 && (
        <p className="share-card-scroll-hint">
          La carte complète sera partagée
        </p>
      )}
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
