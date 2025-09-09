// server/routes/products.ts
import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';
import logger from '../config/logger.js';
import { Prisma } from '@prisma/client';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar produtos
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(String(req.query.page) || '1');
    const limit = parseInt(String(req.query.limit) || '20');
    const categoryId = req.query.categoryId ? String(req.query.categoryId) : undefined;
    const lowStock = req.query.lowStock === 'true';
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      companyId: req.user!.companyId
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    // TODO: A lógica original para lowStock estava incorreta.
    // A comparação direta de colunas (stock <= minStock) no `where` requer uma consulta raw.
    // Uma abordagem alternativa seria filtrar produtos onde stock <= 10.
    if (lowStock) {
        where.stock = { lte: 10 }; // Exemplo: estoque baixo é 10 ou menos
    }

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          _count: {
            select: {
              saleItems: true,
              stockMovements: true
            }
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar produto por ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user!.companyId
      },
      include: {
        category: true,
        stockMovements: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(product);
  } catch (error) {
    logger.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar produto
router.post('/', requireRole(['ADMIN', 'OWNER', 'CASHIER']), [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('price').isNumeric().withMessage('Preço deve ser numérico'),
  body('stock').isInt({ min: 0 }).withMessage('Estoque deve ser um número inteiro positivo'),
  body('categoryId').notEmpty().withMessage('Categoria é obrigatória')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, model, description, price, stock, minStock, categoryId } = req.body;

    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        companyId: req.user!.companyId,
        // Supondo que você tenha um tipo de categoria 'PRODUCT'
        // type: { in: ['PRODUCT', 'BOTH'] } 
      }
    });

    if (!category) {
      return res.status(400).json({ error: 'Categoria inválida' });
    }

    const product = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newProduct = await tx.product.create({
        data: {
          name,
          model,
          description,
          price: parseFloat(price),
          stock: parseInt(stock),
          minStock: parseInt(minStock) || 0,
          categoryId,
          companyId: req.user!.companyId
        },
        include: { category: true }
      });

      if (parseInt(stock) > 0) {
        await tx.stockMovement.create({
          data: {
            productId: newProduct.id,
            type: 'IN',
            quantity: parseInt(stock),
            reason: 'Estoque inicial',
            userId: req.user!.id
          }
        });
      }

      return newProduct;
    });

    logger.info('Produto criado', {
      productId: product.id,
      name,
      stock: parseInt(stock),
      userId: req.user!.id
    });

    res.status(201).json(product);
  } catch (error) {
    logger.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar produto
router.put('/:id', requireRole(['ADMIN', 'OWNER']), [
  body('name').optional().notEmpty().withMessage('Nome não pode estar vazio'),
  body('price').optional().isNumeric().withMessage('Preço deve ser numérico'),
  body('minStock').optional().isInt({ min: 0 }).withMessage('Estoque mínimo deve ser um número inteiro positivo')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, model, description, price, minStock, categoryId } = req.body;

    const existingProduct = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user!.companyId
      }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          companyId: req.user!.companyId,
        }
      });

      if (!category) {
        return res.status(400).json({ error: 'Categoria inválida' });
      }
    }

    const updateData: Prisma.ProductUpdateInput = {};
    if (name !== undefined) updateData.name = name;
    if (model !== undefined) updateData.model = model;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (minStock !== undefined) updateData.minStock = parseInt(minStock);
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData,
      include: { category: true }
    });

    logger.info('Produto atualizado', { productId: product.id, userId: req.user!.id });

    res.json(product);
  } catch (error) {
    logger.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Ajustar estoque
router.post('/:id/stock', requireRole(['ADMIN', 'OWNER', 'CASHIER']), [
  body('quantity').isInt().withMessage('Quantidade deve ser um número inteiro'),
  body('type').isIn(['IN', 'OUT', 'ADJUSTMENT']).withMessage('Tipo deve ser IN, OUT ou ADJUSTMENT'),
  body('reason').notEmpty().withMessage('Motivo é obrigatório')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { quantity, type, reason } = req.body;
    const numericQuantity = parseInt(quantity);

    const product = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user!.companyId
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    let newStock = product.stock;
    
    switch (type) {
      case 'IN':
        newStock += numericQuantity;
        break;
      case 'OUT':
        newStock -= numericQuantity;
        break;
      case 'ADJUSTMENT':
        newStock = numericQuantity;
        break;
    }

    if (newStock < 0) {
      return res.status(400).json({ error: 'Estoque não pode ficar negativo' });
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedProduct = await tx.product.update({
        where: { id: req.params.id },
        data: { stock: newStock },
        include: { category: true }
      });

      await tx.stockMovement.create({
        data: {
          productId: req.params.id,
          type,
          quantity: Math.abs(numericQuantity),
          reason,
          userId: req.user!.id
        }
      });

      return updatedProduct;
    });

    logger.info('Estoque ajustado', {
      productId: req.params.id,
      type,
      quantity,
      newStock,
      userId: req.user!.id
    });

    res.json(result);
  } catch (error) {
    logger.error('Erro ao ajustar estoque:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar produto
router.delete('/:id', requireRole(['ADMIN', 'OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user!.companyId
      },
      include: {
        _count: {
          select: { saleItems: true }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    if (product._count.saleItems > 0) {
      return res.status(400).json({
        error: 'Não é possível deletar um produto que possui vendas associadas'
      });
    }

    await prisma.product.delete({
      where: { id: req.params.id }
    });

    logger.info('Produto deletado', { productId: req.params.id, userId: req.user!.id });

    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    logger.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;