import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';
import logger from '../config/logger';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar tasks
router.get('/', async (req: any, res) => {
  try {
    const { page = 1, limit = 20, status, assigneeId, priority, month, year } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {
      companyId: req.user.companyId
    };

    // Filtros
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    if (priority) where.priority = priority;

    // Filtro por mês/ano
    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);
      where.createdAt = { gte: startDate, lte: endDate };
    }

    // Se for funcionário comum, mostrar apenas suas tasks
    if (req.user.role === 'USER') {
      where.assigneeId = req.user.id;
    }

    const [tasks, total] = await Promise.all([
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
        take: parseInt(limit)
      }),
      prisma.task.count({ where })
    ]);

    res.json({
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Erro ao listar tasks:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar task por ID
router.get('/:id', async (req: any, res) => {
  try {
    const where: any = {
      id: req.params.id,
      companyId: req.user.companyId
    };

    // Se for funcionário comum, só pode ver suas próprias tasks
    if (req.user.role === 'USER') {
      where.assigneeId = req.user.id;
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
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, assigneeId, priority, dueDate } = req.body;

    // Verificar se o funcionário existe e pertence à empresa
    const assignee = await prisma.user.findFirst({
      where: {
        id: assigneeId,
        companyId: req.user.companyId
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
        creatorId: req.user.id,
        companyId: req.user.companyId
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
      creatorId: req.user.id 
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
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    const where: any = {
      id: req.params.id,
      companyId: req.user.companyId
    };

    // Funcionários só podem atualizar suas próprias tasks
    if (req.user.role === 'USER') {
      where.assigneeId = req.user.id;
    }

    const existingTask = await prisma.task.findFirst({ where });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task não encontrada' });
    }

    const updateData: any = { status };

    // Registrar timestamps baseado no status
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
      userId: req.user.id 
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
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, assigneeId, priority, dueDate } = req.body;

    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user.companyId
      }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task não encontrada' });
    }

    // Verificar se o novo assignee existe (se fornecido)
    if (assigneeId) {
      const assignee = await prisma.user.findFirst({
        where: {
          id: assigneeId,
          companyId: req.user.companyId
        }
      });

      if (!assignee) {
        return res.status(400).json({ error: 'Funcionário não encontrado' });
      }
    }

    const updateData: any = {};
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

    logger.info('Task atualizada', { taskId: task.id, userId: req.user.id });

    res.json(task);
  } catch (error) {
    logger.error('Erro ao atualizar task:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Relatório de produtividade por funcionário
router.get('/reports/productivity', requireRole(['ADMIN', 'OWNER']), async (req: any, res) => {
  try {
    const { month, year, userId } = req.query;
    
    let dateFilter: any = {};
    
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0);
      dateFilter = { gte: start, lte: end };
    }

    const where: any = {
      companyId: req.user.companyId,
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
    };

    if (userId) {
      where.assigneeId = userId;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } }
      }
    });

    // Agrupar por funcionário
    const productivity = tasks.reduce((acc: any, task) => {
      if (!task.assignee) return acc;

      const userId = task.assignee.id;
      
      if (!acc[userId]) {
        acc[userId] = {
          user: task.assignee,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          pendingTasks: 0,
          averageCompletionTime: 0,
          completionTimes: []
        };
      }

      acc[userId].totalTasks += 1;

      switch (task.status) {
        case 'COMPLETED':
          acc[userId].completedTasks += 1;
          if (task.startedAt && task.completedAt) {
            const completionTime = new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime();
            acc[userId].completionTimes.push(completionTime);
          }
          break;
        case 'IN_PROGRESS':
          acc[userId].inProgressTasks += 1;
          break;
        case 'PENDING':
          acc[userId].pendingTasks += 1;
          break;
      }

      return acc;
    }, {});

    // Calcular tempo médio de conclusão
    Object.values(productivity).forEach((stats: any) => {
      if (stats.completionTimes.length > 0) {
        const avgTime = stats.completionTimes.reduce((sum: number, time: number) => sum + time, 0) / stats.completionTimes.length;
        stats.averageCompletionTime = Math.round(avgTime / (1000 * 60 * 60)); // em horas
      }
      delete stats.completionTimes; // Remover array temporário
    });

    res.json(Object.values(productivity));
  } catch (error) {
    logger.error('Erro ao gerar relatório de produtividade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Visão geral da equipe
router.get('/reports/team-overview', requireRole(['ADMIN', 'OWNER']), async (req: any, res) => {
  try {
    const activeTasks = await prisma.task.findMany({
      where: {
        companyId: req.user.companyId,
        status: { in: ['PENDING', 'IN_PROGRESS'] }
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } }
      }
    });

    const allUsers = await prisma.user.findMany({
      where: {
        companyId: req.user.companyId,
        role: { in: ['USER', 'CASHIER'] }
      },
      select: { id: true, name: true, email: true, role: true }
    });

    // Agrupar tasks por funcionário
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
          timeWorking: task.startedAt ? 
            Math.round((new Date().getTime() - new Date(task.startedAt).getTime()) / (1000 * 60 * 60)) : 0
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
router.delete('/:id', requireRole(['ADMIN', 'OWNER']), async (req: any, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user.companyId
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task não encontrada' });
    }

    await prisma.task.delete({
      where: { id: req.params.id }
    });

    logger.info('Task deletada', { taskId: req.params.id, userId: req.user.id });

    res.json({ message: 'Task deletada com sucesso' });
  } catch (error) {
    logger.error('Erro ao deletar task:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;