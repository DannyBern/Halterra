import type { Mood } from '../types';

export const moods: Mood[] = [
  // CATÉGORIE A : ÉTATS D'EXPANSION (Énergie en ouverture/croissance)
  {
    id: 'aligned',
    name: 'Aligné / En flow',
    description: 'En harmonie avec soi-même, énergie fluide',
    icon: '🌊',
    color: '#4ECDC4'
  },
  {
    id: 'motivated',
    name: 'Motivé / Inspiré',
    description: 'Élan vital, désir d\'avancer',
    icon: '🔥',
    color: '#FF6B6B'
  },

  // CATÉGORIE B : ÉTATS DE CONTRACTION (Énergie en défense/retrait)
  {
    id: 'anxious',
    name: 'Anxieux / Inquiet',
    description: 'En alerte, anticipation négative',
    icon: '😰',
    color: '#95A5A6'
  },
  {
    id: 'exhausted',
    name: 'Épuisé / Vidé',
    description: 'Réservoirs vides, besoin de repos',
    icon: '😴',
    color: '#B8C5C9'
  },
  {
    id: 'sad',
    name: 'Triste / Découragé',
    description: 'Perte, chagrin, sentiment de défaite',
    icon: '😢',
    color: '#3498DB'
  },
  {
    id: 'frustrated',
    name: 'Frustré / En colère',
    description: 'Blocage, énergie combative',
    icon: '😤',
    color: '#E74C3C'
  },

  // CATÉGORIE C : ÉTATS D'INCERTITUDE (Entre deux états)
  {
    id: 'lost',
    name: 'Perdu / Confus',
    description: 'Désorientation, perte de repères',
    icon: '🧭',
    color: '#BDC3C7'
  },
  {
    id: 'alone',
    name: 'Seul / Isolé',
    description: 'Manque de connexion',
    icon: '🏝️',
    color: '#34495E'
  },
  {
    id: 'overwhelmed',
    name: 'Submergé / Sous pression',
    description: 'Surcharge, trop de sollicitations',
    icon: '🌀',
    color: '#E67E22'
  },
  {
    id: 'calm',
    name: 'Calme / Serein',
    description: 'Paix intérieure, équanimité',
    icon: '🕊️',
    color: '#27AE60'
  }
];
