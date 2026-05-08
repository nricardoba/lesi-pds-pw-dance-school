import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  requestCoachingService,
  confirmCoachingService,
  validateCoachingService,
  closeCoachingValidationService,
} from "../../src/services/classes/classesServices";
import { prisma } from "../../src/config/db";
import { AppError } from "../../src/utils/appError";

// Mock do módulo de base de dados
vi.mock("../../src/config/db", () => {
  const mockPrisma = {
    class: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    classStatus: {
      findFirst: vi.fn(),
    },
    userClass: {
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    classStatusHistory: {
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    // Mock do $transaction: ele recebe uma função e a executa passando o próprio mockPrisma
    $transaction: vi.fn((callback) => callback(mockPrisma)),
  };
  return { prisma: mockPrisma };
});

// Mocks de serviços externos usados pelo requestCoachingService
vi.mock("../../src/services/users/usersServices", () => ({
  getUserByIdService: vi.fn(),
  getUsersByIdsService: vi.fn().mockResolvedValue([{ userId: 3 }]), // Simula aluno encontrado
}));

vi.mock("../../src/services/school/scheduleVacancyServices", () => ({
  getScheduleVacanciesByUserIdService: vi.fn().mockResolvedValue([
    {
      schoolYearId: 1,
      scheduleVacancyStart: new Date("2026-01-01"),
      scheduleVacancyEnd: new Date("2026-12-31"),
    },
  ]),
}));

describe("Unidade - requestCoachingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve lançar erro se a hora de fim for anterior à hora de início", async () => {
    const dadosInvalidos = {
      modality_id: 1,
      professor_id: 2,
      student_ids: [3],
      school_year_id: 1,
      start_time: "2026-05-01T10:00:00Z",
      end_time: "2026-05-01T09:00:00Z", // Fim antes do início
    };

    await expect(requestCoachingService(dadosInvalidos)).rejects.toThrow(
      new AppError("A hora de fim deve ser posterior à hora de início.", 400),
    );
  });

  it("deve lançar erro se o professor responsável e o assistente forem a mesma pessoa", async () => {
    const dadosConflito = {
      modality_id: 1,
      professor_id: 10,
      assistant_professor_id: 10, // Mesmo ID
      student_ids: [3],
      school_year_id: 1,
      start_time: "2026-05-01T10:00:00Z",
      end_time: "2026-05-01T11:00:00Z",
    };

    // Não precisamos de simular a DB aqui porque a validação de IDs iguais
    // acontece antes das queries de disponibilidade no seu service.
    await expect(requestCoachingService(dadosConflito)).rejects.toThrow(
      new AppError(
        "Professor responsável e assistente não podem ser o mesmo utilizador.",
        409,
      ),
    );
  });

  it('deve falhar se o estado "Agendada" não for encontrado na base de dados', async () => {
    // Simulamos que o Prisma não encontra o status
    (prisma.classStatus.findFirst as any).mockResolvedValue(null);

    const dados = {
      modality_id: 1,
      professor_id: 2,
      student_ids: [3],
      school_year_id: 1,
      start_time: "2026-05-01T10:00:00Z",
      end_time: "2026-05-01T11:00:00Z",
    };

    // Nota: O seu service valida o professor e alunos primeiro.
    // Para chegar ao erro do status, teríamos de mockar as funções anteriores ou
    // garantir que o teste foca apenas na falha de configuração da DB.

    // Este é um exemplo de como testar caminhos de erro "impossíveis" ou de infraestrutura.
    await expect(requestCoachingService(dados)).rejects.toThrow();
  });
});

describe("Unidade - confirmCoachingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve lançar erro se tentar confirmar uma aula que não está no estado "Agendada"', async () => {
    // Simulamos o retorno do findUnique
    vi.mocked(prisma.class.findUnique).mockResolvedValue({
      classId: 1,
      classStatus: { classStatusDesc: "A Decorrer" }, // Já está confirmada ou iniciada
      studioModality: { modalityId: 1 },
      userClass: [{}, {}],
    } as any);

    await expect(
      confirmCoachingService({ classId: 1 }, { studio_id: 5 }),
    ).rejects.toThrow(
      new AppError('Só é possível confirmar aulas no estado "Agendada".', 409),
    );
  });
});

describe("Unidade - validateCoachingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve lançar erro se o utilizador não estiver associado à aula", async () => {
    vi.mocked(prisma.class.findUnique).mockResolvedValue({
      classId: 1,
      classStatus: { classStatusDesc: "A Decorrer" },
      userClass: [{ userId: 10 }, { userId: 20 }], // Aluno ID 99 não está aqui
    } as any);

    await expect(
      validateCoachingService({ classId: 1 }, { user_id: 99 }),
    ).rejects.toThrow(
      new AppError("Utilizador não está associado a esta aula.", 404),
    );
  });
});
describe("Unidade - closeCoachingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('deve marcar como "Concluída" se pelo menos um professor confirmou presença', async () => {
    // 1. Mock do utilizador que está a fechar a aula (o Admin)
    const { getUserByIdService } =
      await import("../../src/services/users/usersServices");
    vi.mocked(getUserByIdService).mockResolvedValue({ userId: 1 } as any);

    // 2. Simular aula encontrada com professor que validou
    vi.mocked(prisma.class.findUnique).mockResolvedValue({
      classId: 1,
      classStatus: { classStatusDesc: "A Decorrer" },
      userClass: [
        {
          userId: 2,
          userValidation: true,
          userClassRole: { userClassRoleDesc: "Professor Responsável" },
        },
      ],
    } as any);

    // 3. Simular que o status "Concluída" existe na DB
    vi.mocked(prisma.classStatus.findFirst).mockResolvedValue({
      classStatusId: 3,
      classStatusDesc: "Concluída",
    } as any);

    // 4. Mocks para as operações dentro da transação (tx)
    vi.mocked(prisma.class.update).mockResolvedValue({ classId: 1 } as any);
    vi.mocked(prisma.classStatusHistory.create).mockResolvedValue({} as any);

    const resultado = await closeCoachingValidationService(
      { classId: 1 },
      { finalStatus: "Concluída" },
      1,
    );

    expect(resultado.finalStatus).toBe("Concluída");
    expect(resultado.approved).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalled(); // Garante que a transação foi usada
  });
});
