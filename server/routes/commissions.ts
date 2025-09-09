// server/routes/commissions.ts
import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';
import logger from '../config/logger.js';
import { Prisma, User } from '@prisma/client';

const router = express.Router();

// Estrutura para o relatório de comissões
interface UserCommissionReport {
  user: Partial<User>;
  totalCommissions: number;
  commissionsCount: number;
  totalSales: number;
  averageCommissionRate: number;
}

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar comissões
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(String(req.query.page) || '1');
    const limit = parseInt(String(req.query.limit) || '20');
    const userId = req.query.userId ? String(req.query.userId) : undefined;
    const month = req.query.month ? parseInt(String(req.query.month)) : undefined;
    const year = req.query.year ? parseInt(String(req.query.year)) : undefined;
    const skip = (page - 1) * limit;

    const where: Prisma.CommissionWhereInput = {
      companyId: req.user!.companyId
    };

    if (req.user!.role === 'USER' || req.user!.role === 'CASHIER') {
      where.userId = req.user!.id;
    } else if (userId) {
      where.userId = userId;
    }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      where.createdAt = { gte: startDate, lte: endDate };
    }

    const [commissions, total] = await prisma.$transaction([
      prisma.commission.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          sale: {
            select: { id: true, clientName: true, finalTotal: true, createdAt: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.commission.count({ where })
    ]);

    const totalCommissionsValue = commissions.reduce((sum, comm) => sum + Number(comm.amount), 0);

    res.json({
      commissions,
      summary: {
        totalCommissions: totalCommissionsValue,
        commissionsCount: total
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Erro ao listar comissões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Relatório de comissões por funcionário
router.get('/reports/by-user', requireRole(['ADMIN', 'OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const month = req.query.month ? parseInt(String(req.query.month)) : undefined;
    const year = req.query.year ? parseInt(String(req.query.year)) : undefined;
    
    const where: Prisma.CommissionWhereInput = {
      companyId: req.user!.companyId,
    };
    
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      where.createdAt = { gte: start, lte: end };
    }

    const commissions = await prisma.commission.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        sale: { select: { finalTotal: true } }
      }
    });

    const commissionsByUser = commissions.reduce((acc: Record<string, UserCommissionReport>, commission) => {
      const userId = commission.user.id;
      
      if (!acc[userId]) {
        acc[userId] = {
          user: commission.user,
          totalCommissions: 0,
          commissionsCount: 0,
          totalSales: 0,
          averageCommissionRate: 0
        };
      }

      acc[userId].totalCommissions += Number(commission.amount);
      acc[userId].commissionsCount += 1;
      acc[userId].totalSales += Number(commission.sale.finalTotal);

      return acc;
    }, {});

    Object.values(commissionsByUser).forEach((stats) => {
      if (stats.totalSales > 0) {
        stats.averageCommissionRate = (stats.totalCommissions / stats.totalSales) * 100;
      }
    });

    res.json(Object.values(commissionsByUser));
  } catch (error) {
    logger.error('Erro ao gerar relatório de comissões por funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Configurar percentual de comissão para um funcionário
router.put('/config/:userId', requireRole(['ADMIN', 'OWNER']), [
  body('percentage').isFloat({ min: 0, max: 50 }).withMessage('Percentual deve estar entre 0 e 50')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { percentage } = req.body;
    const { userId } = req.params;

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: req.user!.companyId
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }
    
    // Supondo que você adicionará um campo `commissionPercentage` ao modelo User
    // const updatedUser = await prisma.user.update({
    //   where: { id: userId },
    //   data: { commissionPercentage: parseFloat(percentage) }
    // });

    logger.info('Percentual de comissão configurado', { 
      userId, 
      percentage, 
      configuredBy: req.user!.id 
    });

    res.json({ 
      message: 'Percentual de comissão configurado com sucesso (funcionalidade a ser implementada)',
      userId,
      percentage: parseFloat(percentage)
    });
  } catch (error) {
    logger.error('Erro ao configurar comissão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;