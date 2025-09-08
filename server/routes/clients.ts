import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';
import logger from '../config/logger';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar clientes
router.get('/', async (req: any, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {
      companyId: req.user.companyId
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
        { cnpj: { contains: search } }
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          _count: {
            select: { sales: true }
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.client.count({ where })
    ]);

    res.json({
      clients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar cliente por ID
router.get('/:id', async (req: any, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user.companyId
      },
      include: {
        sales: {
          include: {
            seller: { select: { name: true } },
            items: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: { sales: true }
        }
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(client);
  } catch (error) {
    logger.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar cliente por CPF/CNPJ
router.get('/search/document', async (req: any, res) => {
  try {
    const { document } = req.query;

    if (!document) {
      return res.status(400).json({ error: 'Documento (CPF/CNPJ) é obrigatório' });
    }

    const client = await prisma.client.findFirst({
      where: {
        companyId: req.user.companyId,
        OR: [
          { cpf: document },
          { cnpj: document }
        ]
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(client);
  } catch (error) {
    logger.error('Erro ao buscar cliente por documento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar cliente
router.post('/', [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('cpf').optional().isLength({ min: 11, max: 14 }).withMessage('CPF inválido'),
  body('cnpj').optional().isLength({ min: 14, max: 18 }).withMessage('CNPJ inválido')
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, cpf, cnpj, address, city, state, zipCode, notes } = req.body;

    // Verificar se CPF/CNPJ já existe
    if (cpf || cnpj) {
      const existingClient = await prisma.client.findFirst({
        where: {
          OR: [
            ...(cpf ? [{ cpf }] : []),
            ...(cnpj ? [{ cnpj }] : [])
          ]
        }
      });

      if (existingClient) {
        return res.status(400).json({ error: 'CPF/CNPJ já cadastrado' });
      }
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        cpf,
        cnpj,
        address,
        city,
        state,
        zipCode,
        notes,
        companyId: req.user.companyId
      }
    });

    logger.info('Cliente criado', { clientId: client.id, name, userId: req.user.id });

    res.status(201).json(client);
  } catch (error) {
    logger.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar cliente
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Nome não pode estar vazio'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('cpf').optional().isLength({ min: 11, max: 14 }).withMessage('CPF inválido'),
  body('cnpj').optional().isLength({ min: 14, max: 18 }).withMessage('CNPJ inválido')
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, cpf, cnpj, address, city, state, zipCode, notes } = req.body;

    const existingClient = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user.companyId
      }
    });

    if (!existingClient) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Verificar conflito de CPF/CNPJ
    if (cpf || cnpj) {
      const conflictClient = await prisma.client.findFirst({
        where: {
          OR: [
            ...(cpf ? [{ cpf }] : []),
            ...(cnpj ? [{ cnpj }] : [])
          ],
          id: { not: req.params.id }
        }
      });

      if (conflictClient) {
        return res.status(400).json({ error: 'CPF/CNPJ já cadastrado para outro cliente' });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (cpf !== undefined) updateData.cpf = cpf;
    if (cnpj !== undefined) updateData.cnpj = cnpj;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zipCode !== undefined) updateData.zipCode = zipCode;
    if (notes !== undefined) updateData.notes = notes;

    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: updateData
    });

    logger.info('Cliente atualizado', { clientId: client.id, userId: req.user.id });

    res.json(client);
  } catch (error) {
    logger.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar cliente
router.delete('/:id', requireRole(['ADMIN', 'OWNER']), async (req: any, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user.companyId
      },
      include: {
        _count: {
          select: { sales: true }
        }
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    if (client._count.sales > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar um cliente que possui vendas associadas' 
      });
    }

    await prisma.client.delete({
      where: { id: req.params.id }
    });

    logger.info('Cliente deletado', { clientId: req.params.id, userId: req.user.id });

    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    logger.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;