import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // 1. Tipos de Utilizador (UserType)
  const userTypes = [
    { userTypeDesc: "Admin" },
    { userTypeDesc: "Professor" },
    { userTypeDesc: "Aluno" },
    { userTypeDesc: "Encarregado de Educação" },
  ];

  for (const ut of userTypes) {
    await prisma.userType.upsert({
      where: { userTypeDesc: ut.userTypeDesc },
      update: {},
      create: ut,
    });
  }
  console.log("✔ UserType seed complete.");

  // 2. Estados das Aulas (ClassStatus)
  const classStatuses = [
    { classStatusDesc: "Agendada" },
    { classStatusDesc: "A Decorrer" },
    { classStatusDesc: "Concluída" },
    { classStatusDesc: "Cancelada" },
  ];

  for (const cs of classStatuses) {
    await prisma.classStatus.upsert({
      where: { classStatusDesc: cs.classStatusDesc },
      update: {},
      create: cs,
    });
  }
  console.log("✔ ClassStatus seed complete.");

  // 3. Tipos de Contacto (ContactType)
  const contactTypes = [
    { contactTypeDesc: "Telemóvel" },
    { contactTypeDesc: "Email" },
    { contactTypeDesc: "Telefone Fixo" },
  ];

  for (const ct of contactTypes) {
    await prisma.contactType.upsert({
      where: { contactTypeDesc: ct.contactTypeDesc },
      update: {},
      create: ct,
    });
  }
  console.log("✔ ContactType seed complete.");

  // 4. Papéis na Aula (UserClassRole)
  const userClassRoles = [
    { userClassRoleDesc: "Professor Responsável" },
    { userClassRoleDesc: "Professor Assistente" },
    { userClassRoleDesc: "Aluno" },
  ];

  for (const role of userClassRoles) {
    await prisma.userClassRole.upsert({
      where: { userClassRoleDesc: role.userClassRoleDesc },
      update: {},
      create: role,
    });
  }
  console.log("✔ UserClassRole seed complete.");

  // 5. Admin
  const passwordHash = await bcrypt.hash("Admin123!", 10);

  await prisma.user.create({
    data: {
      userId: 1,
      userName: "Administrador",
      userTypeId: 1,
      userIsActive: true,
    },
  });

  await prisma.contact.create({
    data: {
      contactId: 1,
      contactValue: "admin@admin.com",
      contactTypeId: 2,
    },
  });

  await prisma.userContact.create({
    data: {
      userContactId: 1,
      userId: 1,
      contactId: 1,
      isMainContact: true,
    },
  });

  await prisma.userCredential.create({
    data: {
      userId: 1,
      userContactId: 1,
      userCredentialPasswordHash: passwordHash,
    },
  });

  console.log("✔ Admin user seed complete.");
  console.log("Seeding finished successfully.");
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