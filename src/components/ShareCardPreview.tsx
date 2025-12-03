/**
 * ShareCardPreview - Génération d'images de partage ULTRA PREMIUM
 * Design minimaliste et élégant inspiré des apps de luxe
 * Préserve exactement la structure des paragraphes de la méditation
 * Supporte 5 templates visuels différents
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ShareableSession } from '../types/share';
import './ShareCardPreview.css';

export type ShareCardFormat = 'story' | 'square' | 'wide';
export type ShareCardTemplate = 'dark' | 'turquoise' | 'midnight' | 'peach' | 'cloud';

// Configuration des templates
export const TEMPLATES: Record<ShareCardTemplate, {
  name: string;
  background: string | null; // null = couleur unie
  bgColor: string;
  textColor: string;
  textOpacity: number;
  accentColor: string;
  subtleTextColor: string;
  isDark: boolean;
}> = {
  dark: {
    name: 'Noir',
    background: null,
    bgColor: '#0a0a0a',
    textColor: '#ffffff',
    textOpacity: 0.88,
    accentColor: 'mood', // Utilise la couleur du mood
    subtleTextColor: 'rgba(255, 255, 255, 0.55)',
    isDark: true,
  },
  turquoise: {
    name: 'Turquoise',
    background: '/backgrounds/bg-turquoise.jpeg',
    bgColor: '#3d9ca8',
    textColor: '#1a3a3a', // Bleu-vert foncé pour contraste sur zones claires
    textOpacity: 0.92,
    accentColor: '#8b6914', // Or foncé
    subtleTextColor: 'rgba(26, 58, 58, 0.7)',
    isDark: false,
  },
  midnight: {
    name: 'Minuit',
    background: '/backgrounds/bg-midnight.jpeg',
    bgColor: '#1a2030',
    textColor: '#ffffff',
    textOpacity: 0.95,
    accentColor: '#d4a853', // Or
    subtleTextColor: 'rgba(255, 255, 255, 0.7)',
    isDark: true,
  },
  peach: {
    name: 'Pêche',
    background: '/backgrounds/bg-peach.jpeg',
    bgColor: '#e8d5c4',
    textColor: '#2d2419', // Brun foncé
    textOpacity: 0.9,
    accentColor: '#8b5a2b', // Brun doré
    subtleTextColor: 'rgba(45, 36, 25, 0.6)',
    isDark: false,
  },
  cloud: {
    name: 'Nuage',
    background: '/backgrounds/bg-cloud.jpeg',
    bgColor: '#d0d0d0',
    textColor: '#1a1a1a', // Gris anthracite
    textOpacity: 0.9,
    accentColor: '#4a4a4a', // Gris foncé
    subtleTextColor: 'rgba(26, 26, 26, 0.55)',
    isDark: false,
  },
};

interface ShareCardPreviewProps {
  session: ShareableSession;
  format: ShareCardFormat;
  template?: ShareCardTemplate;
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
 * Formate le nom du mood de manière élégante
 */
function formatMoodName(moodName: string): string {
  return moodName
    .toLowerCase()
    .replace(/\s*\/\s*/g, ' et ')
    .replace(/\s*-\s*/g, ' et ');
}

/**
 * Dessine du texte centré avec word wrap pour le header
 */
function drawCenteredWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ').filter(w => w.length > 0);
  if (words.length === 0) return y;

  let line = '';
  let currentY = y;
  const lines: string[] = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  // Dessiner chaque ligne centrée
  for (const l of lines) {
    ctx.fillText(l, centerX, currentY);
    currentY += lineHeight;
  }

  return currentY - lineHeight; // Retourner la position de la dernière ligne
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

/**
 * Charge une image depuis une URL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function ShareCardPreview({
  session,
  format,
  template = 'dark',
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

    // === CONFIGURATION DU TEMPLATE ===
    const templateConfig = TEMPLATES[template];
    const { r: moodR, g: moodG, b: moodB } = hexToRgb(session.mood.color);

    // Couleur d'accent: soit la couleur du mood, soit celle du template
    const accentColor = templateConfig.accentColor === 'mood'
      ? `rgba(${moodR}, ${moodG}, ${moodB}, 0.9)`
      : templateConfig.accentColor;

    const width = BASE_WIDTH;
    const padding = 120;
    const contentWidth = width - (padding * 2);

    // === CONFIGURATION TYPOGRAPHIQUE - AÉRÉ ===
    const headerHeight = 260;
    const fontSize = 32;
    const lineHeight = 58;
    const paragraphSpacing = 90;
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

    // === FOND DU TEMPLATE ===
    // D'abord remplir avec la couleur de base
    ctx.fillStyle = templateConfig.bgColor;
    ctx.fillRect(0, 0, width, height);

    // Charger et dessiner l'image de fond si présente
    if (templateConfig.background) {
      try {
        const bgImage = await loadImage(templateConfig.background);
        // Dessiner l'image en couvrant tout le canvas (cover)
        const scale = Math.max(width / bgImage.width, height / bgImage.height);
        const scaledWidth = bgImage.width * scale;
        const scaledHeight = bgImage.height * scale;
        const x = (width - scaledWidth) / 2;
        const y = (height - scaledHeight) / 2;
        ctx.drawImage(bgImage, x, y, scaledWidth, scaledHeight);

        // Overlay semi-transparent pour améliorer la lisibilité
        ctx.fillStyle = templateConfig.isDark
          ? 'rgba(0, 0, 0, 0.3)'
          : 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(0, 0, width, height);
      } catch {
        // Si l'image ne charge pas, on garde la couleur de base
        console.warn('Could not load background image');
      }
    } else {
      // Template dark: ajouter le glow subtil
      const topGlow = ctx.createRadialGradient(
        width / 2, 0, 0,
        width / 2, 0, height * 0.6
      );
      topGlow.addColorStop(0, `rgba(${moodR}, ${moodG}, ${moodB}, 0.08)`);
      topGlow.addColorStop(0.5, `rgba(${moodR}, ${moodG}, ${moodB}, 0.02)`);
      topGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, width, height);
    }

    // === BORDURE FINE (seulement pour template dark) ===
    if (template === 'dark') {
      const borderPadding = 24;
      ctx.strokeStyle = `rgba(${moodR}, ${moodG}, ${moodB}, 0.2)`;
      ctx.lineWidth = 1;
      ctx.strokeRect(borderPadding, borderPadding, width - borderPadding * 2, height - borderPadding * 2);
    }

    // === HEADER ===
    let currentY = 100;

    // Icône du mood avec glow subtil
    ctx.save();
    if (templateConfig.isDark) {
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 30;
    }
    ctx.font = '56px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(session.mood.icon, width / 2, currentY + 45);
    ctx.restore();
    currentY += 105;

    // Titre simple: "Un moment pour moi"
    ctx.font = `300 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.fillStyle = templateConfig.subtleTextColor;
    ctx.textAlign = 'center';
    ctx.fillText('Un moment pour moi', width / 2, currentY);
    currentY += 45;

    // Mood formaté
    const moodFormatted = formatMoodName(session.mood.name);
    ctx.font = `italic 300 30px Georgia, 'Times New Roman', serif`;
    ctx.fillStyle = accentColor;
    ctx.fillText(moodFormatted, width / 2, currentY);
    currentY += 55;

    // Intention entre guillemets (si présente)
    if (session.intention && session.intention.trim().length > 0) {
      ctx.font = `italic 300 24px Georgia, 'Times New Roman', serif`;
      ctx.fillStyle = templateConfig.subtleTextColor;

      const intentionText = `« ${session.intention.trim()} »`;
      currentY = drawCenteredWrappedText(
        ctx,
        intentionText,
        width / 2,
        currentY,
        contentWidth - 80,
        38
      );
      currentY += 50;
    } else {
      currentY += 20;
    }

    // Petite ligne décorative
    const decorLineWidth = 50;
    ctx.beginPath();
    ctx.moveTo((width - decorLineWidth) / 2, currentY);
    ctx.lineTo((width + decorLineWidth) / 2, currentY);
    ctx.strokeStyle = templateConfig.isDark
      ? `rgba(${moodR}, ${moodG}, ${moodB}, 0.25)`
      : `${templateConfig.textColor}22`;
    ctx.lineWidth = 1;
    ctx.stroke();
    currentY += 70;

    // === TEXTE DE LA MÉDITATION ===
    ctx.font = `400 ${fontSize}px Georgia, 'Times New Roman', serif`;
    const textRgb = hexToRgb(templateConfig.textColor);
    ctx.fillStyle = `rgba(${textRgb.r}, ${textRgb.g}, ${textRgb.b}, ${templateConfig.textOpacity})`;
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
    currentY += 100;

    // Ligne fine
    ctx.beginPath();
    ctx.moveTo(width * 0.35, currentY);
    ctx.lineTo(width * 0.65, currentY);
    ctx.strokeStyle = templateConfig.isDark
      ? 'rgba(255, 255, 255, 0.06)'
      : 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
    currentY += 50;

    // Logo Halterra Lite - élégant
    ctx.font = `200 38px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.fillStyle = templateConfig.isDark
      ? 'rgba(255, 255, 255, 0.85)'
      : `rgba(${textRgb.r}, ${textRgb.g}, ${textRgb.b}, 0.85)`;
    ctx.textAlign = 'center';
    ctx.fillText('HALTERRA LITE', width / 2, currentY + 25);
    currentY += 50;

    // Tagline subtile
    ctx.font = `300 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.fillStyle = templateConfig.isDark
      ? 'rgba(255, 255, 255, 0.3)'
      : `rgba(${textRgb.r}, ${textRgb.g}, ${textRgb.b}, 0.4)`;
    ctx.fillText('Méditations personnalisées par IA', width / 2, currentY + 10);

    // Company name en bas
    ctx.font = `400 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    const accentRgb = templateConfig.accentColor === 'mood'
      ? { r: moodR, g: moodG, b: moodB }
      : hexToRgb(templateConfig.accentColor);
    ctx.fillStyle = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.5)`;
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
  }, [session, format, template, onImageReady]);

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
