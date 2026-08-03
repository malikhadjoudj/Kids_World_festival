import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialPacks = [
  {
    id: 'standard',
    name: 'Formule Standard',
    description: 'Espace aménagé 9m² avec structure modulaire.',
    price: 465000,
    perSquareMeter: false,
    surface: '9m²',
    icon: '✨'
  },
  {
    id: 'expo-plus',
    name: 'Formule Expo Plus',
    description: 'Espace aménagé 15m² avec emplacement premium.',
    price: 765000,
    perSquareMeter: false,
    surface: '15m²',
    icon: '🚀'
  },
  {
    id: 'espace-vente',
    name: 'Formule Espace Vente',
    description: 'Chapiteau aménagé pour la vente directe.',
    price: 249000,
    perSquareMeter: false,
    surface: '9m²',
    icon: '🛍️'
  },
  {
    id: 'espace-nu',
    name: 'Espace Nu',
    description: 'Espace libre à partir de 9m² pour stand personnalisé.',
    price: 12500,
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
    console.log(`Created/Updated pack with id: ${pack.id}`);
  }
  for (const s of initialStands) {
    const stand = await prisma.stand.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
    console.log(`Created/Updated stand with id: ${stand.id}`);
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
