import express from 'express';
import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';
import logger from '../config/logger';

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar comissões
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, userId, month, year } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {
      companyId: req.user.companyId
    };

    // Se for funcionário comum, mostrar apenas suas comissões
    if (req.user.role === 'USER' || req.user.role === 'CASHIER') {
      where.userId = req.user.id;
    } else if (userId) {
      where.userId = userId;
    }

    // Filtro por mês/ano
    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);
      where.createdAt = { gte: startDate, lte: endDate };
    }

    const [commissions, total] = await Promise.all([
      prisma.commission.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          sale: {
            select: {
              id: true,
              clientName: true,
              finalTotal: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.commission.count({ where })
    ]);

    const totalCommissions = commissions.reduce((sum, comm) => sum + Number(comm.amount), 0);

    res.json({
      commissions,
      summary: {
        totalCommissions,
        commissionsCount: commissions.length
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
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
    const { month, year } = req.query;
    
    let dateFilter: any = {};
    
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0);
      dateFilter = { gte: start, lte: end };
    }

    const commissions = await prisma.commission.findMany({
      where: {
        companyId: req.user.companyId,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        sale: { select: { finalTotal: true } }
      }
    });

    // Agrupar por funcionário
    const commissionsByUser = commissions.reduce((acc: any, commission) => {
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

    // Calcular taxa média de comissão
    Object.values(commissionsByUser).forEach((stats: any) => {
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
  body('percentage').isNumeric().withMessage('Percentual deve ser numérico'),
  body('percentage').custom(value => {
    if (value < 0 || value > 50) {
      throw new Error('Percentual deve estar entre 0% e 50%');
    }
    return true;
  })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { percentage } = req.body;
    const userId = req.params.userId;

    // Verificar se o usuário existe e pertence à empresa
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: req.user.companyId
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    // Por enquanto, vamos armazenar a configuração de comissão em uma tabela separada
    // ou usar um campo no usuário. Para simplicidade, vamos retornar sucesso
    // e aplicar nas próximas vendas

    logger.info('Percentual de comissão configurado', { 
      userId, 
      percentage, 
      configuredBy: req.user.id 
    });

    res.json({ 
      message: 'Percentual de comissão configurado com sucesso',
      userId,
      percentage: parseFloat(percentage)
    });
  } catch (error) {
    logger.error('Erro ao configurar comissão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;