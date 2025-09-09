// server/routes/tasks.ts
import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';
import logger from '../config/logger.js';
import { Prisma, TaskStatus, TaskPriority, User } from '@prisma/client';

const router = express.Router();

// Interface para o relatório de produtividade
type ProductivityStats = {
  user: Partial<User>;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  averageCompletionTime: number; // in hours
  completionTimes: number[]; // temporary for calculation
};

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar tasks
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(String(req.query.page) || '1');
    const limit = parseInt(String(req.query.limit) || '20');
    const status = req.query.status ? String(req.query.status) as TaskStatus : undefined;
    const assigneeId = req.query.assigneeId ? String(req.query.assigneeId) : undefined;
    const priority = req.query.priority ? String(req.query.priority) as TaskPriority : undefined;
    const month = req.query.month ? parseInt(String(req.query.month)) : undefined;
    const year = req.query.year ? parseInt(String(req.query.year)) : undefined;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {
      companyId: req.user!.companyId
    };

    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    if (priority) where.priority = priority;

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      where.createdAt = { gte: startDate, lte: endDate };
    }

    if (req.user!.role === 'USER') {
      where.assigneeId = req.user!.id;
    }

    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          creator: { select: { name: true, email: true } }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.task.count({ where })
    ]);

    res.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Erro ao listar tasks:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar task por ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const where: Prisma.TaskWhereUniqueInput = {
      id: req.params.id,
      companyId: req.user!.companyId
    };

    if (req.user!.role === 'USER') {
      where.assigneeId = req.user!.id;
    }

    const task = await prisma.task.findFirst({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { name: true, email: true } }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task não encontrada' });
    }

    res.json(task);
  } catch (error) {
    logger.error('Erro ao buscar task:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar task (apenas ADMIN/OWNER)
router.post('/', requireRole(['ADMIN', 'OWNER']), [
  body('title').notEmpty().withMessage('Título é obrigatório'),
  body('assigneeId').notEmpty().withMessage('Funcionário responsável é obrigatório'),
  body('priority').isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Prioridade inválida')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, assigneeId, priority, dueDate } = req.body;

    const assignee = await prisma.user.findFirst({
      where: {
        id: assigneeId,
        companyId: req.user!.companyId
      }
    });

    if (!assignee) {
      return res.status(400).json({ error: 'Funcionário não encontrado' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        assigneeId,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        creatorId: req.user!.id,
        companyId: req.user!.companyId
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { name: true, email: true } }
      }
    });

    logger.info('Task criada', {
      taskId: task.id,
      title,
      assigneeId,
      creatorId: req.user!.id
    });

    res.status(201).json(task);
  } catch (error) {
    logger.error('Erro ao criar task:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar status da task
router.put('/:id/status', [
  body('status').isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).withMessage('Status inválido')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body as { status: TaskStatus };

    const where: Prisma.TaskWhereInput = {
      id: req.params.id,
      companyId: req.user!.companyId
    };

    if (req.user!.role === 'USER') {
      where.assigneeId = req.user!.id;
    }

    const existingTask = await prisma.task.findFirst({ where });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task não encontrada' });
    }

    const updateData: Prisma.TaskUpdateInput = { status };

    if (status === 'IN_PROGRESS' && !existingTask.startedAt) {
      updateData.startedAt = new Date();
    } else if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { name: true, email: true } }
      }
    });

    logger.info('Status da task atualizado', {
      taskId: task.id,
      status,
      userId: req.user!.id
    });

    res.json(task);
  } catch (error) {
    logger.error('Erro ao atualizar status da task:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar task completa (apenas ADMIN/OWNER)
router.put('/:id', requireRole(['ADMIN', 'OWNER']), [
  body('title').optional().notEmpty().withMessage('Título não pode estar vazio'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Prioridade inválida')
], async (req: AuthRequest, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, assigneeId, priority, dueDate } = req.body;

        const existingTask = await prisma.task.findFirst({
            where: { id: req.params.id, companyId: req.user!.companyId }
        });

        if (!existingTask) {
            return res.status(404).json({ error: 'Task não encontrada' });
        }

        if (assigneeId) {
            const assignee = await prisma.user.findFirst({
                where: { id: assigneeId, companyId: req.user!.companyId }
            });
            if (!assignee) {
                return res.status(400).json({ error: 'Funcionário não encontrado' });
            }
        }

        const updateData: Prisma.TaskUpdateInput = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
        if (priority !== undefined) updateData.priority = priority;
        if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

        const task = await prisma.task.update({
            where: { id: req.params.id },
            data: updateData,
            include: {
                assignee: { select: { id: true, name: true, email: true } },
                creator: { select: { name: true, email: true } }
            }
        });

        logger.info('Task atualizada', { taskId: task.id, userId: req.user!.id });

        res.json(task);
    } catch (error) {
        logger.error('Erro ao atualizar task:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Relatório de produtividade por funcionário
router.get('/reports/productivity', requireRole(['ADMIN', 'OWNER']), async (req: AuthRequest, res: Response) => {
    try {
        const month = req.query.month ? parseInt(String(req.query.month)) : undefined;
        const year = req.query.year ? parseInt(String(req.query.year)) : undefined;
        const userId = req.query.userId ? String(req.query.userId) : undefined;

        const where: Prisma.TaskWhereInput = {
            companyId: req.user!.companyId,
        };
        
        if (month && year) {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0, 23, 59, 59);
            where.createdAt = { gte: start, lte: end };
        }

        if (userId) {
            where.assigneeId = userId;
        }

        const tasks = await prisma.task.findMany({
            where,
            include: { assignee: { select: { id: true, name: true, email: true } } }
        });

        const productivity = tasks.reduce((acc: Record<string, ProductivityStats>, task) => {
            if (!task.assignee) return acc;
            const assigneeId = task.assignee.id;
            
            if (!acc[assigneeId]) {
                acc[assigneeId] = {
                    user: task.assignee, totalTasks: 0, completedTasks: 0,
                    inProgressTasks: 0, pendingTasks: 0,
                    averageCompletionTime: 0, completionTimes: []
                };
            }

            acc[assigneeId].totalTasks += 1;
            switch (task.status) {
                case 'COMPLETED':
                    acc[assigneeId].completedTasks += 1;
                    if (task.startedAt && task.completedAt) {
                        const completionTime = task.completedAt.getTime() - task.startedAt.getTime();
                        acc[assigneeId].completionTimes.push(completionTime);
                    }
                    break;
                case 'IN_PROGRESS': acc[assigneeId].inProgressTasks += 1; break;
                case 'PENDING': acc[assigneeId].pendingTasks += 1; break;
            }
            return acc;
        }, {});

        Object.values(productivity).forEach((stats) => {
            if (stats.completionTimes.length > 0) {
                const avgTime = stats.completionTimes.reduce((sum, time) => sum + time, 0) / stats.completionTimes.length;
                stats.averageCompletionTime = Math.round(avgTime / (1000 * 60 * 60)); // em horas
            }
            delete stats.completionTimes;
        });

        res.json(Object.values(productivity));
    } catch (error) {
        logger.error('Erro ao gerar relatório de produtividade:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});


// Visão geral da equipe
router.get('/reports/team-overview', requireRole(['ADMIN', 'OWNER']), async (req: AuthRequest, res: Response) => {
    try {
        const activeTasks = await prisma.task.findMany({
            where: {
                companyId: req.user!.companyId,
                status: { in: ['PENDING', 'IN_PROGRESS'] }
            },
            include: { assignee: { select: { id: true, name: true, email: true } } }
        });

        const allUsers = await prisma.user.findMany({
            where: {
                companyId: req.user!.companyId,
                role: { in: ['USER', 'CASHIER', 'ADMIN'] }
            },
            select: { id: true, name: true, email: true, role: true }
        });

        const teamOverview = allUsers.map(user => {
            const userTasks = activeTasks.filter(task => task.assigneeId === user.id);
            const inProgressTasks = userTasks.filter(task => task.status === 'IN_PROGRESS');
            const pendingTasks = userTasks.filter(task => task.status === 'PENDING');

            return {
                user,
                status: inProgressTasks.length > 0 ? 'WORKING' : 'IDLE',
                activeTasks: userTasks.length,
                inProgressTasks: inProgressTasks.length,
                pendingTasks: pendingTasks.length,
                currentTasks: inProgressTasks.map(task => ({
                    id: task.id,
                    title: task.title,
                    priority: task.priority,
                    startedAt: task.startedAt,
                    timeWorking: task.startedAt ? Math.round((new Date().getTime() - task.startedAt.getTime()) / (1000 * 60 * 60)) : 0
                }))
            };
        });

        res.json(teamOverview);
    } catch (error) {
        logger.error('Erro ao gerar visão geral da equipe:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});


// Deletar task (apenas ADMIN/OWNER)
router.delete('/:id', requireRole(['ADMIN', 'OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user!.companyId
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task não encontrada' });
    }

    await prisma.task.delete({
      where: { id: req.params.id }
    });

    logger.info('Task deletada', { taskId: req.params.id, userId: req.user!.id });

    res.json({ message: 'Task deletada com sucesso' });
  } catch (error) {
    logger.error('Erro ao deletar task:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;