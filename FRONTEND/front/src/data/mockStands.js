/**
 * Données des stands — basé sur le nouveau plan du Parc Écoloh (Les Sablettes)
 *
 * Zone Sponsors   → Stands SP01–SP20 (grands emplacements, blancs)
 * Zone Chapiteaux → Stands C01–C25  (emplacements moyens, verts)
 * Zone Option     → Stands NU01–NU10 (espace nu)
 */

export const ZONES = [
  {
    id: 'sponsor',
    name: 'Espaces Sponsors',
    surface: 3500,
    color: '#06D6A0',
    description: 'Emplacements réservés aux sponsors officiels',
  },
  {
    id: 'chapiteau',
    name: 'Espaces Chapiteaux',
    surface: 1800,
    color: '#FF6B35',
    description: 'Espaces couverts sous chapiteau',
  },
  {
    id: 'option',
    name: 'Espace Nu / Options',
    surface: 1200,
    color: '#1B4965',
    description: 'Emplacements nus personnalisables',
  },
];

// Helper to generate new layout default stands
const generateMockStands = () => {
  const list = [];

  // 1. Sponsor Stands (SP01 - SP20) - 50m²
  // Top Walkway SP01 - SP07
  for (let i = 1; i <= 7; i++) {
    list.push({ id: `SP0${i}`, zone: 'sponsor', surface: 50, x: 180 + i * 50, y: 170, rotation: 0 });
  }
  // Right Walkway SP08 - SP11
  for (let i = 8; i <= 9; i++) {
    list.push({ id: `SP0${i}`, zone: 'sponsor', surface: 50, x: 580, y: 150 + (i - 7) * 50, rotation: 90 });
  }
  for (let i = 10; i <= 11; i++) {
    list.push({ id: `SP${i}`, zone: 'sponsor', surface: 50, x: 580, y: 150 + (i - 7) * 50, rotation: 90 });
  }
  // Bottom Walkway SP12 - SP16
  for (let i = 12; i <= 16; i++) {
    list.push({ id: `SP${i}`, zone: 'sponsor', surface: 50, x: 230 + (i - 11) * 50, y: 430, rotation: 0 });
  }
  // Left Walkway SP17 - SP20
  for (let i = 17; i <= 20; i++) {
    list.push({ id: `SP${i}`, zone: 'sponsor', surface: 50, x: 140, y: 220 + (i - 16) * 45, rotation: 90 });
  }

  // 2. Chapiteaux (C01 - C25) - 12m² default
  // Group A (bottom-left green dots)
  for (let i = 1; i <= 5; i++) {
    list.push({ id: `C0${i}`, zone: 'chapiteau', surface: 12, x: 160 + i * 25, y: 470, rotation: 0 });
  }
  for (let i = 6; i <= 9; i++) {
    list.push({ id: `C0${i}`, zone: 'chapiteau', surface: 12, x: 160 + (i - 5) * 25, y: 505, rotation: 0 });
  }
  list.push({ id: 'C10', zone: 'chapiteau', surface: 12, x: 160 + 5 * 25, y: 505, rotation: 0 });

  // Group B (right-middle green dots)
  for (let i = 11; i <= 15; i++) {
    list.push({ id: `C${i}`, zone: 'chapiteau', surface: 12, x: 480 + (i - 10) * 22, y: 360, rotation: 0 });
  }
  for (let i = 16; i <= 20; i++) {
    list.push({ id: `C${i}`, zone: 'chapiteau', surface: 12, x: 490 + (i - 15) * 22, y: 385, rotation: 0 });
  }
  for (let i = 21; i <= 25; i++) {
    list.push({ id: `C${i}`, zone: 'chapiteau', surface: 12, x: 510 + (i - 20) * 22, y: 410, rotation: 0 });
  }

  // 3. Espace Nu (NU01 - NU10) - 30m²
  for (let i = 1; i <= 9; i++) {
    list.push({ id: `NU0${i}`, zone: 'option', surface: 30, x: 140 + i * 35, y: 120, rotation: 0 });
  }
  list.push({ id: 'NU10', zone: 'option', surface: 30, x: 140 + 10 * 35, y: 120, rotation: 0 });

  return list;
};

export const MOCK_STANDS = generateMockStands();
