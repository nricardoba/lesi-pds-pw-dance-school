import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding user types...");

  const userTypes = ["Admin", "Professor", "Aluno"];

  await prisma.userType.deleteMany({
    where: {
      userTypeDesc: { notIn: userTypes },
    },
  });

  await prisma.userType.createMany({
    data: userTypes.map((userTypeDesc) => ({ userTypeDesc })),
    skipDuplicates: true,
  });

  console.log("✔ UserType seed complete.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    // @ts-ignore - Caso o @types/node ainda dê erro de linting
    if (typeof process !== "undefined") process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
