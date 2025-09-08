import express from 'express';
import prisma from '../config/database';
import { authenticateToken } from '../middleware/auth';
import logger from '../config/logger';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Dashboard - Resumo financeiro
router.get('/dashboard', async (req: any, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const where = {
      companyId: req.user.companyId,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
    };

    // Buscar receitas e despesas
    const [revenues, expenses] = await Promise.all([
      prisma.revenue.findMany({
        where,
        include: { category: true }
      }),
      prisma.expense.findMany({
        where,
        include: { category: true }
      })
    ]);

    // Calcular totais
    const totalRevenues = revenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const netProfit = totalRevenues - totalExpenses;
    const profitMargin = totalRevenues > 0 ? ((netProfit / totalRevenues) * 100) : 0;

    // Agrupar por categoria
    const revenuesByCategory = revenues.reduce((acc: any, revenue) => {
      const categoryName = revenue.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          color: revenue.category.color,
          total: 0,
          count: 0
        };
      }
      acc[categoryName].total += Number(revenue.amount);
      acc[categoryName].count += 1;
      return acc;
    }, {});

    const expensesByCategory = expenses.reduce((acc: any, expense) => {
      const categoryName = expense.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          color: expense.category.color,
          total: 0,
          count: 0
        };
      }
      acc[categoryName].total += Number(expense.amount);
      acc[categoryName].count += 1;
      return acc;
    }, {});

    // Dados mensais para gráfico
    const monthlyData = await getMonthlyData(req.user.companyId, startDate, endDate);

    // Transações recentes
    const recentTransactions = await getRecentTransactions(req.user.companyId);

    logger.info('Dashboard gerado', { 
      companyId: req.user.companyId, 
      totalRevenues, 
      totalExpenses, 
      netProfit 
    });

    res.json({
      summary: {
        totalRevenues,
        totalExpenses,
        netProfit,
        profitMargin: Math.round(profitMargin * 100) / 100,
        revenuesCount: revenues.length,
        expensesCount: expenses.length
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
router.get('/cash-flow', async (req: any, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;
    
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const where = {
      companyId: req.user.companyId,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
    };

    const [revenues, expenses] = await Promise.all([
      prisma.revenue.findMany({
        where,
        orderBy: { date: 'asc' }
      }),
      prisma.expense.findMany({
        where,
        orderBy: { date: 'asc' }
      })
    ]);

    // Agrupar por período
    const cashFlow = groupCashFlowData([...revenues, ...expenses], groupBy);

    res.json(cashFlow);
  } catch (error) {
    logger.error('Erro ao gerar relatório de fluxo de caixa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Relatório de balanço
router.get('/balance', async (req: any, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    const where = {
      companyId: req.user.companyId,
      date: {
        gte: startDate,
        lte: endDate
      }
    };

    const [revenues, expenses] = await Promise.all([
      prisma.revenue.findMany({
        where,
        include: { category: true }
      }),
      prisma.expense.findMany({
        where,
        include: { category: true }
      })
    ]);

    // Calcular por mês
    const monthlyBalance = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(Number(year), month, 1);
      const monthEnd = new Date(Number(year), month + 1, 0);

      const monthRevenues = revenues.filter(r => 
        r.date >= monthStart && r.date <= monthEnd
      );
      const monthExpenses = expenses.filter(e => 
        e.date >= monthStart && e.date <= monthEnd
      );

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
      year: Number(year),
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

// Relatório mensal resumido
router.get('/monthly-summary', async (req: any, res) => {
  try {
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;
    
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);

    const where = {
      companyId: req.user.companyId,
      date: {
        gte: startDate,
        lte: endDate
      }
    };

    const [revenues, expenses] = await Promise.all([
      prisma.revenue.findMany({
        where,
        include: { category: true }
      }),
      prisma.expense.findMany({
        where,
        include: { category: true }
      })
    ]);

    const totalRevenues = revenues.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = totalRevenues - totalExpenses;
    const profitMargin = totalRevenues > 0 ? ((netProfit / totalRevenues) * 100) : 0;

    // Despesas por categoria para o gráfico de pizza
    const expensesByCategory = expenses.reduce((acc: any, expense) => {
      const categoryName = expense.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          color: expense.category.color,
          total: 0,
          percentage: 0
        };
      }
      acc[categoryName].total += Number(expense.amount);
      return acc;
    }, {});

    // Calcular percentuais
    Object.values(expensesByCategory).forEach((category: any) => {
      category.percentage = totalExpenses > 0 ? 
        Math.round((category.total / totalExpenses) * 100 * 100) / 100 : 0;
    });

    res.json({
      month: Number(month),
      year: Number(year),
      monthName: startDate.toLocaleDateString('pt-BR', { month: 'long' }),
      kpis: {
        totalRevenues,
        totalExpenses,
        netProfit,
        profitMargin: Math.round(profitMargin * 100) / 100
      },
      expensesByCategory: Object.values(expensesByCategory),
      transactionCounts: {
        revenues: revenues.length,
        expenses: expenses.length
      }
    });
  } catch (error) {
    logger.error('Erro ao gerar resumo mensal:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Funções auxiliares
async function getMonthlyData(companyId: string, startDate?: string, endDate?: string) {
  const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
  const end = endDate ? new Date(endDate) : new Date();

  const where = {
    companyId,
    date: {
      gte: start,
      lte: end
    }
  };

  const [revenues, expenses] = await Promise.all([
    prisma.revenue.findMany({ where }),
    prisma.expense.findMany({ where })
  ]);

  const monthlyMap = new Map();

  // Processar receitas
  revenues.forEach(revenue => {
    const monthKey = revenue.date.toISOString().substring(0, 7); // YYYY-MM
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { revenues: 0, expenses: 0 });
    }
    monthlyMap.get(monthKey).revenues += Number(revenue.amount);
  });

  // Processar despesas
  expenses.forEach(expense => {
    const monthKey = expense.date.toISOString().substring(0, 7); // YYYY-MM
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { revenues: 0, expenses: 0 });
    }
    monthlyMap.get(monthKey).expenses += Number(expense.amount);
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

async function getRecentTransactions(companyId: string) {
  const [recentRevenues, recentExpenses] = await Promise.all([
    prisma.revenue.findMany({
      where: { companyId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.expense.findMany({
      where: { companyId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ]);

  const transactions = [
    ...recentRevenues.map(r => ({
      id: r.id,
      type: 'REVENUE' as const,
      description: r.description,
      amount: Number(r.amount),
      date: r.date,
      category: r.category.name,
      categoryColor: r.category.color
    })),
    ...recentExpenses.map(e => ({
      id: e.id,
      type: 'EXPENSE' as const,
      description: e.description,
      amount: Number(e.amount),
      date: e.date,
      category: e.category.name,
      categoryColor: e.category.color
    }))
  ];

  return transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
}

function groupCashFlowData(transactions: any[], groupBy: string) {
  const grouped = new Map();

  transactions.forEach(transaction => {
    let key: string;
    const date = new Date(transaction.date);

    switch (groupBy) {
      case 'day':
        key = date.toISOString().substring(0, 10); // YYYY-MM-DD
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().substring(0, 10);
        break;
      case 'month':
        key = date.toISOString().substring(0, 7); // YYYY-MM
        break;
      case 'year':
        key = date.getFullYear().toString();
        break;
      default:
        key = date.toISOString().substring(0, 7);
    }

    if (!grouped.has(key)) {
      grouped.set(key, { inflow: 0, outflow: 0, net: 0 });
    }

    const amount = Number(transaction.amount);
    if (transaction.categoryId) { // É uma receita se tem categoryId de receita
      grouped.get(key).inflow += amount;
    } else {
      grouped.get(key).outflow += amount;
    }
  });

  return Array.from(grouped.entries())
    .map(([period, data]) => ({
      period,
      inflow: data.inflow,
      outflow: data.outflow,
      net: data.inflow - data.outflow
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

export default router;