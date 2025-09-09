// server/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import logger from '../config/logger.js';
import { User, Company } from '@prisma/client';

interface JwtPayload {
  userId: string; // O ID no JWT geralmente é uma string
}

// A CORREÇÃO CRÍTICA ESTÁ AQUI: a palavra "export"
export interface AuthRequest extends Request {
  user?: User & { company: Company | null };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Tentativa de acesso sem token', { ip: req.ip, url: req.url });
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { company: true }
    });

    if (!user) {
      logger.warn('Token válido mas usuário não encontrado', { userId: decoded.userId });
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.warn('Token inválido', { token: token.substring(0, 20) + '...', error: (error as Error).message });
    return res.status(403).json({ error: 'Token inválido' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      logger.warn('Acesso negado por role', {
        userId: req.user?.id,
        userRole: req.user?.role,
        requiredRoles: roles
      });
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
};