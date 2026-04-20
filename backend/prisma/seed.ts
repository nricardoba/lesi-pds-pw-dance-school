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

  await prisma.user.upsert({
    where: { userId: 1 },
    update: {
      userName: "Administrador",
      userTypeId: 1,
      userIsActive: true,
    },
    create: {
      userId: 1,
      userName: "Administrador",
      userTypeId: 1,
      userIsActive: true,
    },
  });

  await prisma.contact.upsert({
    where: { contactId: 1 },
    update: {
      contactValue: "admin@admin.com",
      contactTypeId: 2,
    },
    create: {
      contactId: 1,
      contactValue: "admin@admin.com",
      contactTypeId: 2,
    },
  });

  await prisma.userContact.upsert({
    where: { userContactId: 1 },
    update: {
      userId: 1,
      contactId: 1,
      isMainContact: true,
    },
    create: {
      userContactId: 1,
      userId: 1,
      contactId: 1,
      isMainContact: true,
    },
  });

  await prisma.userCredential.upsert({
    where: { userId: 1 },
    update: {
      userContactId: 1,
      userCredentialPasswordHash: passwordHash,
    },
    create: {
      userId: 1,
      userContactId: 1,
      userCredentialPasswordHash: passwordHash,
    },
  });

  console.log("✔ Admin user seed complete.");

  // 6. Professor
  const profPasswordHash = await bcrypt.hash("Prof123!", 10);

  await prisma.user.upsert({
    where: { userId: 2 },
    update: {
      userName: "Professor Teste",
      userTypeId: 2,
      userIsActive: true,
    },
    create: {
      userId: 2,
      userName: "Professor Teste",
      userTypeId: 2,
      userIsActive: true,
    },
  });

  await prisma.contact.upsert({
    where: { contactId: 2 },
    update: {
      contactValue: "professor@professor.com",
      contactTypeId: 2,
    },
    create: {
      contactId: 2,
      contactValue: "professor@professor.com",
      contactTypeId: 2,
    },
  });

  await prisma.userContact.upsert({
    where: { userContactId: 2 },
    update: {
      userId: 2,
      contactId: 2,
      isMainContact: true,
    },
    create: {
      userContactId: 2,
      userId: 2,
      contactId: 2,
      isMainContact: true,
    },
  });

  await prisma.userCredential.upsert({
    where: { userId: 2 },
    update: {
      userContactId: 2,
      userCredentialPasswordHash: profPasswordHash,
    },
    create: {
      userId: 2,
      userContactId: 2,
      userCredentialPasswordHash: profPasswordHash,
    },
  });

  console.log("✔ Professor user seed complete.");

  // 7. Aluno
  const alunoPasswordHash = await bcrypt.hash("Aluno123!", 10);

  await prisma.user.upsert({
    where: { userId: 3 },
    update: {
      userName: "Aluno Teste",
      userTypeId: 3,
      userIsActive: true,
    },
    create: {
      userId: 3,
      userName: "Aluno Teste",
      userTypeId: 3,
      userIsActive: true,
    },
  });

  await prisma.contact.upsert({
    where: { contactId: 3 },
    update: {
      contactValue: "aluno@aluno.com",
      contactTypeId: 2,
    },
    create: {
      contactId: 3,
      contactValue: "aluno@aluno.com",
      contactTypeId: 2,
    },
  });

  await prisma.userContact.upsert({
    where: { userContactId: 3 },
    update: {
      userId: 3,
      contactId: 3,
      isMainContact: true,
    },
    create: {
      userContactId: 3,
      userId: 3,
      contactId: 3,
      isMainContact: true,
    },
  });

  await prisma.userCredential.upsert({
    where: { userId: 3 },
    update: {
      userContactId: 3,
      userCredentialPasswordHash: alunoPasswordHash,
    },
    create: {
      userId: 3,
      userContactId: 3,
      userCredentialPasswordHash: alunoPasswordHash,
    },
  });

  console.log("✔ Aluno user seed complete.");

  // 8. Inventory initial data
  console.log("Seeding inventory data...");

  // Add Categories
  const category1 = await prisma.category.upsert({ where: { categoryName: "Ballet" }, update: {}, create: { categoryName: "Ballet" } });
  const category2 = await prisma.category.upsert({ where: { categoryName: "Contemporâneo" }, update: {}, create: { categoryName: "Contemporâneo" } });
  
  // Add Colors
  const color1 = await prisma.color.upsert({ where: { colorName: "Branco" }, update: {}, create: { colorName: "Branco" } });
  const color2 = await prisma.color.upsert({ where: { colorName: "Preto" }, update: {}, create: { colorName: "Preto" } });

  // Add Sizes
  const size1 = await prisma.size.upsert({ where: { sizeName: "S" }, update: {}, create: { sizeName: "S" } });
  const size2 = await prisma.size.upsert({ where: { sizeName: "M" }, update: {}, create: { sizeName: "M" } });

  // Add Item Condition
  const conditionNew = await prisma.itemCondition.upsert({ where: { itemConditionName: "Novo" }, update: {}, create: { itemConditionName: "Novo" } });
  
  // Add Item Characteristic
  const char1 = await prisma.itemCharacteristics.create({
    data: {
      itemCharacteristicsName: "Tutu Clássico",
      categoryId: category1.categoryId,
      colorId: color1.colorId,
      sizeId: size1.sizeId,
    }
  });

  const char2 = await prisma.itemCharacteristics.create({
    data: {
      itemCharacteristicsName: "Collants",
      categoryId: category2.categoryId,
      colorId: color2.colorId,
      sizeId: size2.sizeId,
    }
  });

  // Add Items
  const item1 = await prisma.item.create({
    data: {
      itemCharacteristicsId: char1.itemCharacteristicsId,
      itemConditionId: conditionNew.itemConditionId,
    }
  });

  const item2 = await prisma.item.create({
    data: {
      itemCharacteristicsId: char2.itemCharacteristicsId,
      itemConditionId: conditionNew.itemConditionId,
    }
  });

  await prisma.schoolItem.create({
    data: {
      itemId: item1.itemId,
      rentFee: 10.00,
    }
  });

  await prisma.schoolItem.create({
    data: {
      itemId: item2.itemId,
      rentFee: 5.00,
    }
  });

  console.log("✔ Inventory seed complete.");

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
