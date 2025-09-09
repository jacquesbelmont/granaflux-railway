// server/routes/reports.ts
import express, { Response } from 'express';
import prisma from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import logger from '../config/logger.js';
import { Prisma, Revenue, Expense, Category } from '@prisma/client';

const router = express.Router();

// Interfaces para estruturar os dados dos relatórios
type CategorySummary = {
  name: string;
  color: string;
  total: number;
  count: number;
};

type MonthlyBalance = {
  month: number;
  monthName: string;
  revenues: number;
  expenses: number;
  balance: number;
};

type CashFlowData = {
  inflow: number;
  outflow: number;
  net: number;
};

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Dashboard - Resumo financeiro
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
    const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;

    const where: Prisma.RevenueWhereInput & Prisma.ExpenseWhereInput = {
      companyId: req.user!.companyId,
    };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const [revenues, expenses] = await prisma.$transaction([
      prisma.revenue.findMany({ where, include: { category: true } }),
      prisma.expense.findMany({ where, include: { category: true } })
    ]);

    const totalRevenues = revenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const netProfit = totalRevenues - totalExpenses;