import React from 'react';

interface MoodIconProps {
  moodId: string;
  size?: number;
  className?: string;
}

export default function MoodIcon({ moodId, size = 48, className = '' }: MoodIconProps) {
  const icons: Record<string, React.ReactElement> = {
    // Aligné / En flow - Vagues fluides harmonieuses
    aligned: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8 32C8 32 16 20 24 32C32 44 40 20 48 32C56 44 64 32 64 32"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.3"
        />
        <path
          d="M8 24C8 24 16 12 24 24C32 36 40 12 48 24C56 36 64 24 64 24"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
        <path
          d="M8 16C8 16 16 4 24 16C32 28 40 4 48 16C56 28 64 16 64 16"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),

    // Motivé / Inspiré - Flamme montante avec étincelles
    motivated: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M32 8C32 8 20 24 20 36C20 44.8366 25.1634 52 32 52C38.8366 52 44 44.8366 44 36C44 24 32 8 32 8Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.1"
        />
        <path
          d="M32 20C32 20 26 28 26 36C26 40.4183 28.6863 44 32 44C35.3137 44 38 40.4183 38 36C38 28 32 20 32 20Z"
          fill="currentColor"
          fillOpacity="0.3"
        />
        <circle cx="18" cy="20" r="1.5" fill="currentColor" opacity="0.6" />
        <circle cx="46" cy="16" r="1.5" fill="currentColor" opacity="0.6" />
        <circle cx="40" cy="12" r="1" fill="currentColor" opacity="0.4" />
      </svg>
    ),

    // Anxieux / Inquiet - Cercles concentriques perturbés
    anxious: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="32"
          cy="32"
          r="8"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.8"
        />
        <circle
          cx="32"
          cy="32"
          r="16"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.5"
        />
        <circle
          cx="32"
          cy="32"
          r="24"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 6"
          opacity="0.3"
        />
        <path
          d="M28 28L24 24M36 28L40 24M28 36L24 40M36 36L40 40"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
    ),

    // Épuisé / Vidé - Batterie vide avec courbe descendante
    exhausted: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="16"
          y="24"
          width="32"
          height="20"
          rx="3"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="currentColor"
          fillOpacity="0.05"
        />
        <rect x="48" y="30" width="4" height="8" rx="2" fill="currentColor" opacity="0.3" />
        <rect x="20" y="28" width="6" height="12" rx="1" fill="currentColor" opacity="0.15" />
        <path
          d="M12 48C12 48 20 46 28 48C36 50 44 48 52 48"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="3 3"
          opacity="0.3"
        />
      </svg>
    ),

    // Triste / Découragé - Goutte tombante avec ondulations
    sad: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M32 8C32 8 24 20 24 28C24 33.5228 27.5817 38 32 38C36.4183 38 40 33.5228 40 28C40 20 32 8 32 8Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.1"
        />
        <ellipse
          cx="32"
          cy="48"
          rx="12"
          ry="3"
          fill="currentColor"
          opacity="0.15"
        />
        <ellipse
          cx="32"
          cy="50"
          rx="16"
          ry="2"
          fill="currentColor"
          opacity="0.08"
        />
        <ellipse
          cx="32"
          cy="52"
          rx="20"
          ry="1.5"
          fill="currentColor"
          opacity="0.05"
        />
      </svg>
    ),

    // Frustré / En colère - Éclairs anguleux
    frustrated: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M36 8L28 32H36L28 56"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.1"
        />
        <path
          d="M42 16L38 28H42L38 40"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
        <path
          d="M26 20L22 32H26L22 44"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
      </svg>
    ),

    // Perdu / Confus - Boussole avec aiguilles multiples
    lost: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="32"
          cy="32"
          r="20"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.3"
        />
        <circle cx="32" cy="32" r="3" fill="currentColor" opacity="0.5" />
        <path d="M32 12V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        <path d="M32 44V52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        <path d="M12 32H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        <path d="M44 32H52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        <path
          d="M32 32L38 22"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M32 32L42 38"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M32 32L26 40"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
    ),

    // Seul / Isolé - Cercle isolé entouré de vide
    alone: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="32"
          cy="32"
          r="8"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="currentColor"
          fillOpacity="0.1"
        />
        <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.2" />
        <circle cx="52" cy="12" r="2" fill="currentColor" opacity="0.2" />
        <circle cx="12" cy="52" r="2" fill="currentColor" opacity="0.2" />
        <circle cx="52" cy="52" r="2" fill="currentColor" opacity="0.2" />
        <path
          d="M32 14L32 8M32 50L32 56M14 32L8 32M50 32L56 32"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2 4"
          opacity="0.2"
        />
      </svg>
    ),

    // Submergé / Sous pression - Spirale tourbillonnante
    overwhelmed: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M32 32C32 32 34 30 36 32C38 34 36 36 34 36C32 36 30 34 30 32C30 30 32 28 34 28C36 28 38 30 38 32C38 34 36 36 34 36C32 36 28 34 28 32C28 28 32 24 36 24C40 24 44 28 44 32C44 36 40 40 36 40C32 40 26 36 26 32C26 26 32 20 38 20"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M20 20L28 28M44 20L36 28M20 44L28 36M44 44L36 36"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
        />
      </svg>
    ),

    // Calme / Serein - Lotus épanoui zen
    calm: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse
          cx="32"
          cy="40"
          rx="24"
          ry="8"
          fill="currentColor"
          opacity="0.08"
        />
        <path
          d="M32 32C32 32 24 28 20 32C16 36 20 40 24 40C28 40 32 36 32 32Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.1"
        />
        <path
          d="M32 32C32 32 40 28 44 32C48 36 44 40 40 40C36 40 32 36 32 32Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.1"
        />
        <path
          d="M32 32C32 32 28 20 32 16C36 20 32 32 32 32Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.15"
        />
        <circle cx="32" cy="32" r="4" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  };

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icons[moodId] || icons.calm}
    </div>
  );
}
