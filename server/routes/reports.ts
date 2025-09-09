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

type Transaction = {
    id: string;
    type: 'REVENUE' | 'EXPENSE';
    description: string;
    amount: number;
    date: Date;
    category: string;
    categoryColor: string;
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
    const profitMargin = totalRevenues > 0 ? ((netProfit / totalRevenues) * 100) : 0;

    const revenuesByCategory = revenues.reduce((acc: Record<string, CategorySummary>, revenue) => {
      const categoryName = revenue.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = { name: categoryName, color: revenue.category.color, total: 0, count: 0 };
      }
      acc[categoryName].total += Number(revenue.amount);
      acc[categoryName].count += 1;
      return acc;
    }, {});

    const expensesByCategory = expenses.reduce((acc: Record<string, CategorySummary>, expense) => {
      const categoryName = expense.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = { name: categoryName, color: expense.category.color, total: 0, count: 0 };
      }
      acc[categoryName].total += Number(expense.amount);
      acc[categoryName].count += 1;
      return acc;
    }, {});

    const monthlyData = await getMonthlyData(req.user!.companyId, String(req.query.startDate), String(req.query.endDate));
    const recentTransactions = await getRecentTransactions(req.user!.companyId);

    logger.info('Dashboard gerado', { companyId: req.user!.companyId, totalRevenues, totalExpenses, netProfit });

    res.json({
      summary: {
        totalRevenues, totalExpenses, netProfit,
        profitMargin: Math.round(profitMargin * 100) / 100,
        revenuesCount: revenues.length, expensesCount: expenses.length
      },
      revenuesByCategory: Object.values(revenuesByCategory),
      expensesByCategory: Object.values(expensesByCategory),
      monthlyData,
      recentTransactions
    });
  } catch (error) {
    logger.error('Erro ao gerar dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Relatório de fluxo de caixa
router.get('/cash-flow', async (req: AuthRequest, res: Response) => {
    try {
        const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
        const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;
        const groupBy = String(req.query.groupBy || 'month') as 'day' | 'week' | 'month' | 'year';

        const where: Prisma.RevenueWhereInput & Prisma.ExpenseWhereInput = {
            companyId: req.user!.companyId,
        };
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = startDate;
            if (endDate) where.date.lte = endDate;
        }

        const [revenues, expenses] = await prisma.$transaction([
            prisma.revenue.findMany({ where, orderBy: { date: 'asc' } }),
            prisma.expense.findMany({ where, orderBy: { date: 'asc' } })
        ]);

        const cashFlow = groupCashFlowData([...revenues, ...expenses], groupBy);

        res.json(cashFlow);
    } catch (error) {
        logger.error('Erro ao gerar relatório de fluxo de caixa:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});


// Relatório de balanço
router.get('/balance', async (req: AuthRequest, res: Response) => {
  try {
    const year = parseInt(String(req.query.year)) || new Date().getFullYear();
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const where = {
      companyId: req.user!.companyId,
      date: { gte: startDate, lte: endDate }
    };

    const [revenues, expenses] = await prisma.$transaction([
      prisma.revenue.findMany({ where, include: { category: true } }),
      prisma.expense.findMany({ where, include: { category: true } })
    ]);

    const monthlyBalance: MonthlyBalance[] = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

      const monthRevenues = revenues.filter(r => r.date >= monthStart && r.date <= monthEnd);
      const monthExpenses = expenses.filter(e => e.date >= monthStart && e.date <= monthEnd);

      const monthRevenueTotal = monthRevenues.reduce((sum, r) => sum + Number(r.amount), 0);
      const monthExpenseTotal = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

      monthlyBalance.push({
        month: month + 1,
        monthName: monthStart.toLocaleDateString('pt-BR', { month: 'long' }),
        revenues: monthRevenueTotal,
        expenses: monthExpenseTotal,
        balance: monthRevenueTotal - monthExpenseTotal
      });
    }

    const totalRevenues = revenues.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    res.json({
      year: year,
      summary: {
        totalRevenues,
        totalExpenses,
        netBalance: totalRevenues - totalExpenses
      },
      monthlyBalance
    });
  } catch (error) {
    logger.error('Erro ao gerar relatório de balanço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Funções auxiliares tipadas
async function getMonthlyData(companyId: string, startDateStr?: string, endDateStr?: string) {
  const start = startDateStr && startDateStr !== 'undefined' ? new Date(startDateStr) : new Date(new Date().getFullYear(), 0, 1);
  const end = endDateStr && endDateStr !== 'undefined' ? new Date(endDateStr) : new Date();

  const where = {
    companyId,
    date: { gte: start, lte: end }
  };

  const [revenues, expenses] = await prisma.$transaction([
    prisma.revenue.findMany({ where }),
    prisma.expense.findMany({ where })
  ]);

  const monthlyMap = new Map<string, { revenues: number; expenses: number }>();

  revenues.forEach(revenue => {
    const monthKey = revenue.date.toISOString().substring(0, 7); // YYYY-MM
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { revenues: 0, expenses: 0 });
    }
    monthlyMap.get(monthKey)!.revenues += Number(revenue.amount);
  });

  expenses.forEach(expense => {
    const monthKey = expense.date.toISOString().substring(0, 7); // YYYY-MM
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { revenues: 0, expenses: 0 });
    }
    monthlyMap.get(monthKey)!.expenses += Number(expense.amount);
  });

  return Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      revenues: data.revenues,
      expenses: data.expenses,
      balance: data.revenues - data.expenses
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

async function getRecentTransactions(companyId: string): Promise<Transaction[]> {
    const [recentRevenues, recentExpenses] = await prisma.$transaction([
        prisma.revenue.findMany({ where: { companyId }, include: { category: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
        prisma.expense.findMany({ where: { companyId }, include: { category: true }, orderBy: { createdAt: 'desc' }, take: 5 })
    ]);

    const transactions: Transaction[] = [
        ...recentRevenues.map(r => ({
            id: r.id, type: 'REVENUE' as const, description: r.description, amount: Number(r.amount),
            date: r.date, category: r.category.name, categoryColor: r.category.color
        })),
        ...recentExpenses.map(e => ({
            id: e.id, type: 'EXPENSE' as const, description: e.description, amount: Number(e.amount),
            date: e.date, category: e.category.name, categoryColor: e.category.color
        }))
    ];

    return transactions
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 10);
}

function groupCashFlowData(transactions: (Revenue | Expense)[], groupBy: 'day' | 'week' | 'month' | 'year') {
    const grouped = new Map<string, CashFlowData>();
    const revenuesIds = new Set(transactions.filter(t => 'description' in t && 'id' in t && t.hasOwnProperty('amount')).map(r => (r as Revenue).id));

    transactions.forEach(transaction => {
        let key: string;
        const date = new Date(transaction.date);

        switch (groupBy) {
            case 'day': key = date.toISOString().substring(0, 10); break;
            case 'week':
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().substring(0, 10);
                break;
            case 'year': key = date.getFullYear().toString(); break;
            case 'month':
            default: key = date.toISOString().substring(0, 7); break;
        }

        if (!grouped.has(key)) {
            grouped.set(key, { inflow: 0, outflow: 0, net: 0 });
        }

        const data = grouped.get(key)!;
        const amount = Number(transaction.amount);

        if (revenuesIds.has(transaction.id)) {
            data.inflow += amount;
        } else {
            data.outflow += amount;
        }
    });

    return Array.from(grouped.entries())
        .map(([period, data]) => ({ period, inflow: data.inflow, outflow: data.outflow, net: data.inflow - data.outflow }))
        .sort((a, b) => a.period.localeCompare(b.period));
}

export default router;