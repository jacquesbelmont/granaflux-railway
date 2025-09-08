import { DashboardData, MonthlyData, Revenue, Expense, Category, User } from '../types/api';
import type { Product, Client, Sale, Task, Commission } from '../types/api';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    console.log('API Request:', { url, method: options.method || 'GET', headers });
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('API Response:', { status: response.status, statusText: response.statusText });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(response.token);
    return response;
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    companyName: string;
    cnpj?: string;
  }): Promise<{ token: string; user: User }> {
    const response = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    this.setToken(response.token);
    return response;
  }

  // Dashboard
  async getDashboard(startDate?: string, endDate?: string): Promise<DashboardData> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<DashboardData>(`/reports/dashboard${query}`);
  }

  async getMonthlyData(month: number, year: number): Promise<MonthlyData> {
    return this.request<MonthlyData>(`/reports/monthly-summary?month=${month}&year=${year}`);
  }

  // Categories
  async getCategories(type?: 'REVENUE' | 'EXPENSE' | 'BOTH'): Promise<Category[]> {
    const query = type ? `?type=${type}` : '';
    return this.request<Category[]>(`/categories${query}`);
  }

  async createCategory(data: {
    name: string;
    description?: string;
    type: 'REVENUE' | 'EXPENSE' | 'BOTH';
    color?: string;
  }): Promise<Category> {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Revenues
  async getRevenues(params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ revenues: Revenue[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ revenues: Revenue[]; pagination: any }>(`/revenues${queryString}`);
  }

  async createRevenue(data: {
    description: string;
    amount: number;
    date: string;
    categoryId: string;
    notes?: string;
    attachment?: string;
  }): Promise<Revenue> {
    return this.request<Revenue>('/revenues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRevenue(id: string, data: Partial<{
    description: string;
    amount: number;
    date: string;
    categoryId: string;
    notes: string;
    attachment: string;
  }>): Promise<Revenue> {
    return this.request<Revenue>(`/revenues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRevenue(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/revenues/${id}`, {
      method: 'DELETE',
    });
  }

  // Expenses
  async getExpenses(params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ expenses: Expense[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ expenses: Expense[]; pagination: any }>(`/expenses${queryString}`);
  }

  async createExpense(data: {
    description: string;
    amount: number;
    date: string;
    categoryId: string;
    notes?: string;
    attachment?: string;
  }): Promise<Expense> {
    return this.request<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExpense(id: string, data: Partial<{
    description: string;
    amount: number;
    date: string;
    categoryId: string;
    notes: string;
    attachment: string;
  }>): Promise<Expense> {
    return this.request<Expense>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExpense(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/users/me/profile');
  }

  // Products
  async getProducts(params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    lowStock?: boolean;
  }): Promise<{ products: Product[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.lowStock) query.append('lowStock', 'true');
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ products: Product[]; pagination: any }>(`/products${queryString}`);
  }

  async createProduct(data: {
    name: string;
    model?: string;
    description?: string;
    price: number;
    stock: number;
    minStock?: number;
    categoryId: string;
  }): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: {
    name?: string;
    model?: string;
    description?: string;
    price?: number;
    minStock?: number;
    categoryId?: string;
  }): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async updateProductStock(id: string, data: {
    quantity: number;
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    reason: string;
  }): Promise<Product> {
    return this.request<Product>(`/products/${id}/stock`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Clients
  async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ clients: Client[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ clients: Client[]; pagination: any }>(`/clients${queryString}`);
  }

  async createClient(data: {
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
  }): Promise<Client> {
    return this.request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async searchClientByDocument(document: string): Promise<Client> {
    return this.request<Client>(`/clients/search/document?document=${document}`);
  }

  // Sales
  async getSales(params?: {
    page?: number;
    limit?: number;
    sellerId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ sales: Sale[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.sellerId) query.append('sellerId', params.sellerId);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ sales: Sale[]; pagination: any }>(`/sales${queryString}`);
  }

  async createSale(data: {
    clientId?: string;
    clientName: string;
    items: Array<{
      productId?: string;
      itemName: string;
      description?: string;
      quantity: number;
      unitPrice: number;
    }>;
    discount?: number;
    paymentMethod: string;
    notes?: string;
  }): Promise<Sale> {
    return this.request<Sale>('/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Tasks
  async getTasks(params?: {
    page?: number;
    limit?: number;
    status?: string;
    assigneeId?: string;
    priority?: string;
    month?: number;
    year?: number;
  }): Promise<{ tasks: Task[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.assigneeId) query.append('assigneeId', params.assigneeId);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.month) query.append('month', params.month.toString());
    if (params?.year) query.append('year', params.year.toString());
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ tasks: Task[]; pagination: any }>(`/tasks${queryString}`);
  }

  async createTask(data: {
    title: string;
    description?: string;
    assigneeId: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: string;
  }): Promise<Task> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTaskStatus(id: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'): Promise<Task> {
    return this.request<Task>(`/tasks/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updateTask(id: string, data: {
    title?: string;
    description?: string;
    assigneeId?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: string;
  }): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Users management
  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: {
    name?: string;
    email?: string;
    role?: string;
  }): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Commissions
  async getCommissions(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    month?: number;
    year?: number;
  }): Promise<{ commissions: Commission[]; summary: any; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.userId) query.append('userId', params.userId);
    if (params?.month) query.append('month', params.month.toString());
    if (params?.year) query.append('year', params.year.toString());
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ commissions: Commission[]; summary: any; pagination: any }>(`/commissions${queryString}`);
  }
}

export const apiService = new ApiService();