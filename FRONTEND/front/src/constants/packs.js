/**
 * Grille tarifaire officielle - KIDS WORLD FESTIVAL
 * Source : Cahier des charges section 4
 */

export const DROITS_INTERVENTION = 15000;
export const TVA_RATE = 0.19;
export const ESPACE_VENTE_PACK_ID = 'espace-vente';
export const FORMULE_PACK_IDS = ['standard', 'expo-plus'];

export const PACKS = [
  {
    id: 'standard',
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
    id: ESPACE_VENTE_PACK_ID,
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
