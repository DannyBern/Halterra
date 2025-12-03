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
    textColor: '#0a1a1a', // Noir profond pour max contraste
    textOpacity: 1,
    accentColor: '#5a4510', // Or très foncé
    subtleTextColor: 'rgba(10, 26, 26, 0.85)',
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

// Dimensions selon le format
const FORMAT_DIMENSIONS: Record<ShareCardFormat, { width: number; height: number | 'dynamic' }> = {
  square: { width: 1080, height: 'dynamic' },  // Hauteur dynamique selon contenu
  story: { width: 1080, height: 1920 },        // Instagram Story 9:16
  wide: { width: 1200, height: 630 },          // OG image format
};

// Scale pour l'affichage preview selon le format
const PREVIEW_SCALES: Record<ShareCardFormat, number> = {
  square: 0.22,
  story: 0.16,  // Plus petit car plus haut
  wide: 0.28,
};

// Mapping des catégories vers leurs icônes
const CATEGORY_ICONS: Record<string, string> = {
  'sante-corps': 'Santé & Corps icon.webp',
  'changement-habitudes': 'Changement & Habitudes icon.webp',
  'eveil-preparation': 'Éveil & Préparation icon.webp',
  'attention-cognition': 'Attention & Cognition icon.webp',
  'performance-action': 'Performance & Action icon.webp',
  'regulation-resilience': 'Régulation & Résilience icon.webp',
  'flexibilite-psychologique': 'Flexibilité Psychologique icon.webp',
  'relations-connexion': 'Relations & Connexion icon.webp',
  'bien-etre-etats-positifs': 'Bien-être & États Positifs icon.webp',
  'soi-developpement': 'Soi & Développement icon.webp',
  'autonomie-valeurs': 'Autonomie & Valeurs.webp',
  'spiritualite-transcendance': 'Spiritualité & Transcendance icon.webp',
  'detente-sommeil': 'Détente & Sommeil icon.webp',
  'intention-libre': 'Intention Libre icon.webp',
};

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
  const [dimensions, setDimensions] = useState({ width: FORMAT_DIMENSIONS[format].width, height: format === 'story' ? 1920 : 1400 });

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

    const formatConfig = FORMAT_DIMENSIONS[format];
    const width = formatConfig.width;
    const isStoryFormat = format === 'story';
    const padding = isStoryFormat ? 80 : 120;
    const contentWidth = width - (padding * 2);

    // === CONFIGURATION TYPOGRAPHIQUE - ADAPTÉE AU FORMAT ===
    const fontSize = isStoryFormat ? 30 : 34;
    const lineHeight = isStoryFormat ? 52 : 60;
    const paragraphSpacing = isStoryFormat ? 70 : 90;

    // === PARSER LE TEXTE EN PARAGRAPHES ===
    const meditationText = session.meditationText || '';
    let paragraphs = parseMeditationText(meditationText);

    // === MESURER LA HAUTEUR NÉCESSAIRE ===
    ctx.font = `400 ${fontSize}px Georgia, 'Times New Roman', serif`;
    let totalTextHeight = measureTotalTextHeight(
      ctx,
      paragraphs,
      contentWidth,
      lineHeight,
      paragraphSpacing
    );

    // === CALCULER LA HAUTEUR FINALE ===
    let height: number;
    const headerHeight = isStoryFormat ? 320 : 260;
    const footerHeight = isStoryFormat ? 200 : 220;

    if (formatConfig.height === 'dynamic') {
      // Format carré: hauteur dynamique selon le contenu
      height = Math.max(1400, headerHeight + totalTextHeight + footerHeight + 180);
    } else {
      // Format story: hauteur fixe 1920px
      height = formatConfig.height;

      // Pour le format story, on doit peut-être tronquer le texte si trop long
      const maxTextHeight = height - headerHeight - footerHeight - 180;
      if (totalTextHeight > maxTextHeight) {
        // Tronquer le texte pour qu'il rentre dans la story
        const maxParagraphs = Math.max(3, Math.floor(paragraphs.length * (maxTextHeight / totalTextHeight)));
        paragraphs = paragraphs.slice(0, maxParagraphs);
        // Ajouter une ellipse au dernier paragraphe
        if (paragraphs.length > 0) {
          paragraphs[paragraphs.length - 1] = paragraphs[paragraphs.length - 1].replace(/[.!?]?\s*$/, '...');
        }
        // Recalculer
        totalTextHeight = measureTotalTextHeight(ctx, paragraphs, contentWidth, lineHeight, paragraphSpacing);
      }
    }

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
    // Pour le format story, centrer verticalement le contenu
    let currentY: number;
    if (isStoryFormat) {
      // Calculer la position de départ pour centrer le contenu
      const totalContentHeight = headerHeight + totalTextHeight + 100; // header + text + spacing
      currentY = Math.max(120, (height - totalContentHeight - footerHeight) / 2);
    } else {
      currentY = 100;
    }

    // Icône de la catégorie (image .webp) - sans transparence pour être bien visible
    const categoryIconFile = session.category ? CATEGORY_ICONS[session.category] : null;
    if (categoryIconFile) {
      try {
        const iconUrl = `/${categoryIconFile}`;
        const iconImg = await loadImage(iconUrl);
        // Taille de l'icône: 100x100 pixels, centrée
        const iconSize = 100;
        const iconX = (width - iconSize) / 2;
        const iconY = currentY;
        ctx.drawImage(iconImg, iconX, iconY, iconSize, iconSize);
        currentY += iconSize + 25;
      } catch {
        // Fallback: utiliser l'emoji du mood si l'icône ne charge pas
        ctx.font = '64px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(session.mood.icon, width / 2, currentY + 50);
        currentY += 115;
      }
    } else {
      // Pas de catégorie: utiliser l'emoji du mood
      ctx.font = '64px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(session.mood.icon, width / 2, currentY + 50);
      currentY += 115;
    }

    // Titre simple: "Un moment pour moi"
    // Font-weight aligné avec le texte de méditation pour cohérence
    const headerWeight = templateConfig.isDark ? 500 : 600;
    ctx.font = `${headerWeight} 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    // Couleur avec opacité similaire au texte principal
    const textRgbHeader = hexToRgb(templateConfig.textColor);
    const headerOpacity = templateConfig.isDark ? 0.85 : 0.9;
    ctx.fillStyle = `rgba(${textRgbHeader.r}, ${textRgbHeader.g}, ${textRgbHeader.b}, ${headerOpacity})`;
    ctx.textAlign = 'center';
    ctx.fillText('Un moment pour moi', width / 2, currentY);
    currentY += 50;

    // Mood formaté - plus grand et plus présent
    const moodFormatted = formatMoodName(session.mood.name);
    ctx.font = `italic ${headerWeight} 38px Georgia, 'Times New Roman', serif`;
    ctx.fillStyle = accentColor;
    ctx.fillText(moodFormatted, width / 2, currentY);
    currentY += 60;

    // Intention entre guillemets (si présente)
    if (session.intention && session.intention.trim().length > 0) {
      ctx.font = `italic ${headerWeight} 30px Georgia, 'Times New Roman', serif`;
      const intentionOpacity = templateConfig.isDark ? 0.8 : 0.85;
      ctx.fillStyle = `rgba(${textRgbHeader.r}, ${textRgbHeader.g}, ${textRgbHeader.b}, ${intentionOpacity})`;

      const intentionText = `« ${session.intention.trim()} »`;
      currentY = drawCenteredWrappedText(
        ctx,
        intentionText,
        width / 2,
        currentY,
        contentWidth - 80,
        44
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
    // Font-weight plus gras pour plus de présence
    const fontWeight = templateConfig.isDark ? 500 : 600;
    ctx.font = `${fontWeight} ${fontSize}px Georgia, 'Times New Roman', serif`;
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

  const previewScale = PREVIEW_SCALES[format];
  const previewWidth = dimensions.width * previewScale;
  const previewHeight = dimensions.height * previewScale;

  // Hauteur max du preview selon le format
  const maxPreviewHeight = format === 'story' ? 320 : 350;

  return (
    <div className="share-card-preview-container">
      <div
        className={`share-card-preview ${isRendering ? 'share-card-preview-loading' : ''}`}
        style={{
          width: previewWidth,
          height: Math.min(previewHeight, maxPreviewHeight),
          overflow: 'hidden',
          borderRadius: format === 'story' ? '12px' : '16px',
        }}
      >
        <canvas
          ref={canvasRef}
          className="share-card-canvas"
          style={{
            width: previewWidth,
            height: previewHeight,
            transform: previewHeight > maxPreviewHeight ? 'translateY(0)' : 'none',
          }}
        />
        {isRendering && (
          <div className="share-card-loading">
            <div className="share-card-spinner" />
          </div>
        )}
      </div>
      {previewHeight > maxPreviewHeight && (
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
