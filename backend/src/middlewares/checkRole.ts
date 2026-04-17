import { Request, Response, NextFunction } from 'express';
export const checkRole = (allowedRoles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    if (!user) {
      return res.status(401).json({ error: { message: 'Não autenticado.' } });
    }
    if (!allowedRoles.includes(user.userTypeId)) {
      return res.status(403).json({ error: { message: 'Sem permissão para realizar esta ação.' } });
    }
    return next();
  };
};
