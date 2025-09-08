import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';
import logger from '../config/logger';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar usuários da empresa
router.get('/', requireRole(['ADMIN', 'OWNER']), async (req: any, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        companyId: req.user.companyId
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { name: 'asc' }
    });

    res.json(users);
  } catch (error) {
    logger.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar usuário por ID
router.get('/:id', async (req: any, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user.companyId
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true,
            cnpj: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Perfil do usuário logado
router.get('/me/profile', async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true,
            cnpj: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            zipCode: true
          }
        }
      }
    });

    res.json(user);
  } catch (error) {
    logger.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar usuário (apenas OWNER e ADMIN)
router.post('/', requireRole(['ADMIN', 'OWNER']), [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('role').isIn(['USER', 'ADMIN']).withMessage('Role deve ser USER ou ADMIN')
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role } = req.body;

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        companyId: req.user.companyId
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    logger.info('Usuário criado', { userId: user.id, email, createdBy: req.user.id });

    res.status(201).json(user);
  } catch (error) {
    logger.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar usuário
router.put('/:id', [
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('name').optional().notEmpty().withMessage('Nome não pode estar vazio'),
  body('role').optional().isIn(['USER', 'ADMIN']).withMessage('Role deve ser USER ou ADMIN')
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, role } = req.body;
    const targetUserId = req.params.id;

    // Verificar se o usuário pode editar este perfil
    const canEdit = req.user.id === targetUserId || 
                   ['ADMIN', 'OWNER'].includes(req.user.role);

    if (!canEdit) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Verificar se o usuário existe e pertence à empresa
    const existingUser = await prisma.user.findFirst({
      where: {
        id: targetUserId,
        companyId: req.user.companyId
      }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Apenas OWNER pode alterar role de outros usuários
    if (role && req.user.id !== targetUserId && req.user.role !== 'OWNER') {
      return res.status(403).json({ error: 'Apenas o proprietário pode alterar roles' });
    }

    // Se o email foi alterado, verificar se não conflita
    if (email && email !== existingUser.email) {
      const emailConflict = await prisma.user.findUnique({
        where: { email }
      });

      if (emailConflict) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }
    }

    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;

    const user = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    logger.info('Usuário atualizado', { userId: user.id, updatedBy: req.user.id });

    res.json(user);
  } catch (error) {
    logger.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Alterar senha
router.put('/:id/password', [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres')
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const targetUserId = req.params.id;

    // Verificar se o usuário pode alterar esta senha
    const canEdit = req.user.id === targetUserId || req.user.role === 'OWNER';

    if (!canEdit) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Buscar usuário
    const user = await prisma.user.findFirst({
      where: {
        id: targetUserId,
        companyId: req.user.companyId
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Se não for o próprio usuário, OWNER pode alterar sem senha atual
    if (req.user.id === targetUserId) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Senha atual incorreta' });
      }
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: targetUserId },
      data: { password: hashedPassword }
    });

    logger.info('Senha alterada', { userId: targetUserId, changedBy: req.user.id });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    logger.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar usuário (apenas OWNER)
router.delete('/:id', requireRole(['OWNER']), async (req: any, res) => {
  try {
    const targetUserId = req.params.id;

    // Não permitir que o OWNER delete a si mesmo
    if (req.user.id === targetUserId) {
      return res.status(400).json({ error: 'Você não pode deletar sua própria conta' });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: targetUserId,
        companyId: req.user.companyId
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    await prisma.user.delete({
      where: { id: targetUserId }
    });

    logger.info('Usuário deletado', { userId: targetUserId, deletedBy: req.user.id });

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    logger.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;