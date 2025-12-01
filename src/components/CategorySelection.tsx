import React, { useState } from 'react';
import type { Mood } from '../types';
import { getMoodBackgroundUrl } from '../constants/moodImages';
import FixedBackground from './FixedBackground';
import StickyHeader from './StickyHeader';
import './CategorySelection.css';

interface Category {
  id: string;
  name: string;
  icon: string;
  intentions: string[];
}

interface CategorySelectionProps {
  guideType: 'meditation' | 'reflection';
  mood: Mood;
  onSelectIntention: (category: string, intention: string) => void;
  onCustomIntention: () => void;
  onBack: () => void;
  onHistory: () => void;
}

const categories: Category[] = [
  {
    id: 'sante-corps',
    name: 'Santé & Corps',
    icon: 'Santé & Corps icon.jpeg',
    intentions: [
      'Gérer la douleur chronique',
      'Améliorer la santé physique générale',
      'Soutenir la récupération ou la gestion de maladie'
    ]
  },
  {
    id: 'changement-habitudes',
    name: 'Changement & Habitudes',
    icon: 'Changement & Habitudes icon.jpeg',
    intentions: [
      'Briser les habitudes néfastes et les dépendances',
      'Développer des comportements sains et activés'
    ]
  },
  {
    id: 'eveil-preparation',
    name: 'Éveil & Préparation',
    icon: 'Éveil & Préparation icon.jpeg',
    intentions: [
      'Se préparer mentalement',
      'Cultiver la conscience du moment présent',
      'Définir ses intentions pour la journée',
      'Développer l\'énergie mentale',
      'Activer la présence et la conscience corporelle'
    ]
  },
  {
    id: 'attention-cognition',
    name: 'Attention & Cognition',
    icon: 'Attention & Cognition icon.jpeg',
    intentions: [
      'Améliorer la concentration et le focus',
      'Développer l\'attention soutenue et la présence',
      'Réduire la distraction et le vagabondage mental',
      'Améliorer la mémoire et les fonctions exécutives',
      'Développer la conscience métacognitive',
      'Renforcer les fonctions exécutives',
      'Améliorer la capacité de mémoire de travail',
      'Développer la flexibilité cognitive'
    ]
  },
  {
    id: 'performance-action',
    name: 'Performance & Action',
    icon: 'Performance & Action icon.jpeg',
    intentions: [
      'Augmenter la productivité et la performance au travail',
      'Développer la créativité et l\'innovation',
      'Améliorer les compétences en résolution de problèmes',
      'Renforcer l\'agentivité personnelle',
      'Développer le sentiment de contrôle',
      'Pratiquer l\'activation comportementale',
      'Développer l\'action engagée vers ses valeurs'
    ]
  },
  {
    id: 'regulation-resilience',
    name: 'Régulation & Résilience',
    icon: 'Régulation & Résilience icon.jpeg',
    intentions: [
      'Réduire le stress et l\'anxiété',
      'Gérer l\'anxiété et les pensées anxieuses',
      'Gérer le stress professionnel et l\'épuisement',
      'Réguler les émotions et développer l\'équanimité',
      'Gérer les transitions et moments difficiles',
      'Gérer les moments de crise ou d\'anxiété aiguë',
      'Développer l\'intelligence émotionnelle',
      'Développer des stratégies d\'adaptation'
    ]
  },
  {
    id: 'flexibilite-psychologique',
    name: 'Flexibilité Psychologique',
    icon: 'Flexibilité Psychologique icon.jpeg',
    intentions: [
      'Cultiver l\'acceptation et la tolérance à la détresse',
      'Développer la flexibilité psychologique',
      'Pratiquer la décentration',
      'Réduire la rumination et les pensées répétitives',
      'Réduire l\'évitement expérientiel',
      'Cultiver la disposition à l\'ouverture',
      'Améliorer l\'autorégulation'
    ]
  },
  {
    id: 'relations-connexion',
    name: 'Relations & Connexion',
    icon: 'Relations & Connexion icon.jpeg',
    intentions: [
      'Améliorer les relations et la communication',
      'Cultiver la compassion et la bienveillance',
      'Gérer les conflits et conversations difficiles',
      'Développer l\'empathie',
      'Satisfaire le besoin d\'appartenance',
      'Cultiver l\'intelligence sociale'
    ]
  },
  {
    id: 'bien-etre-etats-positifs',
    name: 'Bien-être & États Positifs',
    icon: 'Bien-être & États Positifs icon.jpeg',
    intentions: [
      'Augmenter le bonheur et les émotions positives',
      'Cultiver la gratitude et l\'appréciation',
      'Développer la patience et l\'équanimité',
      'Se détendre et décompresser',
      'Développer l\'épanouissement'
    ]
  },
  {
    id: 'soi-developpement',
    name: 'Soi & Développement',
    icon: 'Soi & Développement icon.jpeg',
    intentions: [
      'Développer la connaissance et l\'acceptation de soi',
      'Développer l\'auto-compassion et réduire l\'autocritique',
      'Cultiver la compréhension de soi',
      'Renforcer la compétence et le sentiment d\'efficacité',
      'Développer la conscience de soi',
      'Réduire la dissonance de soi',
      'Développer les forces de caractère',
      'Atteindre la croissance personnelle continue',
      'Progresser vers l\'actualisation de soi',
      'Atteindre la maturité psychologique'
    ]
  },
  {
    id: 'autonomie-valeurs',
    name: 'Autonomie & Valeurs',
    icon: 'Autonomie & Valeurs.jpeg',
    intentions: [
      'Trouver le sens et le but de sa vie',
      'Clarifier ses valeurs personnelles',
      'Aligner ses comportements et ses valeurs',
      'Cultiver l\'autonomie et l\'autodétermination',
      'Renforcer la motivation intrinsèque',
      'Développer le sentiment d\'efficacité personnelle',
      'Cultiver la motivation autonome',
      'Développer une vie alignée sur ses valeurs'
    ]
  },
  {
    id: 'spiritualite-transcendance',
    name: 'Spiritualité & Transcendance',
    icon: 'Spiritualité & Transcendance icon.jpeg',
    intentions: [
      'Explorer la conscience et la nature de l\'esprit',
      'Rechercher l\'éveil ou l\'illumination spirituelle',
      'Cultiver la connexion à quelque chose de plus grand',
      'Développer une pratique religieuse ou contemplative',
      'Développer la maîtrise personnelle'
    ]
  },
  {
    id: 'detente-sommeil',
    name: 'Détente & Sommeil',
    icon: 'Détente & Sommeil icon.jpeg',
    intentions: [
      'S\'endormir et améliorer la qualité du sommeil',
      'Gérer l\'insomnie et les réveils nocturnes'
    ]
  },
  {
    id: 'intention-libre',
    name: 'Intention Libre',
    icon: 'Intention Libre icon.jpeg',
    intentions: [] // Special category - navigates to custom intention page
  }
];

export const CategorySelection: React.FC<CategorySelectionProps> = ({
  guideType,
  mood,
  onSelectIntention,
  onCustomIntention,
  onBack,
  onHistory
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    // Special handling for "Intention Libre" category - navigate to new page
    if (categoryId === 'intention-libre') {
      onCustomIntention();
      return;
    }

    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  const guideName = guideType === 'meditation' ? 'Iza' : 'Dann';

  const backgroundImageUrl = getMoodBackgroundUrl(mood.id, import.meta.env.BASE_URL);

  return (
    <div className="category-selection">
      {backgroundImageUrl && (
        <FixedBackground src={backgroundImageUrl} alt="Category selection background" overlayOpacity={0.2} />
      )}
      <StickyHeader onBack={onBack} onHistory={onHistory} showHistory={true} />

      <div className="category-header">
        <h1 className="category-title">Choisis ton intention</h1>
        <p className="category-subtitle">avec {guideName}</p>
      </div>

      <div className="categories-grid">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`category-card ${expandedCategory === category.id ? 'expanded' : ''}`}
            onClick={() => handleCategoryClick(category.id)}
            style={{
              borderColor: expandedCategory === category.id ? `${mood.color}30` : `${mood.color}18`,
              background: expandedCategory === category.id
                ? `linear-gradient(135deg, ${mood.color}10, ${mood.color}08)`
                : `linear-gradient(135deg, ${mood.color}08, ${mood.color}03)`
            }}
          >
            {/* Collapsed state - horizontal layout */}
            {expandedCategory !== category.id && (
              <div className="category-card-inner">
                <div
                  className="category-icon"
                  style={{
                    backgroundImage: `url(${import.meta.env.BASE_URL}${encodeURIComponent(category.icon)})`
                  }}
                />
                <div className="category-info">
                  <h3 className="category-name">{category.name}</h3>
                </div>
                <div className="category-arrow">+</div>
              </div>
            )}

            {/* Expanded state - vertical layout */}
            {expandedCategory === category.id && (
              <div className="category-card-expanded">
                <div
                  className="category-icon-large"
                  style={{
                    backgroundImage: `url(${import.meta.env.BASE_URL}${encodeURIComponent(category.icon)})`
                  }}
                />
                <h3 className="category-name-large">{category.name}</h3>
                <div className="intentions-container">
                  <div className="intentions-list">
                    {category.intentions.map((intention, index) => (
                      <button
                        key={index}
                        className="intention-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIntention(category.id, intention);
                        }}
                      >
                        {intention}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="category-arrow-expanded">−</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
