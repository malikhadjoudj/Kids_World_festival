const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const initialPacks = [
 {
    id: 'discover-fun',
    name: 'PACK DISCOVER & FUN',
    description: 'Exposition et animation — surface + électricité + 1 table + 3 chaises. Choix 12m² (220 000 DA) ou 24m² (380 000 DA).',
    price: 220000,
    perSquareMeter: false,
    surface: '12m² ou 24m² au choix',
    icon: '🎪'
  },
   {
    id: 'sell-win',
    name: 'PACK SELL & WIN',
    description: 'Vente — surface + électricité + 1 table + 3 chaises. Choix 12m² (220 000 DA) ou 24m² (380 000 DA).',
    price: 220000,
    perSquareMeter: false,
    surface: '12m² ou 24m² au choix',
    icon: '🛍️'
  },
  {
    id: 'espace-vente',
    name: 'Formule Espace Vente',
    description: 'Chapiteau aménagé pour la vente directe.',
    price: 234000,
    perSquareMeter: false,
    surface: '9m²',
    icon: '🛍️'
  },
  {
    id: 'espace-nu',
    name: 'Espace Nu',
    description: 'Espace libre à partir de 9m² pour stand personnalisé.',
    price: 12000,
    perSquareMeter: true,
    surface: 'min 9m²',
    icon: '📐'
  },
  {
    id: 'food',
    name: 'Espace Food',
    description: 'Emplacement dédié à la restauration.',
    price: 180000,
    perSquareMeter: false,
    surface: 'Sur mesure',
    icon: '🍔'
  },
  {
    id: 'pack-italie',
    name: 'Pack Sponsor Italie',
    description: 'Intégration logo photocall, espace d\'activation jusqu\'à 60 m², diffusion spot écrans géants, créneau animation scène.',
    price: 1200000,
    perSquareMeter: false,
    surface: 'Activation jusqu\'à 60 m²',
    icon: '🇮🇹'
  },
  {
    id: 'pack-turquie',
    name: 'Pack Sponsor Turquie',
    description: 'Panneaux grand format entrée, Pop-Up, logo scène principale, 2 créneaux animation, 150 m² + chapiteau 25 m².',
    price: 2200000,
    perSquareMeter: false,
    surface: 'Pack visibilité grand format',
    icon: '🇹🇷'
  },
  {
    id: 'pack-algerie',
    name: 'Pack Sponsor Algérie',
    description: 'Animations scène, branding arche entrée, Pop-Up exclusif, habillage barrières/allées, visibilité premium.',
    price: 4000000,
    perSquareMeter: false,
    surface: 'Activation Premium éco Park',
    icon: '🇩🇿'
  }
];

const initialStands = [
  { id: 'A1', surface: 25, packCompatible: 'all' },
  { id: 'A2', surface: 25, packCompatible: 'all' },
  { id: 'A3', surface: 25, packCompatible: 'all' },
  { id: 'A4', surface: 25, packCompatible: 'all' },
  { id: 'A5', surface: 25, packCompatible: 'all' },
  { id: 'A6', surface: 25, packCompatible: 'all' },
  { id: 'A7', surface: 25, packCompatible: 'all' },
  { id: 'A8', surface: 25, packCompatible: 'all' },
  { id: 'A9', surface: 25, packCompatible: 'all' },
  { id: 'A10', surface: 25, packCompatible: 'all' },
  { id: 'A11', surface: 25, packCompatible: 'all' },
  { id: 'A12', surface: 25, packCompatible: 'all' },
  { id: 'B1', surface: 18, packCompatible: 'all' },
  { id: 'B2', surface: 18, packCompatible: 'all' },
  { id: 'B3', surface: 18, packCompatible: 'all' },
  { id: 'B4', surface: 18, packCompatible: 'all' },
  { id: 'B5', surface: 18, packCompatible: 'all' },
  { id: 'B6', surface: 18, packCompatible: 'all' },
  { id: 'B7', surface: 18, packCompatible: 'all' },
  { id: 'B8', surface: 18, packCompatible: 'all' },
  { id: 'B9', surface: 18, packCompatible: 'all' },
  { id: 'B10', surface: 18, packCompatible: 'all' },
  { id: 'C1', surface: 50, packCompatible: 'all' },
  { id: 'C2', surface: 50, packCompatible: 'all' },
  { id: 'C3', surface: 50, packCompatible: 'all' },
  { id: 'C4', surface: 50, packCompatible: 'all' },
  { id: 'C5', surface: 50, packCompatible: 'all' },
  { id: 'C6', surface: 50, packCompatible: 'all' },
];

async function main() {
  console.log('Start seeding...');
  for (const p of initialPacks) {
    const pack = await prisma.pack.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
    console.log(`✅ Pack: ${pack.name}`);
  }
  for (const s of initialStands) {
    const stand = await prisma.stand.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
    console.log(`Stand: ${stand.id}`);
  }
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
