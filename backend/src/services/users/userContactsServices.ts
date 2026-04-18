import { z } from "zod";
import { prisma } from "../../config/db";
import { AppError } from "../../utils/appError";

const userContactParamsSchema = z.object({
  id: z.coerce.number().int().positive(), // userId
  contactId: z.coerce.number().int().positive().optional(), // opcional para quando é só criar
});

const userContactBodySchema = z.object({
  contactValue: z.string().trim().min(3),
  contactTypeId: z.coerce.number().int().positive(),
  isMainContact: z.boolean().default(false),
});

export const addUserContactService = async (params: unknown, body: unknown) => {
  const { id } = userContactParamsSchema.parse(params);
  const { contactValue, contactTypeId, isMainContact } = userContactBodySchema.parse(body);

  const existingUser = await prisma.user.findUnique({ where: { userId: id } });
  if (!existingUser) throw new AppError("Utilizador não encontrado.", 404);

  // Se for o principal, precisamos tirar a flag de "principal" aos outros contactos do mesmo utilizador
  if (isMainContact) {
    await prisma.userContact.updateMany({
      where: { userId: id },
      data: { isMainContact: false },
    });
  }

  // Verificar se o valor de contacto já existe a nível global
  const existingContact = await prisma.contact.findFirst({
    where: { contactValue },
  });

  let targetContactId;
  if (existingContact) {
    targetContactId = existingContact.contactId;
    const isAlreadyAssociated = await prisma.userContact.findUnique({
      where: { userId_contactId: { userId: id, contactId: targetContactId } },
    });
    if (isAlreadyAssociated) throw new AppError("Este contacto já está associado ao utilizador.", 409);
  } else {
    const newContact = await prisma.contact.create({
      data: { contactValue, contactTypeId },
    });
    targetContactId = newContact.contactId;
  }

  return prisma.userContact.create({
    data: {
      userId: id,
      contactId: targetContactId,
      isMainContact,
    },
    include: {
      contact: { include: { contactType: true } }
    }
  });
};

export const deleteUserContactService = async (params: unknown) => {
  const { id, contactId } = userContactParamsSchema.parse(params);

  if (!contactId) throw new AppError("ContactId em falta.", 400);

  // 1. Apagar a relação do contacto com o utilizador
  await prisma.userContact.delete({
    where: {
      userId_contactId: { userId: id, contactId },
    },
  }).catch(() => {
    throw new AppError("Contacto não encontrado no utilizador.", 404);
  });

  // 2. Verificar se este contacto está a ser usado por outro utilizador (ex: irmãos com o mesmo telefone)
  const remainingLinks = await prisma.userContact.count({
    where: { contactId },
  });

  // 3. Se ninguém mais estiver a usar este contacto, apagamo-lo definitivamente da tabela Contacts
  if (remainingLinks === 0) {
    await prisma.contact.delete({
      where: { contactId },
    });
  }

  return { message: "Contacto apagado com sucesso." };
};
