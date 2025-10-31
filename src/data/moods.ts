import type { Mood, MoodQuestionnaire } from '../types';

export const moods: Mood[] = [
  {
    id: 'energized',
    name: 'Énergisé',
    description: 'Prêt à conquérir la journée',
    icon: '⚡',
    color: '#FFD700'
  },
  {
    id: 'anxious',
    name: 'Anxieux',
    description: 'Préoccupé par les défis',
    icon: '🌊',
    color: '#4A90E2'
  },
  {
    id: 'inspired',
    name: 'Inspiré',
    description: 'Créatif et plein d\'idées',
    icon: '✨',
    color: '#9B59B6'
  },
  {
    id: 'tired',
    name: 'Fatigué',
    description: 'Besoin d\'un boost d\'énergie',
    icon: '🌙',
    color: '#7F8C8D'
  },
  {
    id: 'determined',
    name: 'Déterminé',
    description: 'Focalisé sur vos objectifs',
    icon: '🎯',
    color: '#E74C3C'
  },
  {
    id: 'uncertain',
    name: 'Incertain',
    description: 'Questionnements et doutes',
    icon: '🧭',
    color: '#95A5A6'
  },
  {
    id: 'grateful',
    name: 'Reconnaissant',
    description: 'Sentiment de gratitude',
    icon: '🙏',
    color: '#27AE60'
  },
  {
    id: 'overwhelmed',
    name: 'Débordé',
    description: 'Trop de choses à gérer',
    icon: '🌀',
    color: '#E67E22'
  }
];

export const questionnaires: MoodQuestionnaire[] = [
  {
    moodId: 'energized',
    questions: [
      {
        id: 'e1',
        text: 'Quelle est la source principale de cette énergie ce matin ?',
        options: [
          'Un projet excitant qui m\'attend',
          'Une bonne nuit de sommeil',
          'Des résultats positifs récents',
          'Mon état naturel du matin',
          'Autre raison...'
        ]
      },
      {
        id: 'e2',
        text: 'Comment souhaitez-vous canaliser cette énergie aujourd\'hui ?',
        options: [
          'Sur des tâches créatives et innovantes',
          'Pour avancer sur des objectifs stratégiques',
          'Dans les interactions avec mon équipe',
          'Sur des défis techniques complexes',
          'Autre intention...'
        ]
      },
      {
        id: 'e3',
        text: 'Quel est votre plus grand défi pour maintenir cette énergie ?',
        options: [
          'Les distractions et interruptions',
          'La gestion du temps',
          'Les tâches administratives ennuyeuses',
          'L\'épuisement en fin de journée',
          'Autre défi...'
        ]
      },
      {
        id: 'e4',
        text: 'Quelle réalisation aimeriez-vous accomplir avec cette énergie ?',
        options: [
          'Finaliser un projet important',
          'Créer quelque chose de nouveau',
          'Résoudre un problème persistant',
          'Inspirer et motiver mon équipe',
          'Autre réalisation...'
        ]
      },
      {
        id: 'e5',
        text: 'Comment voulez-vous vous sentir en fin de journée ?',
        options: [
          'Accompli et satisfait',
          'Énergisé et inspiré',
          'Calme et en paix',
          'Fier de mes progrès',
          'Autre sentiment...'
        ]
      }
    ]
  },
  {
    moodId: 'anxious',
    questions: [
      {
        id: 'a1',
        text: 'Quelle est la principale source de cette anxiété ?',
        options: [
          'Une deadline importante qui approche',
          'Des décisions difficiles à prendre',
          'Des incertitudes financières',
          'Des relations professionnelles tendues',
          'Autre source...'
        ]
      },
      {
        id: 'a2',
        text: 'Comment cette anxiété se manifeste-t-elle physiquement ?',
        options: [
          'Tension dans le corps',
          'Pensées qui tournent en boucle',
          'Difficulté à me concentrer',
          'Sensation d\'oppression',
          'Autre manifestation...'
        ]
      },
      {
        id: 'a3',
        text: 'Qu\'est-ce qui pourrait vous aider à apaiser cette anxiété ?',
        options: [
          'Décomposer mes défis en petites étapes',
          'Parler à quelqu\'un de confiance',
          'Me rappeler mes réussites passées',
          'Prendre du recul et respirer',
          'Autre solution...'
        ]
      },
      {
        id: 'a4',
        text: 'Quelle est votre plus grande peur aujourd\'hui ?',
        options: [
          'Ne pas être à la hauteur',
          'Décevoir les autres',
          'Perdre le contrôle',
          'Échouer dans mes objectifs',
          'Autre peur...'
        ]
      },
      {
        id: 'a5',
        text: 'De quoi avez-vous besoin pour avancer malgré l\'anxiété ?',
        options: [
          'Plus de confiance en moi',
          'Un plan d\'action clair',
          'Du soutien de mon entourage',
          'Accepter l\'incertitude',
          'Autre besoin...'
        ]
      },
      {
        id: 'a6',
        text: 'Comment pouvez-vous transformer cette anxiété en action ?',
        options: [
          'La voir comme un signal d\'importance',
          'L\'utiliser comme motivation',
          'La canaliser dans la préparation',
          'L\'accepter et avancer quand même',
          'Autre approche...'
        ]
      }
    ]
  },
  {
    moodId: 'inspired',
    questions: [
      {
        id: 'i1',
        text: 'D\'où vient cette inspiration ce matin ?',
        options: [
          'Une idée qui m\'est venue',
          'Une conversation stimulante',
          'Quelque chose que j\'ai lu ou vu',
          'Une vision claire de l\'avenir',
          'Autre source...'
        ]
      },
      {
        id: 'i2',
        text: 'Dans quel domaine souhaitez-vous exprimer cette créativité ?',
        options: [
          'Développement de nouveaux produits',
          'Stratégie et vision d\'entreprise',
          'Résolution créative de problèmes',
          'Innovation dans les processus',
          'Autre domaine...'
        ]
      },
      {
        id: 'i3',
        text: 'Qu\'est-ce qui pourrait bloquer cette inspiration ?',
        options: [
          'Les tâches opérationnelles urgentes',
          'Le perfectionnisme',
          'La peur du jugement',
          'Le manque de temps dédié',
          'Autre obstacle...'
        ]
      },
      {
        id: 'i4',
        text: 'Comment voulez-vous capturer et développer vos idées ?',
        options: [
          'Les noter immédiatement',
          'En discuter avec d\'autres',
          'Créer un prototype rapide',
          'Les laisser mûrir tranquillement',
          'Autre méthode...'
        ]
      },
      {
        id: 'i5',
        text: 'Quelle création aimeriez-vous concrétiser aujourd\'hui ?',
        options: [
          'Une solution innovante à un problème',
          'Un nouveau concept ou produit',
          'Une amélioration significative',
          'Une collaboration créative',
          'Autre création...'
        ]
      }
    ]
  },
  {
    moodId: 'tired',
    questions: [
      {
        id: 't1',
        text: 'Quelle est la cause principale de cette fatigue ?',
        options: [
          'Manque de sommeil',
          'Surcharge de travail récente',
          'Stress accumulé',
          'Manque de temps pour soi',
          'Autre cause...'
        ]
      },
      {
        id: 't2',
        text: 'Comment cette fatigue affecte-t-elle votre journée ?',
        options: [
          'Difficulté à me concentrer',
          'Moins de motivation',
          'Irritabilité accrue',
          'Décisions plus difficiles',
          'Autre impact...'
        ]
      },
      {
        id: 't3',
        text: 'De quoi avez-vous le plus besoin aujourd\'hui ?',
        options: [
          'Compassion envers moi-même',
          'Réduire mes attentes',
          'Moments de pause réguliers',
          'Déléguer certaines tâches',
          'Autre besoin...'
        ]
      },
      {
        id: 't4',
        text: 'Quelle est la priorité absolue de votre journée ?',
        options: [
          'Une seule tâche vraiment importante',
          'Maintenir les opérations essentielles',
          'Prendre soin de moi',
          'Communiquer avec mon équipe',
          'Autre priorité...'
        ]
      },
      {
        id: 't5',
        text: 'Comment pouvez-vous vous ressourcer aujourd\'hui ?',
        options: [
          'Des micro-pauses régulières',
          'Une marche en pleine conscience',
          'Dire non à certaines sollicitations',
          'Me coucher plus tôt ce soir',
          'Autre méthode...'
        ]
      },
      {
        id: 't6',
        text: 'Qu\'est-ce qui vous donnerait un peu d\'énergie ?',
        options: [
          'Accomplir une petite victoire',
          'Connexion authentique avec quelqu\'un',
          'Faire quelque chose que j\'aime',
          'Me rappeler mon pourquoi',
          'Autre source...'
        ]
      }
    ]
  },
  {
    moodId: 'determined',
    questions: [
      {
        id: 'd1',
        text: 'Quel objectif précis vous motive ce matin ?',
        options: [
          'Un jalon important de mon projet',
          'Une transformation à opérer',
          'Un défi personnel à relever',
          'Une vision à concrétiser',
          'Autre objectif...'
        ]
      },
      {
        id: 'd2',
        text: 'Qu\'est-ce qui alimente cette détermination ?',
        options: [
          'Ma vision à long terme',
          'Un sentiment d\'urgence',
          'Le désir de prouver quelque chose',
          'L\'impact que je veux créer',
          'Autre source...'
        ]
      },
      {
        id: 'd3',
        text: 'Quel obstacle pourrait se dresser sur votre chemin ?',
        options: [
          'Des imprévus et interruptions',
          'Mes propres doutes',
          'Des résistances externes',
          'La complexité de la tâche',
          'Autre obstacle...'
        ]
      },
      {
        id: 'd4',
        text: 'Comment resterez-vous flexible dans votre détermination ?',
        options: [
          'En m\'adaptant aux feedbacks',
          'En gardant l\'esprit ouvert',
          'En acceptant les détours',
          'En célébrant les progrès',
          'Autre approche...'
        ]
      },
      {
        id: 'd5',
        text: 'Que signifierait le succès pour vous aujourd\'hui ?',
        options: [
          'Avancer significativement',
          'Surmonter un obstacle clé',
          'Maintenir ma discipline',
          'Inspirer mon équipe',
          'Autre définition...'
        ]
      }
    ]
  },
  {
    moodId: 'uncertain',
    questions: [
      {
        id: 'u1',
        text: 'À propos de quoi vous sentez-vous incertain ?',
        options: [
          'La direction à prendre',
          'Mes capacités à réussir',
          'L\'avenir de mon entreprise',
          'Des choix importants à faire',
          'Autre incertitude...'
        ]
      },
      {
        id: 'u2',
        text: 'Comment cette incertitude vous affecte-t-elle ?',
        options: [
          'Paralysie décisionnelle',
          'Questionnements constants',
          'Perte de confiance',
          'Difficulté à avancer',
          'Autre impact...'
        ]
      },
      {
        id: 'u3',
        text: 'Qu\'est-ce que vous savez avec certitude ?',
        options: [
          'Mes valeurs et ce qui compte',
          'Mes compétences et forces',
          'Mon engagement envers ma vision',
          'Les leçons de mon parcours',
          'Autre certitude...'
        ]
      },
      {
        id: 'u4',
        text: 'Quelle première petite action pourriez-vous prendre ?',
        options: [
          'Rassembler plus d\'informations',
          'Consulter des personnes de confiance',
          'Tester une hypothèse',
          'Clarifier mes priorités',
          'Autre action...'
        ]
      },
      {
        id: 'u5',
        text: 'Comment pouvez-vous accepter cette incertitude ?',
        options: [
          'La voir comme normale et humaine',
          'Faire confiance au processus',
          'Avancer malgré le doute',
          'Apprendre à l\'inconfort',
          'Autre façon...'
        ]
      },
      {
        id: 'u6',
        text: 'De quel type de clarté avez-vous besoin ?',
        options: [
          'Clarté sur mes valeurs',
          'Clarté sur les options',
          'Clarté sur les conséquences',
          'Clarté sur mon intuition',
          'Autre clarté...'
        ]
      }
    ]
  },
  {
    moodId: 'grateful',
    questions: [
      {
        id: 'g1',
        text: 'Pour quoi êtes-vous le plus reconnaissant ce matin ?',
        options: [
          'Les personnes qui me soutiennent',
          'Les opportunités devant moi',
          'Mon parcours et mes apprentissages',
          'Ma santé et mon bien-être',
          'Autre gratitude...'
        ]
      },
      {
        id: 'g2',
        text: 'Comment cette gratitude influence-t-elle votre état d\'esprit ?',
        options: [
          'Plus d\'ouverture et de générosité',
          'Davantage de perspective',
          'Moins de stress et d\'anxiété',
          'Plus de motivation positive',
          'Autre influence...'
        ]
      },
      {
        id: 'g3',
        text: 'Comment voulez-vous exprimer cette gratitude aujourd\'hui ?',
        options: [
          'Remercier quelqu\'un directement',
          'Rendre service ou aider',
          'Créer de la valeur pour les autres',
          'La garder comme ancrage intérieur',
          'Autre expression...'
        ]
      },
      {
        id: 'g4',
        text: 'Quel apprentissage récent enrichit votre gratitude ?',
        options: [
          'Une difficulté surmontée',
          'Un feedback constructif reçu',
          'Une nouvelle perspective acquise',
          'Une relation approfondie',
          'Autre apprentissage...'
        ]
      },
      {
        id: 'g5',
        text: 'Comment pouvez-vous cultiver cette gratitude ?',
        options: [
          'Prendre des pauses pour apprécier',
          'Tenir un journal de gratitude',
          'Partager les aspects positifs',
          'Méditer sur l\'abondance',
          'Autre pratique...'
        ]
      }
    ]
  },
  {
    moodId: 'overwhelmed',
    questions: [
      {
        id: 'o1',
        text: 'Qu\'est-ce qui contribue le plus à ce sentiment de débordement ?',
        options: [
          'Trop de projets simultanés',
          'Des attentes trop élevées',
          'Manque de temps et de ressources',
          'Responsabilités qui s\'accumulent',
          'Autre cause...'
        ]
      },
      {
        id: 'o2',
        text: 'Comment ce débordement se manifeste-t-il ?',
        options: [
          'Sentiment de panique ou stress',
          'Difficulté à prioriser',
          'Procrastination ou paralysie',
          'Épuisement émotionnel',
          'Autre manifestation...'
        ]
      },
      {
        id: 'o3',
        text: 'Quelle serait votre plus grande libération ?',
        options: [
          'Déléguer ou demander de l\'aide',
          'Reporter ou annuler certaines choses',
          'Simplifier et réduire',
          'Accepter que tout ne sera pas parfait',
          'Autre libération...'
        ]
      },
      {
        id: 'o4',
        text: 'Qu\'est-ce qui est vraiment urgent ET important ?',
        options: [
          'Une ou deux priorités essentielles',
          'Prendre soin de ma santé mentale',
          'Communiquer avec les parties prenantes',
          'Créer de l\'espace pour respirer',
          'Autre priorité...'
        ]
      },
      {
        id: 'o5',
        text: 'Que pouvez-vous lâcher aujourd\'hui ?',
        options: [
          'Le perfectionnisme',
          'Le besoin de tout contrôler',
          'Certaines tâches non essentielles',
          'Les attentes irréalistes',
          'Autre chose...'
        ]
      },
      {
        id: 'o6',
        text: 'Comment voulez-vous retrouver votre équilibre ?',
        options: [
          'Établir des limites claires',
          'Demander du soutien',
          'Pratiquer l\'auto-compassion',
          'Créer un plan réaliste',
          'Autre méthode...'
        ]
      },
      {
        id: 'o7',
        text: 'Quelle petite victoire vous redonnerait confiance ?',
        options: [
          'Compléter une seule tâche importante',
          'Organiser et clarifier mes priorités',
          'Prendre un vrai moment de pause',
          'Avoir une conversation honnête',
          'Autre victoire...'
        ]
      }
    ]
  }
];
