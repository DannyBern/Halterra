import type { Mood, MoodQuestionnaire } from '../types';

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
    color: '#7F8C8D'
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

export const questionnaires: MoodQuestionnaire[] = [
  // ALIGNÉ / EN FLOW
  {
    moodId: 'aligned',
    questions: [
      {
        id: 'aligned1',
        text: 'Comment sens-tu ton corps ce matin ?',
        options: [
          'Vivant, fluide, habité - je sens l\'énergie circuler',
          'Bien, présent, disponible',
          'Correct, neutre',
          'Tendu, contracté par endroits',
          'Lourd, absent, déconnecté'
        ]
      },
      {
        id: 'aligned2',
        text: 'Es-tu en contact avec ce qui est vraiment important pour toi aujourd\'hui ?',
        options: [
          'Oui, très clair, j\'ai une boussole intérieure forte',
          'Oui, je sens mes priorités',
          'Partiellement, c\'est un peu flou',
          'Non, je suis dispersé',
          'Complètement perdu, aucune clarté'
        ]
      },
      {
        id: 'aligned3',
        text: 'Quel est ton rapport à l\'inconnu aujourd\'hui ?',
        options: [
          'Curiosité, ouverture - l\'inconnu est une invitation',
          'Confiance tranquille',
          'Hésitation légère',
          'Appréhension, besoin de tout contrôler',
          'Peur paralysante'
        ]
      },
      {
        id: 'aligned4',
        text: 'Te sens-tu libre d\'être toi-même ce matin ?',
        options: [
          'Totalement libre, authentique, sans masque',
          'Assez libre, à l\'aise avec qui je suis',
          'Libre par moments seulement',
          'Contraint, en train de jouer un rôle',
          'Enfermé, incapable d\'être moi-même'
        ]
      },
      {
        id: 'aligned5',
        text: 'Comment perçois-tu tes défis aujourd\'hui ?',
        options: [
          'Comme des invitations à grandir, stimulants',
          'Comme des choses normales que je peux gérer',
          'Ni excitants ni menaçants',
          'Comme des obstacles lourds',
          'Comme des menaces écrasantes'
        ]
      },
      {
        id: 'aligned6',
        text: 'Ressens-tu de la gratitude pour quelque chose ce matin ?',
        options: [
          'Oui, gratitude profonde, émerveillement',
          'Oui, reconnaissance tranquille',
          'Un peu, c\'est subtil',
          'Difficilement, je me concentre sur ce qui manque',
          'Aucune gratitude, seulement du manque'
        ]
      },
      {
        id: 'aligned7',
        text: 'De quoi as-tu besoin pour honorer qui tu es aujourd\'hui ?',
        options: [
          'De rien de particulier, je sens que j\'ai ce qu\'il faut',
          'D\'un moment de pause pour me reconnecter',
          'De clarté sur mes priorités',
          'De courage pour être moi-même',
          'De permission pour exister'
        ]
      }
    ]
  },

  // MOTIVÉ / INSPIRÉ
  {
    moodId: 'motivated',
    questions: [
      {
        id: 'motivated1',
        text: 'Qu\'est-ce qui vibre en toi ce matin ?',
        options: [
          'Un feu clair, une direction évidente',
          'Un élan agréable, une envie',
          'Une petite étincelle discrète',
          'Rien de particulier, du vide',
          'Du chaos, trop de choses en même temps'
        ]
      },
      {
        id: 'motivated2',
        text: 'Comment est ton énergie physique ?',
        options: [
          'Abondante, disponible, prête à l\'action',
          'Bonne, suffisante',
          'Moyenne, ni haute ni basse',
          'Faible, fatiguée',
          'Épuisée, rien dans le réservoir'
        ]
      },
      {
        id: 'motivated3',
        text: 'Te sens-tu attiré vers quelque chose aujourd\'hui ?',
        options: [
          'Oui, fortement - je sais où aller',
          'Oui, quelque chose m\'appelle doucement',
          'Peut-être, c\'est incertain',
          'Non, je dois me forcer',
          'Non, tout me repousse'
        ]
      },
      {
        id: 'motivated4',
        text: 'Comment perçois-tu ton pouvoir d\'action ?',
        options: [
          'Je me sens capable, puissant, agissant',
          'Je peux agir et faire une différence',
          'Je peux agir un peu',
          'Je me sens limité, petit',
          'Impuissant, aucun pouvoir'
        ]
      },
      {
        id: 'motivated5',
        text: 'Quelle est ta relation avec le temps aujourd\'hui ?',
        options: [
          'Le temps est mon allié, je l\'habite',
          'Le temps coule bien',
          'Le temps est neutre',
          'Le temps me presse, je cours',
          'Le temps m\'écrase, je le subis'
        ]
      },
      {
        id: 'motivated6',
        text: 'Ressens-tu de la joie anticipée ?',
        options: [
          'Oui, j\'ai hâte de vivre ma journée',
          'Oui, légère excitation',
          'Neutre, ni hâte ni appréhension',
          'Non, j\'appréhende plutôt',
          'Non, je redoute la journée'
        ]
      },
      {
        id: 'motivated7',
        text: 'Si tu pouvais faire UN choix libre aujourd\'hui, qu\'est-ce qui émerge ?',
        options: [
          'Une évidence claire, je sais',
          'Quelque chose apparaît assez facilement',
          'Plusieurs options, confusion',
          'Rien n\'émerge',
          'Trop de choses se bousculent, paralysie'
        ]
      }
    ]
  },

  // ANXIEUX / INQUIET
  {
    moodId: 'anxious',
    questions: [
      {
        id: 'anxious1',
        text: 'Où est ton mental ce matin ?',
        options: [
          'Ici, maintenant, ancré dans le présent',
          'Plutôt présent avec quelques pensées',
          'Entre présent et futur',
          'Projeté dans le futur, anticipations',
          'Complètement dans la tête, tourner en boucle'
        ]
      },
      {
        id: 'anxious2',
        text: 'Comment respires-tu en ce moment ?',
        options: [
          'Respiration profonde, fluide, ventrale',
          'Respiration calme, normale',
          'Respiration superficielle',
          'Respiration courte, haute, thoracique',
          'Respiration bloquée, retenue'
        ]
      },
      {
        id: 'anxious3',
        text: 'Qu\'est-ce qui demande ton attention avec urgence ?',
        options: [
          'Rien d\'urgent - tout peut attendre',
          'Une ou deux choses claires',
          'Plusieurs choses qui s\'accumulent',
          'Trop de choses - tout semble urgent',
          'Tout s\'écroule - urgence partout'
        ]
      },
      {
        id: 'anxious4',
        text: 'Y a-t-il une peur présente en toi maintenant ?',
        options: [
          'Non, aucune peur',
          'Une inquiétude légère et gérable',
          'Oui, une peur modérée que j\'identifie',
          'Oui, plusieurs peurs qui m\'envahissent',
          'Oui, une terreur diffuse que je ne comprends pas'
        ]
      },
      {
        id: 'anxious5',
        text: 'Peux-tu sentir un endroit de sécurité dans ton corps ?',
        options: [
          'Oui, tout mon corps se sent sûr',
          'Oui, certaines parties se sentent stables',
          'Difficilement, tout est tendu',
          'Non, aucun endroit sûr',
          'Mon corps est un lieu d\'alerte totale'
        ]
      },
      {
        id: 'anxious6',
        text: 'Comment est ta confiance en ta capacité à naviguer l\'inconnu ?',
        options: [
          'Forte - je me fais confiance',
          'Présente - je peux faire face',
          'Fragile - ça dépend',
          'Faible - je doute beaucoup',
          'Absente - je ne peux pas gérer'
        ]
      },
      {
        id: 'anxious7',
        text: 'Si ton inquiétude pouvait parler, que dirait-elle ?',
        options: [
          'Elle ne parle pas, elle est silencieuse',
          '"Fais attention" - conseil doux',
          '"Attention danger" - avertissement',
          '"Tu vas échouer" - catastrophisme',
          '"C\'est fini, tu es perdu" - terreur'
        ]
      },
      {
        id: 'anxious8',
        text: 'De quoi aurais-tu besoin pour t\'apaiser maintenant ?',
        options: [
          'De rien, je suis déjà apaisé',
          'D\'une respiration consciente',
          'De sentir mes pieds sur le sol',
          'D\'être rassuré que je ne suis pas en danger',
          'D\'arrêter de sentir complètement'
        ]
      }
    ]
  },

  // ÉPUISÉ / VIDÉ
  {
    moodId: 'exhausted',
    questions: [
      {
        id: 'exhausted1',
        text: 'Comment te sens-tu dans tes os ce matin ?',
        options: [
          'Reposé, régénéré, force vitale',
          'Bien reposé, énergie disponible',
          'Correct mais pas totalement rechargé',
          'Fatigué dans mes os',
          'Épuisé jusqu\'à la moelle, vidé'
        ]
      },
      {
        id: 'exhausted2',
        text: 'Quelle est ta relation avec le repos ?',
        options: [
          'Le repos me nourrit, je l\'honore',
          'Je m\'autorise du repos quand j\'en ai besoin',
          'Je prends du repos mais avec culpabilité',
          'Le repos est un luxe que je ne peux pas me permettre',
          'Je ne sais même plus comment me reposer'
        ]
      },
      {
        id: 'exhausted3',
        text: 'Depuis combien de temps te sens-tu ainsi ?',
        options: [
          'Je ne me sens pas épuisé',
          'C\'est nouveau, depuis quelques jours',
          'Depuis quelques semaines',
          'Depuis des mois',
          'Depuis si longtemps que j\'ai oublié l\'avant'
        ]
      },
      {
        id: 'exhausted4',
        text: 'Qu\'est-ce qui a été drainé en toi ?',
        options: [
          'Rien, je me sens plein',
          'Un peu d\'énergie physique',
          'Mon énergie émotionnelle et physique',
          'Mon espoir, mon sens, ma joie',
          'Mon essence même, ma volonté de continuer'
        ]
      },
      {
        id: 'exhausted5',
        text: 'Peux-tu imaginer te reposer sans culpabilité ?',
        options: [
          'Oui, facilement - c\'est mon droit',
          'Oui, avec un peu d\'effort',
          'Difficilement, la culpabilité arrive vite',
          'Non, je dois être productif',
          'Non, le repos me semble impossible'
        ]
      },
      {
        id: 'exhausted6',
        text: 'Comment perçois-tu demain ?',
        options: [
          'Comme une nouvelle opportunité',
          'Avec curiosité tranquille',
          'Avec neutralité',
          'Comme une montagne à gravir',
          'Comme une impossibilité, je ne peux plus'
        ]
      },
      {
        id: 'exhausted7',
        text: 'Si tu pouvais offrir quelque chose à la partie épuisée de toi, quoi ?',
        options: [
          'Je ne suis pas épuisé',
          'Du repos, du sommeil',
          'De la compassion, de la douceur',
          'La permission d\'arrêter',
          'Une sortie, une fin'
        ]
      },
      {
        id: 'exhausted8',
        text: 'Y a-t-il une petite étincelle de vie quelque part en toi ?',
        options: [
          'Oui, un feu clair',
          'Oui, une flamme discrète mais présente',
          'Une braise très faible',
          'Je ne sais pas où regarder',
          'Rien, tout est éteint'
        ]
      }
    ]
  },

  // TRISTE / DÉCOURAGÉ
  {
    moodId: 'sad',
    questions: [
      {
        id: 'sad1',
        text: 'Qu\'est-ce qui pèse sur ton cœur ce matin ?',
        options: [
          'Rien, mon cœur est léger',
          'Une légère mélancolie',
          'Un poids réel mais supportable',
          'Un poids lourd, oppressant',
          'Un poids écrasant, insupportable'
        ]
      },
      {
        id: 'sad2',
        text: 'Y a-t-il quelque chose que tu as perdu récemment ?',
        options: [
          'Non, pas de perte',
          'Une petite chose, mineure',
          'Quelque chose d\'important',
          'Plusieurs choses importantes',
          'Tout ce qui comptait'
        ]
      },
      {
        id: 'sad3',
        text: 'Sens-tu que la vie a encore un goût ?',
        options: [
          'Oui, la vie est savoureuse',
          'Oui, certaines choses ont du goût',
          'Un peu, tout est fade',
          'Non, plus rien n\'a de goût',
          'La vie est amère'
        ]
      },
      {
        id: 'sad4',
        text: 'Peux-tu pleurer si tu en as besoin ?',
        options: [
          'Je n\'ai pas besoin de pleurer',
          'Oui, les larmes coulent librement',
          'Oui mais difficilement',
          'Non, les larmes sont bloquées',
          'Non, je suis sec, vide'
        ]
      },
      {
        id: 'sad5',
        text: 'Comment perçois-tu ton avenir ?',
        options: [
          'Lumineux, plein de possibles',
          'Correct, ça ira',
          'Incertain, brumeux',
          'Sombre, difficile',
          'Inexistant, impossible'
        ]
      },
      {
        id: 'sad6',
        text: 'Y a-t-il de la place pour la tendresse envers toi-même ?',
        options: [
          'Oui, beaucoup de tendresse',
          'Oui, je peux être doux avec moi',
          'Un peu, c\'est difficile',
          'Non, je suis dur avec moi',
          'Non, je me déteste'
        ]
      },
      {
        id: 'sad7',
        text: 'Si ta tristesse pouvait t\'enseigner quelque chose, qu\'est-ce que ce serait ?',
        options: [
          'Je ne suis pas triste',
          'Que je suis humain et sensible',
          'Que j\'ai besoin de ralentir',
          'Que j\'ai aimé et perdu',
          'Que tout est vain'
        ]
      }
    ]
  },

  // FRUSTRÉ / EN COLÈRE
  {
    moodId: 'frustrated',
    questions: [
      {
        id: 'frustrated1',
        text: 'Y a-t-il une chaleur en toi ce matin ?',
        options: [
          'Non, je suis calme et frais',
          'Un peu de feu, mais contrôlé',
          'Oui, une chaleur qui monte',
          'Oui, un feu qui brûle',
          'Oui, une rage qui consume'
        ]
      },
      {
        id: 'frustrated2',
        text: 'Quelque chose ou quelqu\'un te bloque-t-il ?',
        options: [
          'Non, la voie est libre',
          'De petits obstacles gérables',
          'Oui, quelques barrières frustrantes',
          'Oui, des blocages importants injustes',
          'Oui, tout me bloque, c\'est insupportable'
        ]
      },
      {
        id: 'frustrated3',
        text: 'Peux-tu nommer ce qui n\'est pas OK pour toi ?',
        options: [
          'Tout est OK',
          'Oui, facilement - je sais ce qui ne va pas',
          'Vaguement, c\'est confus',
          'Non, je sens juste la colère',
          'Trop de choses - je ne peux pas démêler'
        ]
      },
      {
        id: 'frustrated4',
        text: 'Ressens-tu une envie d\'agir, de changer quelque chose ?',
        options: [
          'Non, tout est fluide',
          'Une envie d\'améliorer des choses',
          'Une envie forte de corriger',
          'Une envie de casser, détruire',
          'Une envie de fuir ou exploser'
        ]
      },
      {
        id: 'frustrated5',
        text: 'Ta colère protège-t-elle quelque chose d\'important ?',
        options: [
          'Je ne suis pas en colère',
          'Oui, elle protège mes limites',
          'Oui, elle protège ma dignité',
          'Oui, elle protège ma survie',
          'Non, elle détruit tout'
        ]
      },
      {
        id: 'frustrated6',
        text: 'Peux-tu être avec ta colère sans la fuir ni l\'exploser ?',
        options: [
          'Je ne suis pas en colère',
          'Oui, je peux l\'accueillir et la sentir',
          'Difficilement, elle me submerge vite',
          'Non, je dois la contenir ou exploser',
          'Non, elle me possède entièrement'
        ]
      },
      {
        id: 'frustrated7',
        text: 'Si ta colère avait une demande, quelle serait-elle ?',
        options: [
          'Pas de colère, pas de demande',
          '"Respecte mes limites"',
          '"Vois-moi, entends-moi"',
          '"Change maintenant"',
          '"Détruis tout"'
        ]
      }
    ]
  },

  // PERDU / CONFUS
  {
    moodId: 'lost',
    questions: [
      {
        id: 'lost1',
        text: 'Connais-tu ta direction ce matin ?',
        options: [
          'Oui, ma boussole est claire',
          'Oui, assez clairement',
          'Vaguement, c\'est brumeux',
          'Non, je suis dans le brouillard',
          'Non, et je ne sais plus où chercher'
        ]
      },
      {
        id: 'lost2',
        text: 'Reconnais-tu qui tu es en ce moment ?',
        options: [
          'Oui, totalement - je me connais',
          'Oui, je me reconnais',
          'Partiellement, je doute',
          'Non, je ne sais plus qui je suis',
          'Non, je me sens étranger à moi-même'
        ]
      },
      {
        id: 'lost3',
        text: 'Tes questions ont-elles des réponses ou seulement plus de questions ?',
        options: [
          'J\'ai les réponses dont j\'ai besoin',
          'Mes questions trouvent des chemins',
          'Mes questions créent d\'autres questions',
          'Je suis noyé dans les questions',
          'Je n\'ai même plus de questions'
        ]
      },
      {
        id: 'lost4',
        text: 'Peux-tu tolérer de ne pas savoir ?',
        options: [
          'Oui, facilement - l\'inconnu est OK',
          'Oui, avec de l\'inconfort gérable',
          'Difficilement, ça m\'angoisse',
          'Non, j\'ai besoin de savoir',
          'Non, l\'incertitude me détruit'
        ]
      },
      {
        id: 'lost5',
        text: 'Quelque chose de familier en toi est-il encore là ?',
        options: [
          'Oui, mon essence est intacte',
          'Oui, je reconnais des parts de moi',
          'Un peu, très peu de choses',
          'Presque rien de familier',
          'Rien, tout est étranger'
        ]
      },
      {
        id: 'lost6',
        text: 'Y a-t-il une part de toi qui sait, même si ta tête ne sait pas ?',
        options: [
          'Oui, mon corps/cœur sait',
          'Oui, quelque chose en moi sait',
          'Peut-être, c\'est très subtil',
          'Non, rien ne sait',
          'Tout est chaos'
        ]
      },
      {
        id: 'lost7',
        text: 'De quoi aurais-tu besoin pour retrouver un repère ?',
        options: [
          'Je ne suis pas perdu',
          'D\'un moment de silence',
          'De revenir à ce qui est essentiel',
          'D\'une main tendue',
          'D\'une cartographie complète'
        ]
      }
    ]
  },

  // SEUL / ISOLÉ
  {
    moodId: 'alone',
    questions: [
      {
        id: 'alone1',
        text: 'Te sens-tu accompagné en ce moment ?',
        options: [
          'Oui, profondément accompagné',
          'Oui, suffisamment entouré',
          'Partiellement, un peu seul',
          'Non, très seul',
          'Non, complètement isolé'
        ]
      },
      {
        id: 'alone2',
        text: 'Y a-t-il quelqu\'un qui te voit vraiment ?',
        options: [
          'Oui, plusieurs personnes me voient',
          'Oui, quelques personnes',
          'Peut-être une personne',
          'Non, personne ne me voit',
          'Non, et je suis invisible à moi-même aussi'
        ]
      },
      {
        id: 'alone3',
        text: 'Peux-tu partager ce qui est vrai pour toi avec quelqu\'un ?',
        options: [
          'Oui, librement avec plusieurs personnes',
          'Oui, avec quelqu\'un de confiance',
          'Difficilement, je me retiens',
          'Non, c\'est trop dangereux',
          'Non, et je ne sais même plus ce qui est vrai'
        ]
      },
      {
        id: 'alone4',
        text: 'Appartiens-tu à quelque chose de plus grand que toi ?',
        options: [
          'Oui, je fais partie d\'un tout',
          'Oui, je sens l\'appartenance',
          'Un peu, c\'est fragile',
          'Non, je suis à part',
          'Non, je suis complètement exclu'
        ]
      },
      {
        id: 'alone5',
        text: 'Comment est ta relation avec toi-même en ce moment ?',
        options: [
          'Amicale, douce, présente',
          'Correcte, neutre',
          'Distante, froide',
          'Hostile, critique',
          'Inexistante, je m\'ai abandonné'
        ]
      },
      {
        id: 'alone6',
        text: 'Peux-tu sentir que tu n\'es pas seul même si personne n\'est là ?',
        options: [
          'Oui, je sens une présence (en moi, vie, univers)',
          'Oui, parfois',
          'Difficilement',
          'Non, l\'absence d\'autrui est vide',
          'Non, le vide est total'
        ]
      },
      {
        id: 'alone7',
        text: 'De quoi as-tu besoin pour te sentir moins seul ?',
        options: [
          'Je ne me sens pas seul',
          'D\'un moment de connexion authentique',
          'D\'être écouté sans jugement',
          'De savoir que quelqu\'un pense à moi',
          'De quelqu\'un qui reste, peu importe quoi'
        ]
      }
    ]
  },

  // SUBMERGÉ / SOUS PRESSION
  {
    moodId: 'overwhelmed',
    questions: [
      {
        id: 'overwhelmed1',
        text: 'Combien de choses portent sur tes épaules ce matin ?',
        options: [
          'Rien de lourd, je suis léger',
          'Quelques choses gérables',
          'Une charge importante mais OK',
          'Trop de choses, je plie',
          'Un poids écrasant, je m\'effondre'
        ]
      },
      {
        id: 'overwhelmed2',
        text: 'Arrive-tu à respirer complètement ?',
        options: [
          'Oui, respiration ample et libre',
          'Oui, respiration normale',
          'Respiration restreinte',
          'Respiration courte, oppressée',
          'À peine, comme étranglé'
        ]
      },
      {
        id: 'overwhelmed3',
        text: 'Les demandes qui viennent vers toi, les accueilles-tu ou les subis-tu ?',
        options: [
          'Je les accueille avec présence',
          'Je les reçois correctement',
          'Je les subis un peu',
          'Je les subis beaucoup, je ne choisis pas',
          'Je suis submergé, tout m\'agresse'
        ]
      },
      {
        id: 'overwhelmed4',
        text: 'Peux-tu sentir tes limites ou sont-elles floues ?',
        options: [
          'Oui, mes limites sont claires et solides',
          'Oui, je sais où elles sont',
          'Elles sont floues, incertaines',
          'Je ne sais plus où elles sont',
          'Je n\'ai plus de limites, je suis poreux'
        ]
      },
      {
        id: 'overwhelmed5',
        text: 'Y a-t-il de l\'espace en toi ou tout est-il plein ?',
        options: [
          'Beaucoup d\'espace, de vide disponible',
          'Un peu d\'espace',
          'Très peu d\'espace',
          'Aucun espace, tout est saturé',
          'Débordement, explosion'
        ]
      },
      {
        id: 'overwhelmed6',
        text: 'Peux-tu dire non à quelque chose aujourd\'hui ?',
        options: [
          'Oui, facilement et clairement',
          'Oui, si vraiment nécessaire',
          'Difficilement, avec culpabilité',
          'Non, impossible',
          'Je ne sais même plus ce qu\'est un "non"'
        ]
      },
      {
        id: 'overwhelmed7',
        text: 'De quoi aurais-tu besoin pour retrouver de l\'air ?',
        options: [
          'Je respire bien',
          'D\'une pause, maintenant',
          'De poser des choses, déléguer',
          'Que tout s\'arrête un instant',
          'De disparaître complètement'
        ]
      }
    ]
  },

  // CALME / SEREIN
  {
    moodId: 'calm',
    questions: [
      {
        id: 'calm1',
        text: 'Comment est ton cœur ce matin ?',
        options: [
          'Paisible, ouvert, doux',
          'Calme, tranquille',
          'Ni paisible ni agité',
          'Contracté, fermé',
          'Douloureux, brisé'
        ]
      },
      {
        id: 'calm2',
        text: 'Peux-tu sentir le sol sous tes pieds ?',
        options: [
          'Oui, complètement ancré, enraciné',
          'Oui, je sens le sol',
          'Un peu, légèrement déconnecté',
          'Non, je flotte',
          'Non, je suis perdu dans l\'espace'
        ]
      },
      {
        id: 'calm3',
        text: 'Y a-t-il quelque chose à prouver aujourd\'hui ?',
        options: [
          'Non, rien du tout - je suis suffisant',
          'Non, je peux juste être',
          'Un peu, quelques attentes',
          'Oui, beaucoup à prouver',
          'Oui, je dois me battre pour exister'
        ]
      },
      {
        id: 'calm4',
        text: 'Le silence t\'est-il confortable ?',
        options: [
          'Oui, le silence est un refuge',
          'Oui, le silence est OK',
          'Neutre, ni agréable ni désagréable',
          'Non, le silence m\'inquiète',
          'Non, le silence me terrifie'
        ]
      },
      {
        id: 'calm5',
        text: 'Ressens-tu de la gratitude subtile pour l\'ordinaire ?',
        options: [
          'Oui, émerveillement pour le simple',
          'Oui, appréciation tranquille',
          'Un peu, ça vient par moments',
          'Non, je ne remarque pas',
          'Non, tout me semble terne'
        ]
      },
      {
        id: 'calm6',
        text: 'De quoi as-tu besoin pour préserver cette qualité ?',
        options: [
          'De rien, elle est stable',
          'De continuer à être présent',
          'De protéger mon espace',
          'Je ne suis pas calme',
          'Je ne sais pas'
        ]
      }
    ]
  }
];
