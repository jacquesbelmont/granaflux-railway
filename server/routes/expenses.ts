import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticateToken } from '../middleware/auth';
import logger from '../config/logger';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar despesas
router.get('/', async (req: any, res) => {
  try {
    const { page = 1, limit = 10, categoryId, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {
      companyId: req.user.companyId
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          category: true,
          user: { select: { name: true, email: true } }
        },
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.expense.count({ where })
    ]);

    logger.info('Despesas listadas', { 
      companyId: req.user.companyId, 
      count: expenses.length, 
      total 
    });

    res.json({
      expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Erro ao listar despesas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar despesa por ID
router.get('/:id', async (req: any, res) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user.companyId
      },
      include: {
        category: true,
        user: { select: { name: true, email: true } }
      }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }

    res.json(expense);
  } catch (error) {
    logger.error('Erro ao buscar despesa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar despesa
router.post('/', [
  body('description').notEmpty().withMessage('Descrição é obrigatória'),
  body('amount').isNumeric().withMessage('Valor deve ser numérico'),
  body('date').isISO8601().withMessage('Data inválida'),
  body('categoryId').notEmpty().withMessage('Categoria é obrigatória')
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { description, amount, date, categoryId, notes, attachment } = req.body;

    // Verificar se a categoria existe e pertence à empresa
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        companyId: req.user.companyId,
        type: { in: ['EXPENSE', 'BOTH'] }
      }
    });

    if (!category) {
      return res.status(400).json({ error: 'Categoria inválida' });
    }

    const expense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        categoryId,
        companyId: req.user.companyId,
        userId: req.user.id,
        notes,
        attachment
      },
      include: {
        category: true,
        user: { select: { name: true, email: true } }
      }
    });

    logger.info('Despesa criada', { 
      expenseId: expense.id, 
      amount: expense.amount, 
      userId: req.user.id 
    });

    res.status(201).json(expense);
  } catch (error) {
    logger.error('Erro ao criar despesa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar despesa
router.put('/:id', [
  body('description').optional().notEmpty().withMessage('Descrição não pode estar vazia'),
  body('amount').optional().isNumeric().withMessage('Valor deve ser numérico'),
  body('date').optional().isISO8601().withMessage('Data inválida'),
  body('categoryId').optional().notEmpty().withMessage('Categoria não pode estar vazia')
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { description, amount, date, categoryId, notes, attachment } = req.body;

    // Verificar se a despesa existe e pertence à empresa
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user.companyId
      }
    });

    if (!existingExpense) {
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }

    // Se categoryId foi fornecido, verificar se é válido
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          companyId: req.user.companyId,
          type: { in: ['EXPENSE', 'BOTH'] }
        }
      });

      if (!category) {
        return res.status(400).json({ error: 'Categoria inválida' });
      }
    }

    const updateData: any = {};
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (date !== undefined) updateData.date = new Date(date);
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (notes !== undefined) updateData.notes = notes;
    if (attachment !== undefined) updateData.attachment = attachment;

    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        category: true,
        user: { select: { name: true, email: true } }
      }
    });

    logger.info('Despesa atualizada', { expenseId: expense.id, userId: req.user.id });

    res.json(expense);
  } catch (error) {
    logger.error('Erro ao atualizar despesa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar despesa
router.delete('/:id', async (req: any, res) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user.companyId
      }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }

    await prisma.expense.delete({
      where: { id: req.params.id }
    });

    logger.info('Despesa deletada', { expenseId: req.params.id, userId: req.user.id });

    res.json({ message: 'Despesa deletada com sucesso' });
  } catch (error) {
    logger.error('Erro ao deletar despesa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;