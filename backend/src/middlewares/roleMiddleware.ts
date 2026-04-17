import { Request, Response, NextFunction } from 'express';

export function requireRole(...allowedTypeIds: number[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userTypeId = (req as any).user?.userTypeId;

    if (!allowedTypeIds.includes(userTypeId)) {
      return res.status(403).json({ error: 'Sem permissão.' });
    }
    next();
  };
}