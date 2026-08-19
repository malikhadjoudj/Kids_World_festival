/**
 * Grille tarifaire officielle - KIDS WORLD FESTIVAL
 * Source : Cahier des charges section 4
 */

export const DROITS_INTERVENTION = 15000;
export const TVA_RATE = 0.19;
export const FORMULE_PACK_IDS = ['discover & fun', 'sell & win', 'pack-italie', 'pack-turquie', 'pack-algerie'];
// Packs whose surface (16 m² / 24 m²) is chosen upfront, directly on the pack card
export const TIER_SURFACE_PACK_IDS = ['discover-fun', 'sell-win'];
export const PACKS = [
  {
   id: 'discover-fun',
    category: 'formule',
    name: 'PACK DISCOVER & FUN',
    subtitle: 'Exposition et animation',
    priceLabel: '220 000 - 380 000 DA',
    surface: '16 m² ou 24 m² au choix',
    chapiteau: true,
    icon: '🎪',
    color: 'var(--color-primary)',
    features: [
      'Surface couverte sous chapiteau',
      'Raccordement électrique',
      '1 table incluse',
      '3 chaises incluses',
    ],
    surfaceTiers: [
      { surface: 16, price: 220000, priceLabel: '220 000 DA' },
      { surface: 24, price: 380000, priceLabel: '380 000 DA' },
    ],
    popular: true,
  },
  {
    id: 'sell-win',
    category: 'formule',
    name: 'PACK SELL & WIN',
    subtitle: 'Vente',
    priceLabel: '220 000 - 380 000 DA',
    surface: '16 m² ou 24 m² au choix',
    chapiteau: true,
    icon: '🛍️',
    color: 'var(--color-success)',
    features: [
      'Surface couverte sous chapiteau',
      'Raccordement électrique',
      '1 table incluse',
      '3 chaises incluses',
    ],
    surfaceTiers: [
      { surface: 16, price: 220000, priceLabel: '220 000 DA' },
      { surface: 24, price: 380000, priceLabel: '380 000 DA' },
    ],
    popular: false,
  },
  {
    id: 'pack-italie',
    category: 'sponsor',
    name: 'Pack Sponsor Italie',
    price: 1200000,
    priceLabel: '1 200 000 DA',
    surface: 'Activation ',
    chapiteau: false,
    icon: '🇮🇹',
    color: 'var(--color-tertiary)',
    features: [
      'Intégration de votre logo sur le photocall officiel et les espaces de prise de photos',
      'Espace d’activation  pouvanta acceuillir un stand jusqu/a 60 m²',
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
    surface: 'Espace d’exposition de 150 m²',
    chapiteau: false,
    icon: '🇹🇷',
    color: 'var(--color-warning)',
    features: [
      'Panneaux publicitaires grand format à l’entrée principale',
      "Pop-Up à l’entrée du festival pour assurer l'orientation des visiteurs et maximiser la visibilité de votre marque",
      'Logo sur la scène principale et panneaux de signalétique',
      "Diffusion de votre spot publicitaire sur le grand écran géant tout au long de l'événement.",
      '2 créneaux de 15 min pour animation de marque',
      'Espace d’exposition de 150 m²  pour votre activation de marque, + chapiteau de 25 m² dédié à la vente ou à la présentation de vos produits.',
    ],
    popular: false,
  },
  {
    id: 'pack-algerie',
    category: 'sponsor',
    name: 'Pack Sponsor Algérie',
    price: 4000000,
    priceLabel: '4 000 000 DA',
    surface: 'Activation Premium — 180 m² et plus',
    requiresSurface: true,
    minSurface: 180,
    surfacePlaceholder: '180 m² et plus',
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
      'branding drapeau sur tout les potos du site  Ecoloh',
      "Branding exclusif de zone Détente,avec un habillage aux couleurs de votre marque (parasols, mobilier, PLV, mange-debout, etc. fournis par le sponsor).",
      "Insertion d'une publicité dans le guide officiel du festival.",
      
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
  type: 'Salon B2B2C',
  description:
    "Un salon B2B2C mettant en relation l'agence organisatrice avec des marques et exposants souhaitant tenir un stand, dans un univers ludique dedie aux enfants.",
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
  return normalizedIds[0] || '';
};
export const togglePackSelection = (currentPackIds, nextPackId) => {
  const current = normalizePackIds(currentPackIds);

  if (current.includes(nextPackId)) {
    return current.filter((id) => id !== nextPackId);
  }

  let nextSelection = [...current, nextPackId];

  const isSponsor = (id) => ['pack-italie', 'pack-turquie', 'pack-algerie'].includes(id);
  const isFormule = (id) => ['discover-fun', 'sell-win'].includes(id);
  const isNu = (id) => id === 'espace-nu';

  // Rule 1: Max 1 sponsor pack
  if (isSponsor(nextPackId)) {
    nextSelection = nextSelection.filter(id => id === nextPackId || !isSponsor(id));
  }

  // Rule 2 & 3: Espace Nu is mutually exclusive with Formules
  if (isNu(nextPackId)) {
    nextSelection = nextSelection.filter(id => !isFormule(id));
  } else if (isFormule(nextPackId)) {
    nextSelection = nextSelection.filter(id => !isNu(id));
  }

  return nextSelection;
};

/**
 * `surfaces` is a map of { [packId]: surfaceInSqMeters }, so that each pack
 * (Discover & Fun, Sell & Win, Espace Nu, Pack Algérie...) can carry its own
 * independent surface value instead of sharing a single global value.
 */
export const getPackPrice = (pack, surfaces) => {
  if (!pack) return 0;
  const sqMeters = Number.parseInt(surfaces ? surfaces[pack.id] : undefined, 10);

  if (pack.surfaceTiers) {
    const tier = pack.surfaceTiers.find((t) => t.surface === sqMeters);
    return tier ? tier.price : 0;
  }
  if (!pack.perSquareMeter) return pack.price;

  return pack.price * (Number.isNaN(sqMeters) ? 0 : sqMeters);
};

export const getPackLineItems = (packIds, surfaces) => {
  return getSelectedPacks(packIds).map((pack) => {
    const price = getPackPrice(pack, surfaces);
    return {
      pack,
      quantity: 1,
      unitPrice: price,
      amount: price,
    };
  });
};

export const calculateSelectionPrices = (packIds, surfaces) => {
  const packPrice = getPackLineItems(packIds, surfaces).reduce((sum, item) => sum + item.amount, 0);
  const totaleHT = packPrice + DROITS_INTERVENTION;
  const tva = totaleHT * TVA_RATE;
  const totaleTTC = totaleHT + tva;

  return { packPrice, totaleHT, tva, totaleTTC };
};

// ─── Surfaces map <-> URL query string helpers ───────────────────────────
// Encodes as "discover-fun:16,sell-win:24" so it can travel in a URL param.
export const serializeSurfaces = (surfaces) => {
  if (!surfaces) return '';
  return Object.entries(surfaces)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([id, value]) => `${id}:${value}`)
    .join(',');
};

export const parseSurfaces = (value) => {
  if (!value) return {};
  return String(value)
    .split(',')
    .reduce((acc, entry) => {
      const [id, surface] = entry.split(':');
      const parsed = Number.parseInt(surface, 10);
      if (id && !Number.isNaN(parsed)) {
        acc[id.trim()] = parsed;
      }
      return acc;
    }, {});
};
