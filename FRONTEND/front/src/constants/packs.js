/**
 * Grille tarifaire officielle - KIDS WORLD FESTIVAL
 * Source : Cahier des charges section 4
 */

export const DROITS_INTERVENTION = 15000;
export const TVA_RATE = 0.19;
export const ESPACE_VENTE_PACK_ID = 'espace-vente';
export const FORMULE_PACK_IDS = ['standard', 'expo-plus', 'pack-italie', 'pack-turquie', 'pack-algerie'];

export const PACKS = [
  {
    id: 'standard',
    category: 'formule',
    name: 'Formule Standard',
    price: 450000,
    priceLabel: '450 000 DA',
    surface: "jusqu'a 25 m2",
    chapiteau: true,
    icon: '🏕️',
    color: 'var(--color-primary)',
    features: [
      'Surface couverte sous chapiteau',
      'Raccordement electrique',
      '1 table incluse',
      '2 chaises incluses',
      "Jusqu'a 25 m2 d'espace",
    ],
    popular: false,
  },
  {
    id: 'expo-plus',
    category: 'formule',
    name: 'Formule Expo Plus',
    price: 750000,
    priceLabel: '750 000 DA',
    surface: "jusqu'a 50 m2",
    chapiteau: true,
    icon: '🎪',
    color: 'var(--color-accent)',
    features: [
      'Surface couverte sous chapiteau',
      'Raccordement electrique',
      '1 table incluse',
      '2 chaises incluses',
      "Jusqu'a 50 m2 d'espace",
      'Visibilite premium',
    ],
    popular: true,
  },
  {
    id: 'pack-italie',
    category: 'sponsor',
    name: 'Pack Sponsor Italie',
    price: 1000000,
    priceLabel: '1 000 000 DA',
    surface: 'Activation jusqu’à 60 m²',
    chapiteau: false,
    icon: '🇮🇹',
    color: 'var(--color-tertiary)',
    features: [
      'Intégration de votre logo sur le photocall officiel et les espaces de prise de photos',
      'Espace d’activation jusqu’à 60 m²',
      'Diffusion de votre spot sur les écrans géants',
      'Créneau d’animation sur scène (démonstration, tombola ou jeu concours)',
      'démonstration, une tombola, un jeu concours ou une prise de parole de votre marque',
      'EMPLACEMENTS Stratégiques',
    ],
    popular: false,
  },
  {
    id: 'pack-turquie',
    category: 'sponsor',
    name: 'Pack Sponsor Turquie',
    price: 2200000,
    priceLabel: '2 200 000 DA',
    surface: 'Pack visibilité grand format',
    chapiteau: false,
    icon: '🇹🇷',
    color: 'var(--color-warning)',
    features: [
      'Panneaux publicitaires grand format à l’entrée principale',
      "Pop-Up à l’entrée du festival pour assurer l'orientation des visiteurs et maximiser la visibilité de votre marque",
      'Logo sur la scène principale et panneaux de signalétique',
      "Diffusion de votre spot publicitaire sur le grand écran géant tout au long de l'événement.",
      '2 créneaux de 15 min pour animation de marque',
      'Espace d’exposition de 150 m² pour votre activation de marque, + chapiteau de 25 m² dédié à la vente ou à la présentation de vos produits.',
    ],
    popular: false,
  },
  {
    id: 'pack-algerie',
    category: 'sponsor',
    name: 'Pack Sponsor Algérie',
    price: 4500000,
    priceLabel: '4 500 000 DA',
    surface: 'Activation Premium éco Park',
    chapiteau: false,
    icon: '🇩🇿',
    color: 'var(--color-danger)',
    features: [
      "Animations de marque sur scène avant les spectacles (tombola, jeux, défis, quiz ou remise de cadeaux) avant les spectacles et animations principales",
      'Branding exclusif de l’arche d’entrée World Festival Kids',
      'Pop-Up exclusif à l’entrée du festival',
      'Habillage des barrières, fanions et allées',
      'Visibilité premium sur supports de communication et guide officiel',
      'Intégration de votre logo sur les supports verticaux de la scène',
      'branding drapeau sur tout les potos du site eco Park',
      "Branding exclusif de zone Détente,avec un habillage aux couleurs de votre marque (parasols, mobilier, PLV, mange-debout, etc. fournis par le sponsor).",
      "Insertion d'une publicité dans le guide officiel du festival.",
      
    ],
    popular: false,
  },
  {
    id: ESPACE_VENTE_PACK_ID,
    category: 'option',
    name: 'Espace Vente',
    price: 234000,
    priceLabel: '234 000 DA',
    surface: "jusqu'a 18 m2",
    chapiteau: true,
    icon: '🛍️',
    color: 'var(--color-success)',
    features: [
      'Surface couverte sous chapiteau',
      'Raccordement electrique',
      '1 table incluse',
      '2 chaises incluses',
      "Jusqu'a 18 m2 d'espace",
    ],
    popular: false,
  },
  {
    id: 'espace-nu',
    category: 'option',
    name: 'Espace Nu',
    price: 12000,
    priceLabel: '12 000 DA/m2',
    surface: 'selon m2 choisis',
    chapiteau: false,
    icon: '📐',
    color: 'var(--color-secondary)',
    features: [
      'Surface brute',
      'Sans amenagement inclus',
      'Liberte totale de configuration',
      'Surface au choix',
    ],
    popular: false,
    perSquareMeter: true,
  },
];

export const EVENT_INFO = {
  name: 'KIDS WORLD FESTIVAL',
  tagline: 'Le Dernier Voyage Avant la Rentree Scolaire',
  organizer: 'MELEVEN',
  type: 'Salon B2B',
  description:
    "Un salon B2B mettant en relation l'agence organisatrice avec des marques et exposants souhaitant tenir un stand, dans un univers ludique dedie aux enfants.",
};

export const normalizePackIds = (value) => {
  const rawIds = Array.isArray(value)
    ? value.flatMap((id) => String(id).split(','))
    : typeof value === 'string'
      ? value.split(',')
      : [];

  const validIds = new Set(PACKS.map((pack) => pack.id));
  return [...new Set(rawIds.map((id) => String(id).trim()).filter((id) => validIds.has(id)))];
};

export const getSelectedPacks = (packIds) => {
  return normalizePackIds(packIds)
    .map((id) => PACKS.find((pack) => pack.id === id))
    .filter(Boolean);
};

export const getPrimaryPackId = (packIds) => {
  const normalizedIds = normalizePackIds(packIds);
  return normalizedIds.find((id) => id !== ESPACE_VENTE_PACK_ID) || normalizedIds[0] || '';
};

export const togglePackSelection = (currentPackIds, nextPackId) => {
  const current = normalizePackIds(currentPackIds);

  if (current.includes(nextPackId)) {
    return current.filter((id) => id !== nextPackId);
  }

  if (nextPackId === ESPACE_VENTE_PACK_ID) {
    const selectedFormula = current.find((id) => FORMULE_PACK_IDS.includes(id));
    return selectedFormula ? [selectedFormula, ESPACE_VENTE_PACK_ID] : [ESPACE_VENTE_PACK_ID];
  }

  if (FORMULE_PACK_IDS.includes(nextPackId)) {
    return current.includes(ESPACE_VENTE_PACK_ID)
      ? [nextPackId, ESPACE_VENTE_PACK_ID]
      : [nextPackId];
  }

  return [nextPackId];
};

export const getPackPrice = (pack, surface) => {
  if (!pack) return 0;
  if (!pack.perSquareMeter) return pack.price;

  const sqMeters = Number.parseInt(surface, 10) || 0;
  return pack.price * sqMeters;
};

export const getPackLineItems = (packIds, surface) => {
  return getSelectedPacks(packIds).map((pack) => {
    const price = getPackPrice(pack, surface);
    return {
      pack,
      quantity: 1,
      unitPrice: price,
      amount: price,
    };
  });
};

export const calculateSelectionPrices = (packIds, surface) => {
  const packPrice = getPackLineItems(packIds, surface).reduce((sum, item) => sum + item.amount, 0);
  const totaleHT = packPrice + DROITS_INTERVENTION;
  const tva = totaleHT * TVA_RATE;
  const totaleTTC = totaleHT + tva;

  return { packPrice, totaleHT, tva, totaleTTC };
};
