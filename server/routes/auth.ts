// server/routes/auth.ts
import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import logger from '../config/logger.js';
import { Prisma } from '@prisma/client';

const router = express.Router();

// Registro de usuário
router.post('/register', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('companyName').notEmpty().withMessage('Nome da empresa é obrigatório')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, companyName, cnpj } = req.body;

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar empresa e usuário
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          cnpj: cnpj || null
        }
      });

      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'OWNER',
          companyId: company.id
        },
        include: {
          company: true
        }
      });

      // Criar categorias padrão
      await tx.category.createMany({
        data: [
          { name: 'Vendas', type: 'REVENUE', companyId: company.id, color: '#10B981' },
          { name: 'Serviços', type: 'REVENUE', companyId: company.id, color: '#3B82F6' },
          { name: 'Folha de Pagamento', type: 'EXPENSE', companyId: company.id, color: '#EF4444' },
          { name: 'Fornecedores', type: 'EXPENSE', companyId: company.id, color: '#F59E0B' },
          { name: 'Marketing', type: 'EXPENSE', companyId: company.id, color: '#8B5CF6' },
          { name: 'Aluguel', type: 'EXPENSE', companyId: company.id, color: '#6B7280' },
          { name: 'Impostos', type: 'EXPENSE', companyId: company.id, color: '#DC2626' },
          { name: 'Matéria Prima', type: 'EXPENSE', companyId: company.id, color: '#059669' }
        ]
      });

      return user;
    });

// Gerar token
if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
  logger.error('Variáveis de ambiente JWT_SECRET ou JWT_EXPIRES_IN não definidas.');
  throw new Error('Configuração de autenticação do servidor incompleta.');
}

const token = jwt.sign(
  { userId: result.id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);
    logger.info('Novo usuário registrado', {
      userId: result.id,
      email: result.email,
      companyId: result.companyId
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        company: result.company
      }
    });
  } catch (error) {
    logger.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true }
    });

    if (!user) {
      logger.warn('Tentativa de login com email inexistente', { email });
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logger.warn('Tentativa de login com senha incorreta', { email });
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

// Gerar token
if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
    logger.error('Variáveis de ambiente JWT_SECRET ou JWT_EXPIRES_IN não definidas.');
    throw new Error('Configuração de autenticação do servidor incompleta.');
}

const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);

    logger.info('Login realizado com sucesso', { userId: user.id, email });

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company
      }
    });
  } catch (error) {
    logger.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;