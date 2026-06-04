import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const buildEmail = (name: string) =>
  `${name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9.]/g, "")}` + "@email.com";

async function main() {
  console.log("Start seeding user types and users...");

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

  const userTypeRows = await prisma.userType.findMany({
    where: { userTypeDesc: { in: userTypes } },
  });

  const userTypeByDesc = new Map(
    userTypeRows.map((row) => [row.userTypeDesc, row.userTypeId]),
  );

  const contactTypeDescs = ["Email", "Telemóvel"];

  await prisma.contactType.createMany({
    data: contactTypeDescs.map((contactTypeDesc) => ({ contactTypeDesc })),
    skipDuplicates: true,
  });

  const contactTypeRows = await prisma.contactType.findMany({
    where: { contactTypeDesc: { in: contactTypeDescs } },
  });

  const contactTypeByDesc = new Map(
    contactTypeRows.map((row) => [row.contactTypeDesc, row.contactTypeId]),
  );

  let locality = await prisma.locality.findFirst({
    where: { localityName: "Braga" },
  });

  if (!locality) {
    locality = await prisma.locality.create({
      data: { localityName: "Braga" },
    });
  }

  const postalCode = await prisma.postalCode.upsert({
    where: { postalCode: "4700-000" },
    update: { localityId: locality.localityId },
    create: { postalCode: "4700-000", localityId: locality.localityId },
  });

  const users = [
    {
      name: "Beatriz Saraiva",
      type: "Admin",
      phone: "+351910000001",
      streetName: "Rua Beatriz Saraiva 1",
      password: "Admin123!",
      birthDate: new Date("1985-02-14"),
      startDate: new Date("2020-09-01"),
      nif: "111111111",
    },
    {
      name: "Rodrigo Sanches",
      type: "Professor",
      phone: "+351920000002",
      streetName: "Rua Rodrigo Sanches 2",
      password: "Prof123!",
      birthDate: new Date("1990-06-22"),
      startDate: new Date("2021-09-01"),
      nif: "222222222",
    },
    {
      name: "Afonso Antunes",
      type: "Aluno",
      phone: "+351930000003",
      streetName: "Rua Afonso Antunes 3",
      password: "Aluno123!",
      birthDate: new Date("2010-10-20"),
      startDate: new Date("2023-09-01"),
      nif: "333333333",
      studentNumber: "a12345",
    },
  ];

  for (const user of users) {
    const userTypeId = userTypeByDesc.get(user.type);
    const emailContactTypeId = contactTypeByDesc.get("Email");
    const phoneContactTypeId = contactTypeByDesc.get("Telemóvel");

    if (!userTypeId || !emailContactTypeId || !phoneContactTypeId) {
      throw new Error("Missing required user or contact types.");
    }

    const email = buildEmail(user.name);

    let address = await prisma.address.findFirst({
      where: {
        streetName: user.streetName,
        postalCode: postalCode.postalCode,
      },
    });

    if (!address) {
      address = await prisma.address.create({
        data: {
          streetName: user.streetName,
          postalCode: postalCode.postalCode,
        },
      });
    }

    let userRecord = await prisma.user.findFirst({
      where: {
        userName: user.name,
        userTypeId,
      },
    });

    if (!userRecord) {
      userRecord = await prisma.user.create({
        data: {
          userName: user.name,
          userTypeId,
          userIsActive: true,
          userBirthDate: user.birthDate,
          userStartDate: user.startDate,
        },
      });
    } else {
      userRecord = await prisma.user.update({
        where: { userId: userRecord.userId },
        data: {
          userIsActive: true,
          userBirthDate: user.birthDate,
          userStartDate: user.startDate,
        },
      });
    }

    if (user.nif) {
      await prisma.userNIF.upsert({
        where: { userId: userRecord.userId },
        update: { userNif: user.nif },
        create: { userId: userRecord.userId, userNif: user.nif },
      });
    }

    await prisma.userAddress.upsert({
      where: {
        userId_streetId: {
          userId: userRecord.userId,
          streetId: address.streetId,
        },
      },
      update: { isMainAddress: true },
      create: {
        userId: userRecord.userId,
        streetId: address.streetId,
        isMainAddress: true,
      },
    });

    let emailContact = await prisma.contact.findFirst({
      where: {
        contactValue: email,
        contactTypeId: emailContactTypeId,
      },
    });

    if (!emailContact) {
      emailContact = await prisma.contact.create({
        data: {
          contactValue: email,
          contactTypeId: emailContactTypeId,
        },
      });
    }

    let phoneContact = await prisma.contact.findFirst({
      where: {
        contactValue: user.phone,
        contactTypeId: phoneContactTypeId,
      },
    });

    if (!phoneContact) {
      phoneContact = await prisma.contact.create({
        data: {
          contactValue: user.phone,
          contactTypeId: phoneContactTypeId,
        },
      });
    }

    const emailUserContact = await prisma.userContact.upsert({
      where: {
        userId_contactId: {
          userId: userRecord.userId,
          contactId: emailContact.contactId,
        },
      },
      update: { isMainContact: true },
      create: {
        userId: userRecord.userId,
        contactId: emailContact.contactId,
        isMainContact: true,
      },
    });

    await prisma.userContact.upsert({
      where: {
        userId_contactId: {
          userId: userRecord.userId,
          contactId: phoneContact.contactId,
        },
      },
      update: { isMainContact: false },
      create: {
        userId: userRecord.userId,
        contactId: phoneContact.contactId,
        isMainContact: false,
      },
    });

    const passwordHash = await bcrypt.hash(user.password, 10);

    await prisma.userCredential.upsert({
      where: { userId: userRecord.userId },
      update: {
        userContactId: emailUserContact.userContactId,
        userCredentialPasswordHash: passwordHash,
      },
      create: {
        userId: userRecord.userId,
        userContactId: emailUserContact.userContactId,
        userCredentialPasswordHash: passwordHash,
      },
    });

    if (user.studentNumber) {
      await prisma.studentNumber.upsert({
        where: { userId: userRecord.userId },
        update: { studentNumber: user.studentNumber },
        create: {
          userId: userRecord.userId,
          studentNumber: user.studentNumber,
        },
      });
    }
  }

  await prisma.schoolYear.createMany({
    data: [
      {
        schoolYearName: "2025/2026",
        schoolYearStart: new Date("2025-09-01"),
        schoolYearEnd: new Date("2026-07-31"),
      },
      {
        schoolYearName: "2026/2027",
        schoolYearStart: new Date("2026-09-01"),
        schoolYearEnd: new Date("2027-07-31"),
      },
      {
        schoolYearName: "2027/2028",
        schoolYearStart: new Date("2027-09-01"),
        schoolYearEnd: new Date("2028-07-31"),
      },
    ],
    skipDuplicates: true,
  });

  await prisma.modality.createMany({
    data: [
      { modalityName: "Ballet Clássico", modalityHourlyFee: 15.0 },
      { modalityName: "Dança Contemporânea", modalityHourlyFee: 12.5 },
      { modalityName: "Hip Hop", modalityHourlyFee: 10.0 },
      { modalityName: "Jazz", modalityHourlyFee: 12.0 },
      { modalityName: "Dança Criativa", modalityHourlyFee: 9.0 },
    ],
    skipDuplicates: true,
  });

  await prisma.studio.createMany({
    data: Array.from({ length: 8 }, (_, index) => ({
      studioName: `Estúdio ${index + 1}`,
      studioMaxCapacity: 20,
    })),
    skipDuplicates: true,
  });

  console.log(
    "✔ UserType, contact, address, credentials, school years, modalities, and studios seed complete.",
  );
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
