/**
 * ShareCardPreview - Génération d'images de partage premium
 * Affiche la méditation COMPLÈTE avec un design zen et professionnel
 * La hauteur s'adapte dynamiquement au contenu
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
 * Calcule la hauteur nécessaire pour le texte
 */
function measureTextHeight(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
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
 * Dessine du texte avec word wrap - aligné à gauche pour lisibilité
 */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: CanvasTextAlign = 'left'
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

/**
 * Dessine des paragraphes séparés
 */
function drawParagraphs(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  paragraphSpacing: number
): number {
  // Diviser en paragraphes (double newline ou phrases longues)
  const paragraphs = text
    .split(/\n\n+/)
    .flatMap(p => {
      // Si un paragraphe est très long, le diviser en sous-paragraphes
      const cleaned = p.replace(/\s+/g, ' ').trim();
      if (cleaned.length > 400) {
        // Diviser aux points de respiration naturels
        const sentences = cleaned.split(/(?<=[.!?])\s+/);
        const chunks: string[] = [];
        let current = '';
        for (const sentence of sentences) {
          if ((current + ' ' + sentence).length > 350 && current) {
            chunks.push(current.trim());
            current = sentence;
          } else {
            current = current ? current + ' ' + sentence : sentence;
          }
        }
        if (current) chunks.push(current.trim());
        return chunks;
      }
      return [cleaned];
    })
    .filter(p => p.length > 0);

  let currentY = startY;

  for (let i = 0; i < paragraphs.length; i++) {
    currentY = drawWrappedText(ctx, paragraphs[i], x, currentY, maxWidth, lineHeight, 'left');
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
    const padding = 80;
    const contentWidth = width - (padding * 2);

    // === CONFIGURATION TYPOGRAPHIQUE ===
    const headerHeight = 280;
    const fontSize = 36;
    const lineHeight = 56;
    const paragraphSpacing = 40;
    const footerHeight = 200;

    // === MESURER LA HAUTEUR NÉCESSAIRE ===
    ctx.font = `400 ${fontSize}px Georgia, 'Times New Roman', serif`;

    // Calculer la hauteur du texte
    const meditationText = session.meditationText || '';
    const paragraphs = meditationText
      .split(/\n\n+/)
      .flatMap(p => {
        const cleaned = p.replace(/\s+/g, ' ').trim();
        if (cleaned.length > 400) {
          const sentences = cleaned.split(/(?<=[.!?])\s+/);
          const chunks: string[] = [];
          let current = '';
          for (const sentence of sentences) {
            if ((current + ' ' + sentence).length > 350 && current) {
              chunks.push(current.trim());
              current = sentence;
            } else {
              current = current ? current + ' ' + sentence : sentence;
            }
          }
          if (current) chunks.push(current.trim());
          return chunks;
        }
        return [cleaned];
      })
      .filter(p => p.length > 0);

    let totalTextHeight = 0;
    for (let i = 0; i < paragraphs.length; i++) {
      totalTextHeight += measureTextHeight(ctx, paragraphs[i], contentWidth, lineHeight);
      if (i < paragraphs.length - 1) {
        totalTextHeight += paragraphSpacing;
      }
    }

    // Hauteur totale avec marges
    const height = Math.max(1200, headerHeight + totalTextHeight + footerHeight + 100);

    canvas.width = width;
    canvas.height = height;
    setDimensions({ width, height });

    // === COULEURS DU MOOD ===
    const { r, g, b } = hexToRgb(session.mood.color);

    // === FOND GRADIENT PREMIUM ===
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0f172a');      // Slate 900
    bgGradient.addColorStop(0.3, '#1e293b');    // Slate 800
    bgGradient.addColorStop(0.7, '#0f172a');    // Slate 900
    bgGradient.addColorStop(1, '#020617');      // Slate 950
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // === OVERLAY COLORÉ SUBTIL ===
    const colorOverlay = ctx.createRadialGradient(
      width / 2, height * 0.3, 0,
      width / 2, height * 0.3, width
    );
    colorOverlay.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.15)`);
    colorOverlay.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.05)`);
    colorOverlay.addColorStop(1, 'transparent');
    ctx.fillStyle = colorOverlay;
    ctx.fillRect(0, 0, width, height);

    // === ÉLÉMENTS DÉCORATIFS ZEN ===
    // Cercle zen en haut à droite
    ctx.beginPath();
    ctx.arc(width - 100, 150, 200, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.1)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Cercle zen en bas à gauche
    ctx.beginPath();
    ctx.arc(100, height - 150, 150, 0, Math.PI * 2);
    ctx.stroke();

    // Ligne verticale décorative gauche
    ctx.beginPath();
    ctx.moveTo(40, headerHeight);
    ctx.lineTo(40, height - footerHeight);
    const lineGradient = ctx.createLinearGradient(0, headerHeight, 0, height - footerHeight);
    lineGradient.addColorStop(0, 'transparent');
    lineGradient.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, 0.3)`);
    lineGradient.addColorStop(0.8, `rgba(${r}, ${g}, ${b}, 0.3)`);
    lineGradient.addColorStop(1, 'transparent');
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2;
    ctx.stroke();

    // === HEADER ===
    let currentY = 80;

    // Icône du mood
    ctx.font = '72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(session.mood.icon, width / 2, currentY + 60);
    currentY += 100;

    // Nom du mood
    ctx.font = `600 42px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
    ctx.fillText(session.mood.name, width / 2, currentY + 50);
    currentY += 70;

    // Ligne séparatrice élégante
    const separatorWidth = 120;
    ctx.beginPath();
    ctx.moveTo((width - separatorWidth) / 2, currentY + 20);
    ctx.lineTo((width + separatorWidth) / 2, currentY + 20);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    currentY += 60;

    // === TEXTE DE LA MÉDITATION ===
    ctx.font = `400 ${fontSize}px Georgia, 'Times New Roman', serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.textAlign = 'left';

    currentY = drawParagraphs(
      ctx,
      meditationText,
      padding,
      currentY,
      contentWidth,
      lineHeight,
      paragraphSpacing
    );

    // === FOOTER ===
    currentY += 60;

    // Ligne séparatrice
    ctx.beginPath();
    ctx.moveTo(padding, currentY);
    ctx.lineTo(width - padding, currentY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
    currentY += 50;

    // Infos de session
    if (session.duration) {
      ctx.font = `400 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'center';
      const guideText = `${session.duration} minutes avec ${session.guideType === 'meditation' ? 'Iza' : 'Dann'}`;
      ctx.fillText(guideText, width / 2, currentY + 10);
      currentY += 40;
    }

    // Logo Halterra
    ctx.font = `700 48px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.textAlign = 'center';
    ctx.fillText('Halterra', width / 2, currentY + 40);
    currentY += 50;

    // Tagline
    ctx.font = `400 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('Méditations personnalisées par IA', width / 2, currentY + 20);

    // URL en bas
    ctx.font = `500 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.7)`;
    ctx.fillText('halterra.vercel.app', width / 2, height - 40);

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
