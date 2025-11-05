import React, { useState } from 'react';
import './CategorySelection.css';

interface Category {
  id: string;
  name: string;
  icon: string;
  timeOfDay?: string;
}

interface CategorySelectionProps {
  guideType: 'meditation' | 'reflection';
  onSelectIntention: (category: string, intention: string) => void;
  onBack: () => void;
}

const categories: Category[] = [
  { id: 'sante-corps', name: 'Santé & Corps', icon: 'Santé & Corps icon.jpeg' },
  { id: 'changement-habitudes', name: 'Changement & Habitudes', icon: 'Changement & Habitudes icon.jpeg' },
  { id: 'eveil-preparation', name: 'Éveil & Préparation', icon: 'Éveil & Préparation icon.jpeg', timeOfDay: 'Matin' },
  { id: 'attention-cognition', name: 'Attention & Cognition', icon: 'Attention & Cognition icon.jpeg', timeOfDay: 'Matin/Journée' },
  { id: 'performance-action', name: 'Performance & Action', icon: 'Performance & Action icon.jpeg', timeOfDay: 'Journée' },
  { id: 'regulation-resilience', name: 'Régulation & Résilience', icon: 'Régulation & Résilience icon.jpeg', timeOfDay: 'Journée' },
  { id: 'flexibilite-psychologique', name: 'Flexibilité Psychologique', icon: 'Flexibilité Psychologique icon.jpeg', timeOfDay: 'Journée' },
  { id: 'relations-connexion', name: 'Relations & Connexion', icon: 'Relations & Connexion icon.jpeg', timeOfDay: 'Journée' },
  { id: 'bien-etre-etats-positifs', name: 'Bien-être & États Positifs', icon: 'Bien-être & États Positifs icon.jpeg', timeOfDay: 'Soir' },
  { id: 'soi-developpement', name: 'Soi & Développement', icon: 'Soi & Développement icon.jpeg', timeOfDay: 'Soir' },
  { id: 'autonomie-valeurs', name: 'Autonomie & Valeurs', icon: 'Autonomie & Valeurs.jpeg', timeOfDay: 'Soir' },
  { id: 'spiritualite-transcendance', name: 'Spiritualité & Transcendance', icon: 'Spiritualité & Transcendance icon.jpeg', timeOfDay: 'Soir/Nuit' },
  { id: 'detente-sommeil', name: 'Détente & Sommeil', icon: 'Détente & Sommeil icon.jpeg', timeOfDay: 'Nuit' },
];

export const CategorySelection: React.FC<CategorySelectionProps> = ({
  guideType,
  onBack
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  const guideName = guideType === 'meditation' ? 'Iza' : 'Dann';

  return (
    <div className="category-selection">
      <button className="back-button-category" onClick={onBack}>
        ← Retour
      </button>

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
          >
            <div className="category-card-inner">
              <div
                className="category-icon"
                style={{
                  backgroundImage: `url(/Halterra/${category.icon})`
                }}
              />
              <div className="category-info">
                <h3 className="category-name">{category.name}</h3>
                {category.timeOfDay && (
                  <span className="category-time">{category.timeOfDay}</span>
                )}
              </div>
              <div className="category-arrow">
                {expandedCategory === category.id ? '−' : '+'}
              </div>
            </div>

            {/* Intentions will be rendered here when expanded */}
            {expandedCategory === category.id && (
              <div className="intentions-container">
                <div className="intentions-placeholder">
                  <p className="intentions-coming-soon">
                    Les intentions spécifiques apparaîtront ici
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
