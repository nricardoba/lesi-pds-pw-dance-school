const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  console.log("AULAS NA BD:", await prisma.class.findMany());
  console.log("ANOS LETIVOS:", await prisma.schoolYear.findMany());
  console.log("STUDIOS MODALITIES:", await prisma.studioModality.findMany());
}
check();
