import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/db';

export const ensureAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: { message: 'Token não fornecido.' } });
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: { message: 'Token inválido.' } });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & { userTypeId: number };
    
    const dbUser = await prisma.user.findUnique({
      where: { userId: Number(decoded.sub) }
    });

    if (!dbUser || !dbUser.userIsActive || dbUser.userTypeId !== decoded.userTypeId) {
      return res.status(401).json({ error: { message: 'Token expirado ou inválido.' } });
    }

    res.locals.user = { id: decoded.sub || '', userTypeId: decoded.userTypeId };
    return next();
  } catch (err) {
    return res.status(401).json({ error: { message: 'Token expirado ou inválido.' } });
  }
};
