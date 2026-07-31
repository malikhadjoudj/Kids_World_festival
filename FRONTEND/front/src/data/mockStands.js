/**
 * Données des stands — basé sur le plan circulaire d'El Harrach (3 zones concentriques)
 *
 * Zone Extérieure  (5300 m²)  → Stands A1–A12 (grands emplacements)
 * Zone Intermédiaire (3800 m²) → Stands B1–B10 (emplacements moyens)
 * Zone Centrale    (1200 m²)  → Stands C1–C6  (petits emplacements premium)
 */

export const ZONES = [
  {
    id: 'ext',
    name: 'Zone Extérieure',
    surface: 5300,
    color: '#4CAF50',
    description: 'Anneau extérieur — grands stands',
  },
  {
    id: 'inter',
    name: 'Zone Intermédiaire',
    surface: 3800,
    color: '#2196F3',
    description: 'Anneau du milieu — stands moyens',
  },
  {
    id: 'centre',
    name: 'Zone Centrale',
    surface: 1200,
    color: '#FF9800',
    description: 'Cœur du site — emplacements premium',
  },
];

export const MOCK_STANDS = [
  // Zone Extérieure — A1 à A12
  { id: 'A1',  zone: 'ext',    surface: 25, angle: 0,   ring: 'outer' },
  { id: 'A2',  zone: 'ext',    surface: 25, angle: 30,  ring: 'outer' },
  { id: 'A3',  zone: 'ext',    surface: 25, angle: 60,  ring: 'outer' },
  { id: 'A4',  zone: 'ext',    surface: 25, angle: 90,  ring: 'outer' },
  { id: 'A5',  zone: 'ext',    surface: 25, angle: 120, ring: 'outer' },
  { id: 'A6',  zone: 'ext',    surface: 25, angle: 150, ring: 'outer' },
  { id: 'A7',  zone: 'ext',    surface: 25, angle: 180, ring: 'outer' },
  { id: 'A8',  zone: 'ext',    surface: 25, angle: 210, ring: 'outer' },
  { id: 'A9',  zone: 'ext',    surface: 25, angle: 240, ring: 'outer' },
  { id: 'A10', zone: 'ext',    surface: 25, angle: 270, ring: 'outer' },
  { id: 'A11', zone: 'ext',    surface: 25, angle: 300, ring: 'outer' },
  { id: 'A12', zone: 'ext',    surface: 25, angle: 330, ring: 'outer' },

  // Zone Intermédiaire — B1 à B10
  { id: 'B1',  zone: 'inter',  surface: 18, angle: 0,   ring: 'middle' },
  { id: 'B2',  zone: 'inter',  surface: 18, angle: 36,  ring: 'middle' },
  { id: 'B3',  zone: 'inter',  surface: 18, angle: 72,  ring: 'middle' },
  { id: 'B4',  zone: 'inter',  surface: 18, angle: 108, ring: 'middle' },
  { id: 'B5',  zone: 'inter',  surface: 18, angle: 144, ring: 'middle' },
  { id: 'B6',  zone: 'inter',  surface: 18, angle: 180, ring: 'middle' },
  { id: 'B7',  zone: 'inter',  surface: 18, angle: 216, ring: 'middle' },
  { id: 'B8',  zone: 'inter',  surface: 18, angle: 252, ring: 'middle' },
  { id: 'B9',  zone: 'inter',  surface: 18, angle: 288, ring: 'middle' },
  { id: 'B10', zone: 'inter',  surface: 18, angle: 324, ring: 'middle' },

  // Zone Centrale — C1 à C6
  { id: 'C1',  zone: 'centre', surface: 50, angle: 0,   ring: 'inner' },
  { id: 'C2',  zone: 'centre', surface: 50, angle: 60,  ring: 'inner' },
  { id: 'C3',  zone: 'centre', surface: 50, angle: 120, ring: 'inner' },
  { id: 'C4',  zone: 'centre', surface: 50, angle: 180, ring: 'inner' },
  { id: 'C5',  zone: 'centre', surface: 50, angle: 240, ring: 'inner' },
  { id: 'C6',  zone: 'centre', surface: 50, angle: 300, ring: 'inner' },
];
