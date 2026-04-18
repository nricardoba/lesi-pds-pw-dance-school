import { z } from "zod";
import { prisma } from "../../config/db";
import { AppError } from "../../utils/appError";

const itemIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const createItemSchema = z.object({
  itemCharacteristicsId: z.coerce.number().int().positive(),
  itemConditionId: z.coerce.number().int().positive(),
  ownerType: z.enum(["school", "user"]).optional(),
  rentFee: z.coerce.number().positive().optional(), // for SchoolItem
  userId: z.coerce.number().int().positive().optional(), // for UserItem
});

const updateItemSchema = z.object({
  itemCharacteristicsId: z.coerce.number().int().positive().optional(),
  itemConditionId: z.coerce.number().int().positive().optional(),
  ownerType: z.enum(["school", "user"]).optional(),
  rentFee: z.coerce.number().positive().optional(),
  userId: z.coerce.number().int().positive().optional(),
});

export const listItemsService = async () => {
  return prisma.item.findMany({
    include: {
      itemCharacteristics: {
        include: {
          category: true,
          color: true,
          size: true,
          itemImage: true,
        },
      },
      itemCondition: true,
      schoolItem: true,
      userItem: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      itemId: "asc",
    },
  });
};

export const getItemByIdService = async (params: unknown) => {
  const { id } = itemIdSchema.parse(params);

  const item = await prisma.item.findUnique({
    where: { itemId: id },
    include: {
      itemCharacteristics: {
        include: {
          category: true,
          color: true,
          size: true,
          itemImage: true,
          itemCharacteristicsDanceType: {
            include: {
              danceType: true,
            },
          },
        },
      },
      itemCondition: true,
      schoolItem: true,
      userItem: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!item) {
    throw new AppError("Item não encontrado.", 404);
  }

  return item;
};

export const createItemService = async (body: unknown) => {
  const { itemCharacteristicsId, itemConditionId, ownerType, rentFee, userId } =
    createItemSchema.parse(body);

  const createdItem = await prisma.item.create({
    data: {
      itemCharacteristicsId,
      itemConditionId,
    },
  });

  if (ownerType === "school" && rentFee !== undefined) {
    await prisma.schoolItem.create({
      data: {
        itemId: createdItem.itemId,
        rentFee,
      },
    });
  } else if (ownerType === "user" && userId !== undefined) {
    await prisma.userItem.create({
      data: {
        itemId: createdItem.itemId,
        userId,
      },
    });
  }

  return prisma.item.findUnique({
    where: { itemId: createdItem.itemId },
    include: {
      itemCharacteristics: true,
      itemCondition: true,
      schoolItem: true,
      userItem: true,
    },
  });
};

export const updateItemService = async (params: unknown, body: unknown) => {
  const { id } = itemIdSchema.parse(params);
  const parsedBody = updateItemSchema.parse(body);

  const existingItem = await prisma.item.findUnique({
    where: { itemId: id },
    include: {
      schoolItem: true,
      userItem: true,
    },
  });

  if (!existingItem) {
    throw new AppError("Item não encontrado.", 404);
  }

  const dataToUpdate: Record<string, unknown> = {};

  if (parsedBody.itemCharacteristicsId !== undefined) {
    dataToUpdate.itemCharacteristicsId = parsedBody.itemCharacteristicsId;
  }

  if (parsedBody.itemConditionId !== undefined) {
    dataToUpdate.itemConditionId = parsedBody.itemConditionId;
  }

  const updatedItem = await prisma.item.update({
    where: { itemId: id },
    data: dataToUpdate,
  });

  // Handle ownerType updates
  if (parsedBody.ownerType === "school") {
    if (existingItem.userItem) {
      await prisma.userItem.delete({ where: { itemId: id } });
    }

    if (existingItem.schoolItem) {
      if (parsedBody.rentFee !== undefined) {
        await prisma.schoolItem.update({
          where: { itemId: id },
          data: { rentFee: parsedBody.rentFee },
        });
      }
    } else if (parsedBody.rentFee !== undefined) {
      await prisma.schoolItem.create({
        data: { itemId: id, rentFee: parsedBody.rentFee },
      });
    }
  } else if (parsedBody.ownerType === "user") {
    if (existingItem.schoolItem) {
      await prisma.schoolItem.delete({ where: { itemId: id } });
    }

    if (existingItem.userItem) {
      if (parsedBody.userId !== undefined) {
        await prisma.userItem.update({
          where: { itemId: id },
          data: { userId: parsedBody.userId },
        });
      }
    } else if (parsedBody.userId !== undefined) {
      await prisma.userItem.create({
        data: { itemId: id, userId: parsedBody.userId },
      });
    }
  }

  return prisma.item.findUnique({
    where: { itemId: id },
    include: {
      itemCharacteristics: true,
      itemCondition: true,
      schoolItem: true,
      userItem: true,
    },
  });
};

export const deleteItemService = async (params: unknown) => {
  const { id } = itemIdSchema.parse(params);

  const existingItem = await prisma.item.findUnique({
    where: { itemId: id },
  });

  if (!existingItem) {
    throw new AppError("Item não encontrado.", 404);
  }

  await prisma.item.delete({
    where: { itemId: id },
  });

  return { message: "Item removido com sucesso." };
};
