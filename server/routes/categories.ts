// server/routes/categories.ts
import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import logger from '../config/logger.js';
import { Prisma } from '@prisma/client';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar categorias
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query;

    const where: Prisma.CategoryWhereInput = {
      companyId: req.user!.companyId
    };

    if (type && ['REVENUE', 'EXPENSE', 'BOTH'].includes(String(type))) {
      where.type = String(type) as 'REVENUE' | 'EXPENSE' | 'BOTH';
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            revenues: true,
            expenses: true
          }
        }
      }
    });

    res.json(categories);
  } catch (error) {
    logger.error('Erro ao listar categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar categoria por ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const category = await prisma.category.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user!.companyId
      },
      include: {
        _count: {
          select: {
            revenues: true,
            expenses: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    res.json(category);
  } catch (error) {
    logger.error('Erro ao buscar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar categoria
router.post('/', [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('type').isIn(['REVENUE', 'EXPENSE', 'BOTH']).withMessage('Tipo deve ser REVENUE, EXPENSE ou BOTH'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Cor deve estar no formato hexadecimal (#RRGGBB)')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, type, color } = req.body;

    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        companyId: req.user!.companyId
      }
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Já existe uma categoria com este nome' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        type,
        color: color || '#3B82F6',
        companyId: req.user!.companyId
      },
      include: {
        _count: {
          select: {
            revenues: true,
            expenses: true
          }
        }
      }
    });

    logger.info('Categoria criada', { categoryId: category.id, name, userId: req.user!.id });

    res.status(201).json(category);
  } catch (error) {
    logger.error('Erro ao criar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar categoria
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Nome não pode estar vazio'),
  body('type').optional().isIn(['REVENUE', 'EXPENSE', 'BOTH']).withMessage('Tipo deve ser REVENUE, EXPENSE ou BOTH'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Cor deve estar no formato hexadecimal (#RRGGBB)')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, type, color } = req.body;

    const existingCategory = await prisma.category.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user!.companyId
      }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    if (name && name !== existingCategory.name) {
      const nameConflict = await prisma.category.findFirst({
        where: {
          name,
          companyId: req.user!.companyId,
          id: { not: req.params.id }
        }
      });

      if (nameConflict) {
        return res.status(400).json({ error: 'Já existe uma categoria com este nome' });
      }
    }

    const updateData: Prisma.CategoryUpdateInput = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (color !== undefined) updateData.color = color;

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        _count: {
          select: {
            revenues: true,
            expenses: true
          }
        }
      }
    });

    logger.info('Categoria atualizada', { categoryId: category.id, userId: req.user!.id });

    res.json(category);
  } catch (error) {
    logger.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar categoria
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const category = await prisma.category.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user!.companyId
      },
      include: {
        _count: {
          select: {
            revenues: true,
            expenses: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    if (category._count.revenues > 0 || category._count.expenses > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar uma categoria que possui receitas ou despesas associadas' 
      });
    }

    await prisma.category.delete({
      where: { id: req.params.id }
    });

    logger.info('Categoria deletada', { categoryId: req.params.id, userId: req.user!.id });

    res.json({ message: 'Categoria deletada com sucesso' });
  } catch (error) {
    logger.error('Erro ao deletar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;