import { z } from "zod";
import { prisma } from "../../config/db";
import { AppError } from "../../utils/appError";

const userAddressParamsSchema = z.object({
  id: z.coerce.number().int().positive(), // userId
  userAddressId: z.coerce.number().int().positive().optional(),
});

const userAddressBodySchema = z.object({
  streetName: z.string().trim().min(1),
  postalCode: z.string().trim().min(3),
  localityName: z.string().trim().min(1),
  isMainAddress: z.boolean().default(false),
});

export const addUserAddressService = async (params: unknown, body: unknown) => {
  const { id } = userAddressParamsSchema.parse(params);
  const { streetName, postalCode, localityName, isMainAddress } = userAddressBodySchema.parse(body);

  const existingUser = await prisma.user.findUnique({ where: { userId: id } });
  if (!existingUser) throw new AppError("Utilizador não encontrado.", 404);

  // 1. Encontrar ou criar Localidade
  let locality = await prisma.locality.findFirst({
    where: { localityName: { equals: localityName, mode: "insensitive" } },
  });
  if (!locality) {
    locality = await prisma.locality.create({ data: { localityName } });
  }

  // 2. Encontrar ou criar Código Postal
  let pc = await prisma.postalCode.findUnique({
    where: { postalCode },
  });
  if (!pc) {
    pc = await prisma.postalCode.create({
      data: { postalCode, localityId: locality.localityId }
    });
  }

  // 3. Encontrar ou criar Endereço/Rua
  let address = await prisma.address.findFirst({
    where: {
      streetName: { equals: streetName, mode: "insensitive" },
      postalCode,
    },
  });
  if (!address) {
    address = await prisma.address.create({
      data: { streetName, postalCode },
    });
  }

  // 4. Verificar se o utilizador já tem este endereço associado
  const existingUserAddress = await prisma.userAddress.findUnique({
    where: { userId_streetId: { userId: id, streetId: address.streetId } },
  });

  if (existingUserAddress) {
    if (isMainAddress && !existingUserAddress.isMainAddress) {
      await prisma.userAddress.updateMany({
        where: { userId: id },
        data: { isMainAddress: false },
      });
      return prisma.userAddress.update({
        where: { userId_streetId: { userId: id, streetId: address.streetId } },
        data: { isMainAddress: true },
        include: {
          address: {
            include: {
              postalCodeRel: {
                include: { locality: true }
              }
            }
          }
        }
      });
    }

    return prisma.userAddress.findUnique({
      where: { userId_streetId: { userId: id, streetId: address.streetId } },
      include: {
        address: {
          include: {
            postalCodeRel: {
              include: { locality: true }
            }
          }
        }
      }
    });
  }

  // Se não existir essa morada (mas outra for main), remove flag das anteriores
  if (isMainAddress) {
    await prisma.userAddress.updateMany({
      where: { userId: id },
      data: { isMainAddress: false },
    });
  }

  // 5. Criar a associação UserAddress
  return prisma.userAddress.create({
    data: {
      userId: id,
      streetId: address.streetId,
      isMainAddress,
    },
    include: {
      address: {
        include: {
          postalCodeRel: {
            include: { locality: true }
          }
        }
      }
    }
  });
};

export const deleteUserAddressService = async (params: unknown) => {
  const { id, userAddressId } = userAddressParamsSchema.parse(params);

  if (!userAddressId) throw new AppError("userAddressId em falta.", 400);

  const userAddress = await prisma.userAddress.findUnique({
    where: { userAddressId },
  });

  if (!userAddress || userAddress.userId !== id) {
    throw new AppError("Morada do utilizador não encontrada.", 404);
  }

  // 1. Apagar a relação da morada com o utilizador
  await prisma.userAddress.delete({
    where: { userAddressId },
  });

  // 2. Clean-up: se mais ninguém usar a rua/morada global ("Address"), apagam-se os órfãos
  const remainingLinks = await prisma.userAddress.count({
    where: { streetId: userAddress.streetId }
  });

  if (remainingLinks === 0) {
    await prisma.address.delete({
      where: { streetId: userAddress.streetId }
    });
  }

  return { message: "Morada apagada com sucesso." };
};
