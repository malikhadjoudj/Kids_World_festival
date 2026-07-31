/**
 * Grille tarifaire officielle — KIDS WORLD FESTIVAL
 * Source : Cahier des charges §4
 */

export const DROITS_INTERVENTION = 15000; // DA — appliqués à chaque exposant

export const PACKS = [
  {
    id: 'standard',
    name: 'Formule Standard',
    price: 450000,
    priceLabel: '450 000 DA',
    surface: "jusqu'à 25 m²",
    chapiteau: true,
    icon: '🏕️',
    color: 'var(--color-primary)',
    features: [
      'Surface couverte sous chapiteau',
      'Raccordement électrique',
      '1 table incluse',
      '2 chaises incluses',
      "Jusqu'à 25 m² d'espace",
    ],
    popular: false,
  },
  {
    id: 'expo-plus',
    name: 'Formule Expo Plus',
    price: 750000,
    priceLabel: '750 000 DA',
    surface: "jusqu'à 50 m²",
    chapiteau: true,
    icon: '🎪',
    color: 'var(--color-accent)',
    features: [
      'Surface couverte sous chapiteau',
      'Raccordement électrique',
      '1 table incluse',
      '2 chaises incluses',
      "Jusqu'à 50 m² d'espace",
      'Visibilité premium',
    ],
    popular: true,
  },
  {
    id: 'espace-vente',
    name: 'Espace Vente',
    price: 234000,
    priceLabel: '234 000 DA',
    surface: "jusqu'à 18 m²",
    chapiteau: true,
    icon: '🛍️',
    color: 'var(--color-success)',
    features: [
      'Surface couverte sous chapiteau',
      'Raccordement électrique',
      '1 table incluse',
      '2 chaises incluses',
      "Jusqu'à 18 m² d'espace",
    ],
    popular: false,
  },
  {
    id: 'espace-nu',
    name: 'Espace Nu',
    price: 12000,
    priceLabel: '12 000 DA/m²',
    surface: 'selon m² choisis',
    chapiteau: false,
    icon: '📐',
    color: 'var(--color-secondary)',
    features: [
      'Surface brute',
      'Sans aménagement inclus',
      'Liberté totale de configuration',
      'Surface au choix',
    ],
    popular: false,
    perSquareMeter: true,
  },
];

export const EVENT_INFO = {
  name: 'KIDS WORLD FESTIVAL',
  tagline: 'Le Dernier Voyage Avant la Rentrée Scolaire',
  organizer: 'MELEVEN',
  type: 'Salon B2B',
  description:
    "Un salon B2B mettant en relation l'agence organisatrice avec des marques et exposants souhaitant tenir un stand, dans un univers ludique dédié aux enfants.",
};
