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
    description: 'Intégration logo photocall, espace d\'activation , diffusion spot écrans géants, créneau animation scène.',
    price: 1200000,
    perSquareMeter: false,
    surface: 'Activation ',
    icon: '🇮🇹'
  },
  {
    id: 'pack-turquie',
    name: 'Pack Sponsor Turquie',
    description: 'Panneaux grand format entrée, Pop-Up, logo scène principale, 2 créneaux animation.',
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
    surface: 'Activation Premium ',
    icon: '🇩🇿'
  }
];

const initialStands = [];

// 1. Sponsor Stands (SP01 - SP20) - 50m²
for (let i = 1; i <= 7; i++) {
  initialStands.push({ id: `SP0${i}`, surface: 50, packCompatible: 'all', x: 180 + i * 50, y: 170 });
}
for (let i = 8; i <= 9; i++) {
  initialStands.push({ id: `SP0${i}`, surface: 50, packCompatible: 'all', x: 580, y: 150 + (i - 7) * 50 });
}
for (let i = 10; i <= 11; i++) {
  initialStands.push({ id: `SP${i}`, surface: 50, packCompatible: 'all', x: 580, y: 150 + (i - 7) * 50 });
}
for (let i = 12; i <= 16; i++) {
  initialStands.push({ id: `SP${i}`, surface: 50, packCompatible: 'all', x: 230 + (i - 11) * 50, y: 430 });
}
for (let i = 17; i <= 20; i++) {
  initialStands.push({ id: `SP${i}`, surface: 50, packCompatible: 'all', x: 140, y: 220 + (i - 16) * 45 });
}

// 2. Chapiteaux (C01 - C25) - 12m²
for (let i = 1; i <= 5; i++) {
  initialStands.push({ id: `C0${i}`, surface: 12, packCompatible: 'all', x: 160 + i * 25, y: 470 });
}
for (let i = 6; i <= 9; i++) {
  initialStands.push({ id: `C0${i}`, surface: 12, packCompatible: 'all', x: 160 + (i - 5) * 25, y: 505 });
}
initialStands.push({ id: 'C10', surface: 12, packCompatible: 'all', x: 160 + 5 * 25, y: 505 });

for (let i = 11; i <= 15; i++) {
  initialStands.push({ id: `C${i}`, surface: 12, packCompatible: 'all', x: 480 + (i - 10) * 22, y: 360 });
}
for (let i = 16; i <= 20; i++) {
  initialStands.push({ id: `C${i}`, surface: 12, packCompatible: 'all', x: 490 + (i - 15) * 22, y: 385 });
}
for (let i = 21; i <= 25; i++) {
  initialStands.push({ id: `C${i}`, surface: 12, packCompatible: 'all', x: 510 + (i - 20) * 22, y: 410 });
}

// 3. Espace Nu (NU01 - NU10) - 30m²
for (let i = 1; i <= 9; i++) {
  initialStands.push({ id: `NU0${i}`, surface: 30, packCompatible: 'all', x: 140 + i * 35, y: 120 });
}
initialStands.push({ id: 'NU10', surface: 30, packCompatible: 'all', x: 140 + 10 * 35, y: 120 });

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
