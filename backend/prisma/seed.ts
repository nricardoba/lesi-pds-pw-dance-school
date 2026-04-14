import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Tipos de Utilizador (UserType)
  const userTypes = [
    { userTypeId: 1, userTypeDesc: 'Admin' },
    { userTypeId: 2, userTypeDesc: 'Professor' },
    { userTypeId: 3, userTypeDesc: 'Aluno' },
    { userTypeId: 4, userTypeDesc: 'Encarregado de Educação' },
  ];

  for (const ut of userTypes) {
    await prisma.userType.upsert({
      where: { userTypeId: ut.userTypeId },
      update: {},
      create: ut,
    });
  }
  console.log('✔ UserType seed complete.');

  // 2. Estados das Aulas (ClassStatus)
  const classStatuses = [
    { classStatusId: 1, classStatusDesc: 'Agendada' },
    { classStatusId: 2, classStatusDesc: 'A Decorrer' },
    { classStatusId: 3, classStatusDesc: 'Concluída' },
    { classStatusId: 4, classStatusDesc: 'Cancelada' },
  ];

  for (const cs of classStatuses) {
    await prisma.classStatus.upsert({
      where: { classStatusId: cs.classStatusId },
      update: {},
      create: cs,
    });
  }
  console.log('✔ ClassStatus seed complete.');

  // 3. Tipos de Contacto (ContactType)
  const contactTypes = [
    { contactTypeId: 1, contactTypeDesc: 'Telemóvel' },
    { contactTypeId: 2, contactTypeDesc: 'Email' },
    { contactTypeId: 3, contactTypeDesc: 'Telefone Fixo' },
  ];

  for (const ct of contactTypes) {
    await prisma.contactType.upsert({
      where: { contactTypeId: ct.contactTypeId },
      update: {},
      create: ct,
    });
  }
  console.log('✔ ContactType seed complete.');

  // 4. Papéis na Aula (UserClassRole)
  const userClassRoles = [
    { userClassRoleId: 1, userClassRoleDesc: 'Professor Responsável' },
    { userClassRoleId: 2, userClassRoleDesc: 'Professor Assistente' },
    { userClassRoleId: 3, userClassRoleDesc: 'Aluno' },
  ];

  for (const role of userClassRoles) {
    await prisma.userClassRole.upsert({
      where: { userClassRoleId: role.userClassRoleId },
      update: {},
      create: role,
    });
  }
  console.log('✔ UserClassRole seed complete.');

  // Adiciona aqui mais inserts (Condições dos Itens, Modalidades base, etc) caso necessário.

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
