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

  const users = [
    {
      userId: 1,
      name: "Beatriz Saraiva",
      type: "Admin",
      phone: "+351910000001",
      streetId: 1,
      streetName: "Rua Beatriz Saraiva 1",
      password: "Admin123!",
    },
    {
      userId: 2,
      name: "Rodrigo Sanches",
      type: "Professor",
      phone: "+351920000002",
      streetId: 2,
      streetName: "Rua Rodrigo Sanches 2",
      password: "Prof123!",
    },
    {
      userId: 3,
      name: "Afonso Antunes",
      type: "Aluno",
      phone: "+351930000003",
      streetId: 3,
      streetName: "Rua Afonso Antunes 3",
      password: "Aluno123!",
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

    const address = await prisma.address.upsert({
      where: { streetId: user.streetId },
      update: {
        streetName: user.streetName,
        postalCode: postalCode.postalCode,
      },
      create: {
        streetId: user.streetId,
        streetName: user.streetName,
        postalCode: postalCode.postalCode,
      },
    });

    await prisma.user.upsert({
      where: { userId: user.userId },
      update: {
        userName: user.name,
        userTypeId,
        userIsActive: true,
      },
      create: {
        userId: user.userId,
        userName: user.name,
        userTypeId,
        userIsActive: true,
      },
    });

    await prisma.userAddress.upsert({
      where: { userAddressId: user.userId },
      update: {
        userId: user.userId,
        streetId: address.streetId,
        isMainAddress: true,
      },
      create: {
        userAddressId: user.userId,
        userId: user.userId,
        streetId: address.streetId,
        isMainAddress: true,
      },
    });

    const emailContactId = user.userId;
    const phoneContactId = users.length + user.userId;

    await prisma.contact.upsert({
      where: { contactId: emailContactId },
      update: {
        contactValue: email,
        contactTypeId: emailContactTypeId,
      },
      create: {
        contactId: emailContactId,
        contactValue: email,
        contactTypeId: emailContactTypeId,
      },
    });

    await prisma.contact.upsert({
      where: { contactId: phoneContactId },
      update: {
        contactValue: user.phone,
        contactTypeId: phoneContactTypeId,
      },
      create: {
        contactId: phoneContactId,
        contactValue: user.phone,
        contactTypeId: phoneContactTypeId,
      },
    });

    await prisma.userContact.upsert({
      where: { userContactId: emailContactId },
      update: {
        userId: user.userId,
        contactId: emailContactId,
        isMainContact: true,
      },
      create: {
        userContactId: emailContactId,
        userId: user.userId,
        contactId: emailContactId,
        isMainContact: true,
      },
    });

    await prisma.userContact.upsert({
      where: { userContactId: phoneContactId },
      update: {
        userId: user.userId,
        contactId: phoneContactId,
        isMainContact: false,
      },
      create: {
        userContactId: phoneContactId,
        userId: user.userId,
        contactId: phoneContactId,
        isMainContact: false,
      },
    });

    const passwordHash = await bcrypt.hash(user.password, 10);

    await prisma.userCredential.upsert({
      where: { userId: user.userId },
      update: {
        userContactId: emailContactId,
        userCredentialPasswordHash: passwordHash,
      },
      create: {
        userId: user.userId,
        userContactId: emailContactId,
        userCredentialPasswordHash: passwordHash,
      },
    });
  }

  console.log("✔ UserType, contact, address, and credentials seed complete.");
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
