import { Request, Response } from "express";
import { AppError } from "../utils/appError";
import {
  getAvailableStudiosService,
  getVacanciesService,
  requestCoachingService,
  confirmCoachingService,
  validateCoachingService,
  closeCoachingValidationService,
} from "../services/classes/coachingServices";

export const CoachingController = {
  // Fase 1 — listar estúdios disponíveis para uma modalidade
  async getAvailableStudios(req: Request, res: Response) {
    try {
      const { modalityId } = req.query;
      const studios = await getAvailableStudiosService(Number(modalityId));
      return res.json(studios);
    } catch (error) {
      if (error instanceof AppError) {
        return res
          .status(error.statusCode)
          .json({ error: { message: error.message } });
      }
      return res
        .status(500)
        .json({ error: { message: "Erro interno do servidor." } });
    }
  },

  // Fase 1 — listar vagas de um professor
  async getVacancies(req: Request, res: Response) {
    try {
      const { professorId, schoolYearId } = req.query;
      const vacancies = await getVacanciesService(
        Number(professorId),
        Number(schoolYearId),
      );
      return res.json(vacancies);
    } catch (error) {
      if (error instanceof AppError) {
        return res
          .status(error.statusCode)
          .json({ error: { message: error.message } });
      }
      return res
        .status(500)
        .json({ error: { message: "Erro interno do servidor." } });
    }
  },

  // Fase 1 — submeter pedido de coaching
  async requestCoaching(req: Request, res: Response) {
    try {
      const result = await requestCoachingService(req.body);
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        return res
          .status(error.statusCode)
          .json({ error: { message: error.message } });
      }
      return res
        .status(500)
        .json({ error: { message: "Erro interno do servidor." } });
    }
  },

  // Fase 2 — confirmar coaching
  async confirmCoaching(req: Request, res: Response) {
    try {
      const result = await confirmCoachingService(req.params);
      return res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        return res
          .status(error.statusCode)
          .json({ error: { message: error.message } });
      }
      return res
        .status(500)
        .json({ error: { message: "Erro interno do servidor." } });
    }
  },

  // Fase 3 — validar pós-coaching
  async validateCoaching(req: Request, res: Response) {
    try {
      const result = await validateCoachingService(req.params, req.body);
      return res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        return res
          .status(error.statusCode)
          .json({ error: { message: error.message } });
      }
      return res
        .status(500)
        .json({ error: { message: "Erro interno do servidor." } });
    }
  },
  
  async closeCoaching(req: Request, res: Response) {
    try {
      const closedBy = (req as any).user.userId; // ← vem do authMiddleware
      const result = await closeCoachingValidationService(req.params, closedBy);
      return res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        return res
          .status(error.statusCode)
          .json({ error: { message: error.message } });
      }
      return res
        .status(500)
        .json({ error: { message: "Erro interno do servidor." } });
    }
  },
};
