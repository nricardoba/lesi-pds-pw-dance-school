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

  // 4.1 Address Core Entities
  const locality = await prisma.locality.upsert({
    where: { localityId: 1 },
    update: { localityName: "Braga" },
    create: { localityId: 1, localityName: "Braga" },
  });

  const postalCode = await prisma.postalCode.upsert({
    where: { postalCode: "4700-000" },
    update: { localityId: locality.localityId },
    create: { postalCode: "4700-000", localityId: locality.localityId },
  });

  const address = await prisma.address.upsert({
    where: { streetId: 1 },
    update: { streetName: "Rua do Administrador 123", postalCode: postalCode.postalCode },
    create: { streetId: 1, streetName: "Rua do Administrador 123", postalCode: postalCode.postalCode },
  });

  // 5. Admin
  const passwordHash = await bcrypt.hash("Admin123!", 10);

  await prisma.user.upsert({
    where: { userId: 1 },
    update: {
      userName: "Administrador",
      userTypeId: 1,
      userIsActive: true,
      userBirthDate: new Date("1980-01-01T00:00:00Z"),
      userStartDate: new Date("2020-09-01T00:00:00Z"),
    },
    create: {
      userId: 1,
      userName: "Administrador",
      userTypeId: 1,
      userIsActive: true,
      userBirthDate: new Date("1980-01-01T00:00:00Z"),
      userStartDate: new Date("2020-09-01T00:00:00Z"),
    },
  });

  await prisma.userNIF.upsert({
    where: { userId: 1 },
    update: { userNif: "111111111" },
    create: { userId: 1, userNif: "111111111" },
  });

  await prisma.userAddress.upsert({
    where: { userAddressId: 1 },
    update: { userId: 1, streetId: address.streetId, isMainAddress: true },
    create: { userAddressId: 1, userId: 1, streetId: address.streetId, isMainAddress: true },
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

  await prisma.contact.upsert({
    where: { contactId: 4 },
    update: { contactValue: "+351910000001", contactTypeId: 1 },
    create: { contactId: 4, contactValue: "+351910000001", contactTypeId: 1 },
  });

  await prisma.userContact.upsert({
    where: { userContactId: 4 },
    update: { userId: 1, contactId: 4, isMainContact: false },
    create: { userContactId: 4, userId: 1, contactId: 4, isMainContact: false },
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

  const addressProf = await prisma.address.upsert({
    where: { streetId: 2 },
    update: { streetName: "Rua do Professor Teste 456", postalCode: postalCode.postalCode },
    create: { streetId: 2, streetName: "Rua do Professor Teste 456", postalCode: postalCode.postalCode },
  });

  await prisma.user.upsert({
    where: { userId: 2 },
    update: {
      userName: "Professor Teste",
      userTypeId: 2,
      userIsActive: true,
      userBirthDate: new Date("1990-05-15T00:00:00Z"),
      userStartDate: new Date("2021-09-01T00:00:00Z"),
    },
    create: {
      userId: 2,
      userName: "Professor Teste",
      userTypeId: 2,
      userIsActive: true,
      userBirthDate: new Date("1990-05-15T00:00:00Z"),
      userStartDate: new Date("2021-09-01T00:00:00Z"),
    },
  });

  await prisma.userNIF.upsert({
    where: { userId: 2 },
    update: { userNif: "222222222" },
    create: { userId: 2, userNif: "222222222" },
  });

  await prisma.userAddress.upsert({
    where: { userAddressId: 2 },
    update: { userId: 2, streetId: addressProf.streetId, isMainAddress: true },
    create: { userAddressId: 2, userId: 2, streetId: addressProf.streetId, isMainAddress: true },
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

  await prisma.contact.upsert({
    where: { contactId: 5 },
    update: { contactValue: "+351920000002", contactTypeId: 1 },
    create: { contactId: 5, contactValue: "+351920000002", contactTypeId: 1 },
  });

  await prisma.userContact.upsert({
    where: { userContactId: 5 },
    update: { userId: 2, contactId: 5, isMainContact: false },
    create: { userContactId: 5, userId: 2, contactId: 5, isMainContact: false },
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

  const addressAluno = await prisma.address.upsert({
    where: { streetId: 3 },
    update: { streetName: "Rua do Aluno Teste 789", postalCode: postalCode.postalCode },
    create: { streetId: 3, streetName: "Rua do Aluno Teste 789", postalCode: postalCode.postalCode },
  });

  await prisma.user.upsert({
    where: { userId: 3 },
    update: {
      userName: "Aluno Teste",
      userTypeId: 3,
      userIsActive: true,
      userBirthDate: new Date("2010-10-20T00:00:00Z"),
      userStartDate: new Date("2023-09-01T00:00:00Z"),
    },
    create: {
      userId: 3,
      userName: "Aluno Teste",
      userTypeId: 3,
      userIsActive: true,
      userBirthDate: new Date("2010-10-20T00:00:00Z"),
      userStartDate: new Date("2023-09-01T00:00:00Z"),
    },
  });

  await prisma.userNIF.upsert({
    where: { userId: 3 },
    update: { userNif: "333333333" },
    create: { userId: 3, userNif: "333333333" },
  });

  await prisma.userAddress.upsert({
    where: { userAddressId: 3 },
    update: { userId: 3, streetId: addressAluno.streetId, isMainAddress: true },
    create: { userAddressId: 3, userId: 3, streetId: addressAluno.streetId, isMainAddress: true },
  });

  await prisma.studentNumber.upsert({
    where: { userId: 3 },
    update: { studentNumber: "a12345" },
    create: { userId: 3, studentNumber: "a12345" },
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

  await prisma.contact.upsert({
    where: { contactId: 6 },
    update: { contactValue: "+351930000003", contactTypeId: 1 },
    create: { contactId: 6, contactValue: "+351930000003", contactTypeId: 1 },
  });

  await prisma.userContact.upsert({
    where: { userContactId: 6 },
    update: { userId: 3, contactId: 6, isMainContact: false },
    create: { userContactId: 6, userId: 3, contactId: 6, isMainContact: false },
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

  // 8. Anos Letivos (SchoolYear)
  console.log("Seeding school years data...");
  const currentYear = new Date().getFullYear();
  const schoolYears = [
    {
      schoolYearName: `${currentYear}/${currentYear + 1}`,
      schoolYearStart: new Date(`${currentYear}-09-01T00:00:00Z`),
      schoolYearEnd: new Date(`${currentYear + 1}-07-31T00:00:00Z`),
    }
  ];

  for (const sy of schoolYears) {
    await prisma.schoolYear.upsert({
      where: { schoolYearName: sy.schoolYearName },
      update: {
        schoolYearStart: sy.schoolYearStart,
        schoolYearEnd: sy.schoolYearEnd
      },
      create: sy,
    });
  }
  console.log("✔ SchoolYear seed complete.");

  // 9. Inventory initial data
  console.log("Seeding inventory data...");

  // Add Categories
  const category1 = await prisma.category.upsert({
    where: { categoryName: "Ballet" },
    update: {},
    create: { categoryName: "Ballet" },
  });
  const category2 = await prisma.category.upsert({
    where: { categoryName: "Contemporâneo" },
    update: {},
    create: { categoryName: "Contemporâneo" },
  });

  // Add Colors
  const color1 = await prisma.color.upsert({
    where: { colorName: "Branco" },
    update: {},
    create: { colorName: "Branco" },
  });
  const color2 = await prisma.color.upsert({
    where: { colorName: "Preto" },
    update: {},
    create: { colorName: "Preto" },
  });

  // Add Sizes
  const size1 = await prisma.size.upsert({
    where: { sizeName: "S" },
    update: {},
    create: { sizeName: "S" },
  });
  const size2 = await prisma.size.upsert({
    where: { sizeName: "M" },
    update: {},
    create: { sizeName: "M" },
  });

  // Add Item Condition
  const conditionNew = await prisma.itemCondition.upsert({
    where: { itemConditionName: "Novo" },
    update: {},
    create: { itemConditionName: "Novo" },
  });

  // Add Item Characteristic
  const char1 = await prisma.itemCharacteristics.create({
    data: {
      itemCharacteristicsName: "Tutu Clássico",
      categoryId: category1.categoryId,
      colorId: color1.colorId,
      sizeId: size1.sizeId,
    },
  });

  const char2 = await prisma.itemCharacteristics.create({
    data: {
      itemCharacteristicsName: "Collants",
      categoryId: category2.categoryId,
      colorId: color2.colorId,
      sizeId: size2.sizeId,
    },
  });

  // Add Items
  const item1 = await prisma.item.create({
    data: {
      itemCharacteristicsId: char1.itemCharacteristicsId,
      itemConditionId: conditionNew.itemConditionId,
    },
  });

  const item2 = await prisma.item.create({
    data: {
      itemCharacteristicsId: char2.itemCharacteristicsId,
      itemConditionId: conditionNew.itemConditionId,
    },
  });

  await prisma.schoolItem.create({
    data: {
      itemId: item1.itemId,
      rentFee: 10.0,
    },
  });

  await prisma.schoolItem.create({
    data: {
      itemId: item2.itemId,
      rentFee: 5.0,
    },
  });

  console.log("✔ Inventory seed complete.");

  // 10. Core Dance Entities (DanceType, Modality, Studio)
  console.log("Seeding core dance entities...");
  const danceTypes = [
    { danceTypeName: "Clássica" },
    { danceTypeName: "Contemporânea" },
    { danceTypeName: "Urbana" }
  ];

  for (const dt of danceTypes) {
    await prisma.danceType.upsert({
      where: { danceTypeName: dt.danceTypeName },
      update: {},
      create: dt,
    });
  }

  const modalities = [
    { modalityName: "Ballet Clássico", modalityHourlyFee: 15.0 },
    { modalityName: "Dança Contemporânea", modalityHourlyFee: 12.5 },
    { modalityName: "Hip Hop", modalityHourlyFee: 10.0 }
  ];

  for (const mod of modalities) {
    await prisma.modality.upsert({
      where: { modalityName: mod.modalityName },
      update: { modalityHourlyFee: mod.modalityHourlyFee },
      create: mod,
    });
  }

  const studios = [
    { studioName: "Estúdio Principal", studioMaxCapacity: 30 },
    { studioName: "Estúdio B", studioMaxCapacity: 15 }
  ];

  for (const std of studios) {
    await prisma.studio.upsert({
      where: { studioName: std.studioName },
      update: { studioMaxCapacity: std.studioMaxCapacity },
      create: std,
    });
  }
  console.log("✔ Core dance entities seed complete.");

  // 10.1 Specialities / User Modalities
  // Associate Modalities to users (Professor and Student)
  
  // Get Modalties
  const balletModality = await prisma.modality.findUnique({ where: { modalityName: "Ballet Clássico" }});
  const contempModality = await prisma.modality.findUnique({ where: { modalityName: "Dança Contemporânea" }});

  if (balletModality && contempModality) {
    // Prof teaches Ballet Clássico and Dança Contemporânea
    await prisma.userModality.upsert({
      where: { userId_modalityId: { userId: 2, modalityId: balletModality.modalityId } },
      update: {},
      create: { userId: 2, modalityId: balletModality.modalityId },
    });
    await prisma.userModality.upsert({
      where: { userId_modalityId: { userId: 2, modalityId: contempModality.modalityId } },
      update: {},
      create: { userId: 2, modalityId: contempModality.modalityId },
    });

    // Student attends Ballet Clássico
    await prisma.userModality.upsert({
      where: { userId_modalityId: { userId: 3, modalityId: balletModality.modalityId } },
      update: {},
      create: { userId: 3, modalityId: balletModality.modalityId },
    });
    console.log("✔ User Modalities seed complete.");
  }


  // 11. Sincronizar sequências (Correção para IDs manuais no Postgres)
  console.log("Sincronizando sequências da base de dados...");
  try {
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"User"', 'user_id'), coalesce(max(user_id), 0) + 1, false) FROM "User"`);
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Contact"', 'contact_id'), coalesce(max(contact_id), 0) + 1, false) FROM "Contact"`);
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"User_Contact"', 'user_contact_id'), coalesce(max(user_contact_id), 0) + 1, false) FROM "User_Contact"`);
  } catch (e) {
    console.warn("Aviso ao tentar sincronizar as sequências ID:", e);
  }
  console.log("✔ Sequências sincronizadas.");

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
