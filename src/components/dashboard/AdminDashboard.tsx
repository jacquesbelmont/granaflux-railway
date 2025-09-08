import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Package, 
  AlertTriangle,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../../services/api';
import { DashboardData, MonthlyData } from '../../types/api';
import LoadingSpinner from '../LoadingSpinner';

interface AdminDashboardProps {
  isLoading?: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isLoading = false }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [salesByUser, setSalesByUser] = useState<any[]>([]);
  const [tasksByUser, setTasksByUser] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod, selectedYear, selectedMonth]);

  const loadDashboardData = async () => {
    setIsLoadingData(true);
    try {
      let startDate, endDate;
      
      if (selectedPeriod === 'month') {
        startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
        endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
      } else if (selectedPeriod === 'year') {
        startDate = new Date(selectedYear, 0, 1).toISOString().split('T')[0];
        endDate = new Date(selectedYear, 11, 31).toISOString().split('T')[0];
      }

      const [dashboard, monthly, sales, tasks, products] = await Promise.all([
        apiService.getDashboard(startDate, endDate),
        apiService.getMonthlyData(selectedMonth, selectedYear),
        fetch(`http://localhost:3001/api/sales/reports/by-seller?month=${selectedMonth}&year=${selectedYear}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.json()).catch(() => []),
        fetch(`http://localhost:3001/api/tasks/reports/productivity?month=${selectedMonth}&year=${selectedYear}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.json()).catch(() => []),
        apiService.getProducts({ lowStock: true })
      ]);

      setDashboardData(dashboard);
      setMonthlyData(monthly);
      setSalesByUser(sales);
      setTasksByUser(tasks);
      setLowStockProducts(products.products.filter(p => p.stock <= p.minStock));
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  if (isLoadingData) {
    return <LoadingSpinner message="Carregando dashboard administrativo..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600">
            Visão completa do negócio - {getMonthName(selectedMonth)} {selectedYear}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="month">Mensal</option>
            <option value="year">Anual</option>
          </select>
          
          {selectedPeriod === 'month' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {getMonthName(i + 1)}
                </option>
              ))}
            </select>
          )}
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
          
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Faturamento</p>
              <p className="text-xl lg:text-2xl font-bold text-green-600">
                {formatCurrency(monthlyData?.kpis.totalRevenues || 0)}
              </p>
            </div>
            <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Despesas</p>
              <p className="text-xl lg:text-2xl font-bold text-red-600">
                {formatCurrency(monthlyData?.kpis.totalExpenses || 0)}
              </p>
            </div>
            <TrendingDown className="h-6 w-6 lg:h-8 lg:w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
              <p className={`text-xl lg:text-2xl font-bold ${
                (monthlyData?.kpis.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(monthlyData?.kpis.netProfit || 0)}
              </p>
            </div>
            <BarChart3 className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
              <p className="text-xl lg:text-2xl font-bold text-orange-600">
                {lowStockProducts.length}
              </p>
            </div>
            <AlertTriangle className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sellers Chart */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Vendedores</h3>
          {salesByUser.length > 0 ? (
            <div className="space-y-4">
              {salesByUser.slice(0, 5).map((seller, index) => (
                <div key={seller.seller.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{seller.seller.name}</div>
                      <div className="text-sm text-gray-500">{seller.salesCount} vendas</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {formatCurrency(seller.totalSales)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(seller.totalCommissions)} comissão
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhuma venda no período selecionado
            </div>
          )}
        </div>

        {/* Top Workers Chart */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtividade da Equipe</h3>
          {tasksByUser.length > 0 ? (
            <div className="space-y-4">
              {tasksByUser.slice(0, 5).map((worker, index) => (
                <div key={worker.user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-purple-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{worker.user.name}</div>
                      <div className="text-sm text-gray-500">
                        {worker.completedTasks}/{worker.totalTasks} concluídas
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-purple-600">
                      {Math.round((worker.completedTasks / worker.totalTasks) * 100)}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {worker.averageCompletionTime}h média
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhuma task no período selecionado
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-orange-800">
              Alerta de Estoque Baixo ({lowStockProducts.length} produtos)
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockProducts.slice(0, 6).map((product) => (
              <div key={product.id} className="bg-white p-4 rounded-lg border border-orange-200">
                <div className="font-medium text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-500 mb-2">{product.model}</div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-600">
                    Estoque: {product.stock}
                  </span>
                  <span className="text-xs text-gray-500">
                    Mín: {product.minStock}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {lowStockProducts.length > 6 && (
            <div className="mt-4 text-center">
              <button className="text-orange-600 hover:text-orange-700 font-medium">
                Ver todos os {lowStockProducts.length} produtos
              </button>
            </div>
          )}
        </div>
      )}

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Receitas vs Despesas</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Receitas</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(monthlyData?.kpis.totalRevenues || 0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${Math.max(10, (monthlyData?.kpis.totalRevenues || 0) / Math.max(monthlyData?.kpis.totalRevenues || 1, monthlyData?.kpis.totalExpenses || 1) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Despesas</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(monthlyData?.kpis.totalExpenses || 0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-red-500 h-3 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${Math.max(10, (monthlyData?.kpis.totalExpenses || 0) / Math.max(monthlyData?.kpis.totalRevenues || 1, monthlyData?.kpis.totalExpenses || 1) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Despesas por Categoria</h3>
          {monthlyData?.expensesByCategory && monthlyData.expensesByCategory.length > 0 ? (
            <div className="space-y-3">
              {monthlyData.expensesByCategory.slice(0, 5).map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(category.total)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {category.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhuma despesa no período
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button className="bg-white rounded-xl shadow-sm p-4 lg:p-6 hover:shadow-md transition-shadow text-center">
          <Package className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 mx-auto mb-2" />
          <div className="font-medium text-gray-900 text-sm lg:text-base">Estoque</div>
          <div className="text-xs lg:text-sm text-gray-500">Gerenciar produtos</div>
        </button>

        <button className="bg-white rounded-xl shadow-sm p-4 lg:p-6 hover:shadow-md transition-shadow text-center">
          <Users className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600 mx-auto mb-2" />
          <div className="font-medium text-gray-900 text-sm lg:text-base">Equipe</div>
          <div className="text-xs lg:text-sm text-gray-500">Gerenciar funcionários</div>
        </button>

        <button className="bg-white rounded-xl shadow-sm p-4 lg:p-6 hover:shadow-md transition-shadow text-center">
          <BarChart3 className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 mx-auto mb-2" />
          <div className="font-medium text-gray-900 text-sm lg:text-base">Relatórios</div>
          <div className="text-xs lg:text-sm text-gray-500">Gerar relatórios</div>
        </button>

        <button className="bg-white rounded-xl shadow-sm p-4 lg:p-6 hover:shadow-md transition-shadow text-center">
          <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600 mx-auto mb-2" />
          <div className="font-medium text-gray-900 text-sm lg:text-base">Tasks</div>
          <div className="text-xs lg:text-sm text-gray-500">Gerenciar tarefas</div>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;