export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'CASHIER' | 'ADMIN' | 'OWNER';
  company: {
    id: string;
    name: string;
    cnpj?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  type: 'REVENUE' | 'EXPENSE' | 'BOTH' | 'PRODUCT';
  color: string;
  _count?: {
    revenues: number;
    expenses: number;
    products?: number;
  };
}

export interface Revenue {
  id: string;
  description: string;
  amount: string;
  date: string;
  notes?: string;
  attachment?: string;
  category: Category;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: string;
  date: string;
  notes?: string;
  attachment?: string;
  category: Category;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  summary: {
    totalRevenues: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    revenuesCount: number;
    expensesCount: number;
  };
  revenuesByCategory: Array<{
    name: string;
    color: string;
    total: number;
    count: number;
  }>;
  expensesByCategory: Array<{
    name: string;
    color: string;
    total: number;
    count: number;
    percentage?: number;
  }>;
  monthlyData: Array<{
    month: string;
    revenues: number;
    expenses: number;
    balance: number;
  }>;
  recentTransactions: Array<{
    id: string;
    type: 'REVENUE' | 'EXPENSE';
    description: string;
    amount: number;
    date: string;
    category: string;
    categoryColor: string;
  }>;
}

export interface MonthlyData {
  month: number;
  year: number;
  monthName: string;
  kpis: {
    totalRevenues: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
  };
  expensesByCategory: Array<{
    name: string;
    color: string;
    total: number;
    percentage: number;
  }>;
  transactionCounts: {
    revenues: number;
    expenses: number;
  };
}

export interface Product {
  id: string;
  name: string;
  model?: string;
  description?: string;
  price: string;
  stock: number;
  minStock: number;
  category: Category;
  createdAt: string;
  updatedAt: string;
  _count?: {
    saleItems: number;
    stockMovements: number;
  };
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    sales: number;
  };
}

export interface Sale {
  id: string;
  clientName: string;
  total: string;
  discount?: string;
  finalTotal: string;
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BANK_TRANSFER' | 'CHECK';
  notes?: string;
  client?: Client;
  seller: {
    name: string;
    email: string;
  };
  items: SaleItem[];
  commissions: Commission[];
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  product?: Product;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  creator: {
    name: string;
    email: string;
  };
  startedAt?: string;
  completedAt?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Commission {
  id: string;
  percentage: string;
  amount: string;
  user: {
    name: string;
    email: string;
  };
  sale: {
    id: string;
    clientName: string;
    finalTotal: string;
    createdAt: string;
  };
  createdAt: string;
}

export interface StockMovement {
  id: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  user: {
    name: string;
  };
  createdAt: string;
}