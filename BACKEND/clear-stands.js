const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.exposant.updateMany({
    data: { standId: null }
  });
  await prisma.stand.deleteMany({});
  console.log('All stands deleted and unassigned from exposants');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
