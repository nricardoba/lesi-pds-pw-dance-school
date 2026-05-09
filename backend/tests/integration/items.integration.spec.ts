import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/index";
import { prisma } from "../../src/config/db";

describe("Testes de Integração - Inventário", () => {
  const adminLogin = {
    email: process.env.ADMIN_EMAIL ?? "admin@admin.com",
    password: process.env.ADMIN_PASSWORD ?? "Admin123!",
  };

  let accessToken = "";

  // Stored IDs for cleanup and subsequent tests
  let categoryId: number;
  let colorId: number;
  let sizeId: number;
  let conditionId: number;
  let characteristicId: number;
  let itemId: number;

  const uniqueSuffix = Date.now();

  beforeAll(async () => {
    const loginRes = await request(app).post("/auth/login").send(adminLogin);

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("accessToken");
    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    try {
      if (itemId) {
        await prisma.schoolItem
          .deleteMany({ where: { itemId } })
          .catch(() => {});
        await prisma.userItem.deleteMany({ where: { itemId } }).catch(() => {});
        await prisma.item.delete({ where: { itemId } }).catch(() => {});
      }
      if (characteristicId) {
        await prisma.itemCharacteristics
          .delete({ where: { itemCharacteristicsId: characteristicId } })
          .catch(() => {});
      }
      if (categoryId)
        await prisma.category.delete({ where: { categoryId } }).catch(() => {});
      if (colorId)
        await prisma.color.delete({ where: { colorId } }).catch(() => {});
      if (sizeId)
        await prisma.size.delete({ where: { sizeId } }).catch(() => {});
      if (conditionId)
        await prisma.itemCondition
          .delete({ where: { itemConditionId: conditionId } })
          .catch(() => {});
    } finally {
      await prisma.$disconnect();
    }
  });

  describe("Referências do Inventário", () => {
    it("1. deve criar uma categoria", async () => {
      const response = await request(app)
        .post("/inventory-references/categories")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: `Categoria Teste ${uniqueSuffix}` });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("categoryId");
      categoryId = response.body.categoryId;
    });

    it("2. deve criar uma cor", async () => {
      const response = await request(app)
        .post("/inventory-references/colors")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: `Cor Teste ${uniqueSuffix}` });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("colorId");
      colorId = response.body.colorId;
    });

    it("3. deve criar um tamanho", async () => {
      const response = await request(app)
        .post("/inventory-references/sizes")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: `Tamanho Teste ${uniqueSuffix}` });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("sizeId");
      sizeId = response.body.sizeId;
    });

    it("4. deve criar uma condição de item", async () => {
      const response = await request(app)
        .post("/inventory-references/item-conditions")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: `Condição Teste ${uniqueSuffix}` });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("itemConditionId");
      conditionId = response.body.itemConditionId;
    });
  });

  describe("Características dos Itens", () => {
    it("1. deve criar uma característica com as referências", async () => {
      const charData = {
        name: `Característica Teste ${uniqueSuffix}`,
        description: "Descrição de teste",
        price: 100,
        categoryId: categoryId,
        colorId: colorId,
        sizeId: sizeId,
      };

      const response = await request(app)
        .post("/characteristics")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(charData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("itemCharacteristicsId");
      characteristicId = response.body.itemCharacteristicsId;
    });

    it("2. deve listar as características", async () => {
      const response = await request(app)
        .get("/characteristics")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe("Itens de Inventário", () => {
    it("1. deve criar um item", async () => {
      const itemData = {
        itemCharacteristicsId: characteristicId,
        itemConditionId: conditionId,
        ownerType: "school",
        rentFee: 20,
      };

      const response = await request(app)
        .post("/items")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(itemData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("itemId");
      expect(Number(response.body.schoolItem?.rentFee)).toBe(20);
      itemId = response.body.itemId;
    });

    it("2. deve listar os itens", async () => {
      const response = await request(app)
        .get("/items")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("3. deve atualizar um item", async () => {
      const updateData = {
        rentFee: 30,
      };

      const response = await request(app)
        .put(`/items/${itemId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
    });
  });

  describe("Validações", () => {
    it("deve impedir criação de categoria sem autenticação", async () => {
      const response = await request(app)
        .post("/inventory-references/categories")
        .send({ name: "Falha" });

      expect(response.status).toBe(401);
    });
  });
});
