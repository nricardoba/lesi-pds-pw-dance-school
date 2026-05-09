import { describe, it, expect, vi, beforeEach } from "vitest";
import * as itemsServices from "../../src/services/inventory/itemsServices";
import { AppError } from "../../src/utils/appError";

vi.mock("../../src/config/db", () => ({
  prisma: {
    item: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    schoolItem: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    userItem: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "../../src/config/db";

const mockPrisma = prisma as any;

describe("Items Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listItemsService", () => {
    it("deve listar todos os itens com relações completas", async () => {
      const mockItems = [
        {
          itemId: 1,
          itemCharacteristicsId: 1,
          itemConditionId: 1,
          itemCharacteristics: {
            category: true,
            color: true,
            size: true,
            itemImage: true,
          },
          itemCondition: { itemConditionId: 1, itemConditionName: "Novo" },
          schoolItem: null,
          userItem: null,
        },
      ];

      mockPrisma.item.findMany.mockResolvedValue(mockItems);

      const result = await itemsServices.listItemsService();

      expect(result).toEqual(mockItems);
      expect(mockPrisma.item.findMany).toHaveBeenCalled();
    });

    it("deve retornar lista vazia quando não há itens", async () => {
      mockPrisma.item.findMany.mockResolvedValue([]);

      const result = await itemsServices.listItemsService();

      expect(result).toEqual([]);
    });
  });

  describe("getItemByIdService", () => {
    it("deve retornar um item por ID com todas as relações", async () => {
      const mockItem = {
        itemId: 1,
        itemCharacteristicsId: 1,
        itemConditionId: 1,
        itemCharacteristics: {
          category: true,
          color: true,
          size: true,
          itemImage: true,
          itemCharacteristicsDanceType: [],
        },
        itemCondition: { itemConditionId: 1, itemConditionName: "Novo" },
        schoolItem: { itemId: 1, rentFee: 50 },
        userItem: null,
      };

      mockPrisma.item.findUnique.mockResolvedValue(mockItem);

      const result = await itemsServices.getItemByIdService({ id: 1 });

      expect(result).toEqual(mockItem);
      expect(mockPrisma.item.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { itemId: 1 },
        }),
      );
    });

    it("deve lançar erro quando item não existe", async () => {
      mockPrisma.item.findUnique.mockResolvedValue(null);

      await expect(
        itemsServices.getItemByIdService({ id: 999 }),
      ).rejects.toThrow(AppError);
    });

    it("deve lançar erro com mensagem correta", async () => {
      mockPrisma.item.findUnique.mockResolvedValue(null);

      await expect(
        itemsServices.getItemByIdService({ id: 999 }),
      ).rejects.toThrow("Item não encontrado.");
    });
  });

  describe("createItemService", () => {
    it("deve criar um item escolar com sucesso", async () => {
      const inputData = {
        itemCharacteristicsId: 1,
        itemConditionId: 1,
        ownerType: "school",
        rentFee: 50,
      };

      const mockCreatedItem = {
        itemId: 1,
        itemCharacteristicsId: 1,
        itemConditionId: 1,
        itemCharacteristics: true,
        itemCondition: true,
        schoolItem: { itemId: 1, rentFee: 50 },
        userItem: null,
      };

      mockPrisma.item.create.mockResolvedValue({
        itemId: 1,
        itemCharacteristicsId: 1,
        itemConditionId: 1,
      });
      mockPrisma.schoolItem.create.mockResolvedValue(true);
      mockPrisma.item.findUnique.mockResolvedValue(mockCreatedItem);

      const result = await itemsServices.createItemService(inputData);

      expect(result).toEqual(mockCreatedItem);
      expect(mockPrisma.item.create).toHaveBeenCalled();
      expect(mockPrisma.schoolItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            itemId: 1,
            rentFee: 50,
          },
        }),
      );
    });

    it("deve criar um item de usuário com sucesso", async () => {
      const inputData = {
        itemCharacteristicsId: 1,
        itemConditionId: 1,
        ownerType: "user",
        userId: 5,
      };

      const mockCreatedItem = {
        itemId: 2,
        itemCharacteristicsId: 1,
        itemConditionId: 1,
        itemCharacteristics: true,
        itemCondition: true,
        schoolItem: null,
        userItem: { itemId: 2, userId: 5 },
      };

      mockPrisma.item.create.mockResolvedValue({
        itemId: 2,
        itemCharacteristicsId: 1,
        itemConditionId: 1,
      });
      mockPrisma.userItem.create.mockResolvedValue(true);
      mockPrisma.item.findUnique.mockResolvedValue(mockCreatedItem);

      const result = await itemsServices.createItemService(inputData);

      expect(result).toEqual(mockCreatedItem);
      expect(mockPrisma.userItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            itemId: 2,
            userId: 5,
          },
        }),
      );
    });

    it("deve lançar erro quando itemCharacteristicsId é inválido", async () => {
      const invalidData = {
        itemCharacteristicsId: -1,
        itemConditionId: 1,
        ownerType: "school",
        rentFee: 50,
      };

      await expect(
        itemsServices.createItemService(invalidData),
      ).rejects.toThrow();
      expect(mockPrisma.item.create).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando falta campo obrigatório", async () => {
      const invalidData = {
        itemCharacteristicsId: 1,
        ownerType: "school",
        rentFee: 50,
      };

      await expect(
        itemsServices.createItemService(invalidData),
      ).rejects.toThrow();
      expect(mockPrisma.item.create).not.toHaveBeenCalled();
    });
  });

  describe("updateItemService", () => {
    it("deve atualizar um item com sucesso", async () => {
      const params = { id: 1 };
      const updateData = {
        itemCharacteristicsId: 2,
      };

      mockPrisma.item.findUnique.mockResolvedValue({
        itemId: 1,
        schoolItem: null,
        userItem: null,
      });

      const mockUpdatedItem = {
        itemId: 1,
        itemCharacteristicsId: 2,
        itemConditionId: 1,
        itemCharacteristics: true,
        itemCondition: true,
        schoolItem: null,
        userItem: null,
      };

      mockPrisma.item.update.mockResolvedValue(mockUpdatedItem);
      mockPrisma.item.findUnique.mockResolvedValueOnce({
        itemId: 1,
        schoolItem: null,
        userItem: null,
      });
      mockPrisma.item.findUnique.mockResolvedValueOnce(mockUpdatedItem);

      const result = await itemsServices.updateItemService(params, updateData);

      expect(result).toEqual(mockUpdatedItem);
      expect(mockPrisma.item.update).toHaveBeenCalled();
    });

    it("deve lançar erro ao atualizar item inexistente", async () => {
      const params = { id: 999 };
      const updateData = { itemCharacteristicsId: 2 };

      mockPrisma.item.findUnique.mockResolvedValue(null);

      await expect(
        itemsServices.updateItemService(params, updateData),
      ).rejects.toThrow(AppError);

      expect(mockPrisma.item.update).not.toHaveBeenCalled();
    });

    it("deve permitir trocar de item escolar para item de usuário", async () => {
      const params = { id: 1 };
      const updateData = {
        ownerType: "user",
        userId: 5,
      };

      mockPrisma.item.findUnique.mockResolvedValue({
        itemId: 1,
        schoolItem: { itemId: 1, rentFee: 50 },
        userItem: null,
      });

      const mockUpdatedItem = {
        itemId: 1,
        itemCharacteristicsId: 1,
        itemConditionId: 1,
        itemCharacteristics: true,
        itemCondition: true,
        schoolItem: null,
        userItem: { itemId: 1, userId: 5 },
      };

      mockPrisma.item.update.mockResolvedValue(mockUpdatedItem);
      mockPrisma.schoolItem.delete.mockResolvedValue(true);
      mockPrisma.userItem.create.mockResolvedValue(true);
      mockPrisma.item.findUnique.mockResolvedValueOnce({
        itemId: 1,
        schoolItem: { itemId: 1, rentFee: 50 },
        userItem: null,
      });
      mockPrisma.item.findUnique.mockResolvedValueOnce(mockUpdatedItem);

      const result = await itemsServices.updateItemService(params, updateData);

      expect(result).toEqual(mockUpdatedItem);
      expect(mockPrisma.schoolItem.delete).toHaveBeenCalled();
      expect(mockPrisma.userItem.create).toHaveBeenCalled();
    });
  });

  describe("deleteItemService", () => {
    it("deve deletar um item com sucesso", async () => {
      const params = { id: 1 };

      mockPrisma.item.findUnique.mockResolvedValue({
        itemId: 1,
      });

      mockPrisma.item.delete.mockResolvedValue({
        itemId: 1,
      });

      const result = await itemsServices.deleteItemService(params);

      expect(result).toEqual({ message: "Item removido com sucesso." });
      expect(mockPrisma.item.delete).toHaveBeenCalledWith({
        where: { itemId: 1 },
      });
    });

    it("deve lançar erro ao deletar item inexistente", async () => {
      const params = { id: 999 };

      mockPrisma.item.findUnique.mockResolvedValue(null);

      await expect(itemsServices.deleteItemService(params)).rejects.toThrow(
        AppError,
      );

      expect(mockPrisma.item.delete).not.toHaveBeenCalled();
    });

    it("deve lançar erro com mensagem correta", async () => {
      const params = { id: 999 };

      mockPrisma.item.findUnique.mockResolvedValue(null);

      await expect(itemsServices.deleteItemService(params)).rejects.toThrow(
        "Item não encontrado.",
      );
    });
  });
});
