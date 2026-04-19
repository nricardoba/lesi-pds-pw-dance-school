import { z } from "zod";
import { prisma } from "../../config/db";
import { AppError } from "../../utils/appError";

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const nameSchema = z.object({
  name: z.string().min(1),
});

const colorSchema = z.object({
  name: z.string().min(1),
  hex: z.string().optional(),
});

const conditionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

// --- Category ---
export const listCategoriesService = async () => {
  return await prisma.category.findMany();
};

export const createCategoryService = async (body: unknown) => {
  const data = nameSchema.parse(body);
  return await prisma.category.create({
    data: {
      categoryName: data.name,
    },
  });
};

export const updateCategoryService = async (params: unknown, body: unknown) => {
  const { id } = idParamSchema.parse(params);
  const data = nameSchema.partial().parse(body);
  return await prisma.category.update({
    where: { categoryId: id },
    data: {
      ...(data.name && { categoryName: data.name }),
    },
  });
};

export const deleteCategoryService = async (params: unknown) => {
  const { id } = idParamSchema.parse(params);
  return await prisma.category.delete({ where: { categoryId: id } });
};

// --- Color ---
export const listColorsService = async () => {
  return await prisma.color.findMany();
};

export const createColorService = async (body: unknown) => {
  const data = colorSchema.parse(body);
  return await prisma.color.create({
    data: {
      colorName: data.name,
      ...(data.hex && { colorHex: data.hex }),
    } as any,
  });
};

export const updateColorService = async (params: unknown, body: unknown) => {
  const { id } = idParamSchema.parse(params);
  const data = colorSchema.partial().parse(body);
  return await prisma.color.update({
    where: { colorId: id },
    data: {
      ...(data.name && { colorName: data.name }),
      ...(data.hex && { colorHex: data.hex }),
    } as any,
  });
};

export const deleteColorService = async (params: unknown) => {
  const { id } = idParamSchema.parse(params);
  return await prisma.color.delete({ where: { colorId: id } });
};

// --- Size ---
export const listSizesService = async () => {
  return await prisma.size.findMany();
};

export const createSizeService = async (body: unknown) => {
  const data = nameSchema.parse(body);
  return await prisma.size.create({
    data: {
      sizeName: data.name,
    },
  });
};

export const updateSizeService = async (params: unknown, body: unknown) => {
  const { id } = idParamSchema.parse(params);
  const data = nameSchema.partial().parse(body);
  return await prisma.size.update({
    where: { sizeId: id },
    data: {
      ...(data.name && { sizeName: data.name }),
    },
  });
};

export const deleteSizeService = async (params: unknown) => {
  const { id } = idParamSchema.parse(params);
  return await prisma.size.delete({ where: { sizeId: id } });
};

// --- Item Condition ---
export const listItemConditionsService = async () => {
  return await prisma.itemCondition.findMany();
};

export const createItemConditionService = async (body: unknown) => {
  const data = conditionSchema.parse(body);
  return await prisma.itemCondition.create({
    data: {
      itemConditionName: data.name,
    },
  });
};

export const updateItemConditionService = async (params: unknown, body: unknown) => {
  const { id } = idParamSchema.parse(params);
  const data = conditionSchema.partial().parse(body);
  return await prisma.itemCondition.update({
    where: { itemConditionId: id },
    data: {
      ...(data.name && { itemConditionName: data.name }),
    },
  });
};

export const deleteItemConditionService = async (params: unknown) => {
  const { id } = idParamSchema.parse(params);
  return await prisma.itemCondition.delete({ where: { itemConditionId: id } });
};

// --- Dance Type ---
export const listDanceTypesService = async () => {
  return await prisma.danceType.findMany();
};

export const createDanceTypeService = async (body: unknown) => {
  const data = nameSchema.parse(body);
  return await prisma.danceType.create({
    data: {
      danceTypeName: data.name,
    },
  });
};

export const updateDanceTypeService = async (params: unknown, body: unknown) => {
  const { id } = idParamSchema.parse(params);
  const data = nameSchema.partial().parse(body);
  return await prisma.danceType.update({
    where: { danceTypeId: id },
    data: {
      ...(data.name && { danceTypeName: data.name }),
    },
  });
};

export const deleteDanceTypeService = async (params: unknown) => {
  const { id } = idParamSchema.parse(params);
  return await prisma.danceType.delete({ where: { danceTypeId: id } });
};
