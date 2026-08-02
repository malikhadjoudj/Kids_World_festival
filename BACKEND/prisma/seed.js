const { PrismaClient } = require('@prisma/client');

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
