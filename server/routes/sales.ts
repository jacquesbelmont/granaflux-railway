import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';
import logger from '../config/logger';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar vendas
router.get('/', async (req: any, res) => {
  try {
    const { page = 1, limit = 20, sellerId, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {
      companyId: req.user.companyId
    };

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          client: true,
          seller: { select: { name: true, email: true } },
          items: {
            include: { product: true }
          },
          commissions: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.sale.count({ where })
    ]);

    res.json({
      sales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Erro ao listar vendas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar venda por ID
router.get('/:id', async (req: any, res) => {
  try {
    const sale = await prisma.sale.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user.companyId
      },
      include: {
        client: true,
        seller: { select: { name: true, email: true } },
        items: {
          include: { product: true }
        },
        commissions: {
          include: { user: { select: { name: true } } }
        }
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
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { clientId, clientName, items, discount = 0, paymentMethod, notes } = req.body;

    // Verificar se o cliente existe (se fornecido)
    if (clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
          companyId: req.user.companyId
        }
      });

      if (!client) {
        return res.status(400).json({ error: 'Cliente não encontrado' });
      }
    }

    // Calcular total
    let total = 0;
    const processedItems = [];

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

      // Verificar estoque se for produto cadastrado
      if (item.productId) {
        const product = await prisma.product.findFirst({
          where: {
            id: item.productId,
            companyId: req.user.companyId
          }
        });

        if (!product) {
          return res.status(400).json({ error: `Produto ${item.itemName} não encontrado` });
        }

        if (product.stock < parseInt(item.quantity)) {
          return res.status(400).json({ 
            error: `Estoque insuficiente para ${item.itemName}. Disponível: ${product.stock}` 
          });
        }
      }
    }

    const finalTotal = total - parseFloat(discount);

    const sale = await prisma.$transaction(async (tx) => {
      // Criar venda
      const newSale = await tx.sale.create({
        data: {
          clientId: clientId || null,
          clientName,
          total,
          discount: parseFloat(discount),
          finalTotal,
          paymentMethod,
          notes,
          sellerId: req.user.id,
          companyId: req.user.companyId
        }
      });

      // Criar itens da venda
      for (const item of processedItems) {
        await tx.saleItem.create({
          data: {
            saleId: newSale.id,
            ...item
          }
        });

        // Atualizar estoque se for produto cadastrado
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity }
            }
          });

          // Registrar movimento de estoque
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: 'OUT',
              quantity: item.quantity,
              reason: `Venda #${newSale.id}`,
              userId: req.user.id
            }
          });
        }
      }

      // Criar receita automaticamente para a venda
      const salesCategory = await tx.category.findFirst({
        where: {
          companyId: req.user.companyId,
          type: { in: ['REVENUE', 'BOTH'] },
          name: { contains: 'Vendas' }
        }
      });

      if (salesCategory) {
        await tx.revenue.create({
          data: {
            description: `Venda para ${clientName}`,
            amount: finalTotal,
            date: new Date(),
            categoryId: salesCategory.id,
            companyId: req.user.companyId,
            userId: req.user.id,
            notes: `Venda #${newSale.id} - ${items.length} item(s)`
          }
        });
      }

      // Calcular e criar comissão (se configurada)
      const seller = await tx.user.findUnique({
        where: { id: req.user.id }
      });

      // Por enquanto, comissão padrão de 5% para vendedores
      if (seller && ['CASHIER', 'USER'].includes(seller.role)) {
        const commissionPercentage = 5.0; // 5%
        const commissionAmount = (finalTotal * commissionPercentage) / 100;

        await tx.commission.create({
          data: {
            saleId: newSale.id,
            userId: req.user.id,
            percentage: commissionPercentage,
            amount: commissionAmount,
            companyId: req.user.companyId
          }
        });
      }

      return newSale;
    });

    // Buscar venda completa para retorno
    const completeSale = await prisma.sale.findUnique({
      where: { id: sale.id },
      include: {
        client: true,
        seller: { select: { name: true, email: true } },
        items: {
          include: { product: true }
        },
        commissions: true
      }
    });

    logger.info('Venda criada', { 
      saleId: sale.id, 
      total: finalTotal,
      itemsCount: items.length,
      sellerId: req.user.id 
    });

    res.status(201).json(completeSale);
  } catch (error) {
    logger.error('Erro ao criar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Relatório de vendas por vendedor
router.get('/reports/by-seller', requireRole(['ADMIN', 'OWNER']), async (req: any, res) => {
  try {
    const { startDate, endDate, month, year } = req.query;
    
    let dateFilter: any = {};
    
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0);
      dateFilter = { gte: start, lte: end };
    } else if (startDate || endDate) {
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
    }

    const sales = await prisma.sale.findMany({
      where: {
        companyId: req.user.companyId,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
      },
      include: {
        seller: { select: { id: true, name: true, email: true } },
        commissions: true
      }
    });

    // Agrupar por vendedor
    const sellerStats = sales.reduce((acc: any, sale) => {
      const sellerId = sale.seller.id;
      
      if (!acc[sellerId]) {
        acc[sellerId] = {
          seller: sale.seller,
          totalSales: 0,
          salesCount: 0,
          totalCommissions: 0
        };
      }

      acc[sellerId].totalSales += Number(sale.finalTotal);
      acc[sellerId].salesCount += 1;
      acc[sellerId].totalCommissions += sale.commissions.reduce(
        (sum, comm) => sum + Number(comm.amount), 0
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