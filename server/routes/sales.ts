// server/routes/sales.ts
import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';
import logger from '../config/logger.js';
import { Prisma, User } from '@prisma/client';

const router = express.Router();

// Interfaces para tipar objetos complexos
type ProcessedItem = {
  productId: string | null;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type SellerStats = {
  seller: Partial<User>;
  totalSales: number;
  salesCount: number;
  totalCommissions: number;
};

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar vendas
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(String(req.query.page) || '1');
    const limit = parseInt(String(req.query.limit) || '20');
    const sellerId = req.query.sellerId ? String(req.query.sellerId) : undefined;
    const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
    const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;
    const skip = (page - 1) * limit;

    const where: Prisma.SaleWhereInput = {
      companyId: req.user!.companyId
    };

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [sales, total] = await prisma.$transaction([
      prisma.sale.findMany({
        where,
        include: {
          client: true,
          seller: { select: { name: true, email: true } },
          items: { include: { product: true } },
          commissions: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.sale.count({ where })
    ]);

    res.json({
      sales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Erro ao listar vendas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar venda por ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const sale = await prisma.sale.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user!.companyId
      },
      include: {
        client: true,
        seller: { select: { name: true, email: true } },
        items: { include: { product: true } },
        commissions: { include: { user: { select: { name: true } } } }
      }
    });

    if (!sale) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    res.json(sale);
  } catch (error) {
    logger.error('Erro ao buscar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar venda
router.post('/', requireRole(['ADMIN', 'OWNER', 'CASHIER']), [
  body('clientName').notEmpty().withMessage('Nome do cliente é obrigatório'),
  body('items').isArray({ min: 1 }).withMessage('Deve ter pelo menos um item'),
  body('paymentMethod').isIn(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BANK_TRANSFER', 'CHECK']).withMessage('Método de pagamento inválido'),
  body('items.*.itemName').notEmpty().withMessage('Nome do item é obrigatório'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser um número inteiro positivo'),
  body('items.*.unitPrice').isNumeric().withMessage('Preço unitário deve ser numérico')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { clientId, clientName, items, discount = 0, paymentMethod, notes } = req.body;

    if (clientId) {
      const client = await prisma.client.findFirst({
        where: { id: clientId, companyId: req.user!.companyId }
      });
      if (!client) {
        return res.status(400).json({ error: 'Cliente não encontrado' });
      }
    }

    let total = 0;
    const processedItems: ProcessedItem[] = [];

    for (const item of items) {
        const itemTotal = parseFloat(item.unitPrice) * parseInt(item.quantity);
        total += itemTotal;

        processedItems.push({
            productId: item.productId || null,
            itemName: item.itemName,
            description: item.description,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: itemTotal
        });

        if (item.productId) {
            const product = await prisma.product.findFirst({
                where: { id: item.productId, companyId: req.user!.companyId }
            });
            if (!product) {
                return res.status(400).json({ error: `Produto ${item.itemName} não encontrado` });
            }
            if (product.stock < parseInt(item.quantity)) {
                return res.status(400).json({ error: `Estoque insuficiente para ${item.itemName}. Disponível: ${product.stock}` });
            }
        }
    }

    const finalTotal = total - parseFloat(discount);

    const sale = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newSale = await tx.sale.create({
        data: {
          clientId: clientId || null, clientName, total,
          discount: parseFloat(discount), finalTotal, paymentMethod,
          notes, sellerId: req.user!.id, companyId: req.user!.companyId
        }
      });

      for (const item of processedItems) {
        await tx.saleItem.create({ data: { saleId: newSale.id, ...item } });
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });
          await tx.stockMovement.create({
            data: {
              productId: item.productId, type: 'OUT',
              quantity: item.quantity, reason: `Venda #${newSale.id}`,
              userId: req.user!.id
            }
          });
        }
      }

      const salesCategory = await tx.category.findFirst({
        where: {
          companyId: req.user!.companyId,
          type: { in: ['REVENUE', 'BOTH'] },
          name: { contains: 'Vendas', mode: 'insensitive' }
        }
      });

      if (salesCategory) {
        await tx.revenue.create({
          data: {
            description: `Venda para ${clientName}`, amount: finalTotal,
            date: new Date(), categoryId: salesCategory.id,
            companyId: req.user!.companyId, userId: req.user!.id,
            notes: `Venda #${newSale.id} - ${items.length} item(s)`
          }
        });
      }

      const seller = await tx.user.findUnique({ where: { id: req.user!.id } });
      if (seller && ['CASHIER', 'USER'].includes(seller.role)) {
        const commissionPercentage = 5.0; // TODO: Mover para configuração do usuário
        const commissionAmount = (finalTotal * commissionPercentage) / 100;
        await tx.commission.create({
          data: {
            saleId: newSale.id, userId: req.user!.id,
            percentage: commissionPercentage, amount: commissionAmount,
            companyId: req.user!.companyId
          }
        });
      }
      return newSale;
    });

    const completeSale = await prisma.sale.findUnique({
      where: { id: sale.id },
      include: {
        client: true, seller: { select: { name: true, email: true } },
        items: { include: { product: true } }, commissions: true
      }
    });

    logger.info('Venda criada', {
      saleId: sale.id, total: finalTotal,
      itemsCount: items.length, sellerId: req.user!.id
    });

    res.status(201).json(completeSale);
  } catch (error) {
    logger.error('Erro ao criar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Relatório de vendas por vendedor
router.get('/reports/by-seller', requireRole(['ADMIN', 'OWNER']), async (req: AuthRequest, res: Response) => {
    try {
      const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
      const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;
      const month = req.query.month ? parseInt(String(req.query.month)) : undefined;
      const year = req.query.year ? parseInt(String(req.query.year)) : undefined;

      const where: Prisma.SaleWhereInput = {
        companyId: req.user!.companyId,
      };

      if (month && year) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        where.createdAt = { gte: start, lte: end };
      } else if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const sales = await prisma.sale.findMany({
        where,
        include: {
          seller: { select: { id: true, name: true, email: true } },
          commissions: true
        }
      });

      const sellerStats = sales.reduce((acc: Record<string, SellerStats>, sale) => {
        const sellerId = sale.seller.id;
        
        if (!acc[sellerId]) {
          acc[sellerId] = {
            seller: sale.seller, totalSales: 0,
            salesCount: 0, totalCommissions: 0
          };
        }

        acc[sellerId].totalSales += Number(sale.finalTotal);
        acc[sellerId].salesCount += 1;
        acc[sellerId].totalCommissions += sale.commissions.reduce(
          (sum: number, comm) => sum + Number(comm.amount), 0
        );

        return acc;
      }, {});

      res.json(Object.values(sellerStats));
    } catch (error) {
      logger.error('Erro ao gerar relatório de vendas por vendedor:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

export default router;