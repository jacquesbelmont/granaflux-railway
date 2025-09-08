import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  BarChart3, 
  Calendar,
  LogOut,
  Bell,
  Settings,
  FileText,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react';
import { apiService } from '../../services/api';
import { DashboardData, MonthlyData, User } from '../../types/api';
import LoadingSpinner from '../LoadingSpinner';

interface ManagerDashboardProps {
  user: User;
  onLogout: () => void;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [teamOverview, setTeamOverview] = useState<any[]>([]);
  const [salesByUser, setSalesByUser] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const [dashboard, monthly] = await Promise.all([
        apiService.getDashboard(),
        apiService.getMonthlyData(currentMonth, currentYear)
      ]);

      setDashboardData(dashboard);
      setMonthlyData(monthly);

      // Carregar dados da equipe
      try {
        const teamResponse = await fetch(`http://localhost:3001/api/tasks/reports/team-overview`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          setTeamOverview(teamData);
        }
      } catch (error) {
        console.error('Erro ao carregar visão da equipe:', error);
      }

      // Carregar vendas por usuário
      try {
        const salesResponse = await fetch(`http://localhost:3001/api/sales/reports/by-seller?month=${currentMonth}&year=${currentYear}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (salesResponse.ok) {
          const salesData = await salesResponse.json();
          setSalesByUser(salesData);
        }
      } catch (error) {
        console.error('Erro ao carregar vendas por usuário:', error);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return <LoadingSpinner message="Carregando dashboard gerencial..." size="lg" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">GranaFlux</h1>
                <p className="text-sm text-gray-500">Dashboard Gerencial</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{user.role === 'ADMIN' ? 'Gerente' : 'Administrador'}</div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white p-6">
            <h2 className="text-2xl font-bold mb-2">
              Bem-vindo, {user.name}!
            </h2>
            <p className="text-blue-100">
              Visão gerencial completa - {monthlyData?.monthName} {monthlyData?.year}
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Faturamento Mensal</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(monthlyData?.kpis.totalRevenues || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Despesas Mensais</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(monthlyData?.kpis.totalExpenses || 0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
                  <p className={`text-2xl font-bold ${
                    (monthlyData?.kpis.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(monthlyData?.kpis.netProfit || 0)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Margem de Lucro</p>
                  <p className={`text-2xl font-bold ${
                    (monthlyData?.kpis.profitMargin || 0) >= 0 ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {(monthlyData?.kpis.profitMargin || 0).toFixed(1)}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Performance */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance da Equipe</h3>
              {teamOverview.length > 0 ? (
                <div className="space-y-4">
                  {teamOverview.map((member) => (
                    <div key={member.user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          member.status === 'WORKING' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <div>
                          <div className="font-medium text-gray-900">{member.user.name}</div>
                          <div className="text-sm text-gray-500">
                            {member.activeTasks} tasks ativas
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {member.status === 'WORKING' ? 'Trabalhando' : 'Disponível'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {member.inProgressTasks} em andamento
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhum funcionário ativo
                </div>
              )}
            </div>

            {/* Sales Performance */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance de Vendas</h3>
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
                  Nenhuma venda no período
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-center">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-medium text-gray-900">Relatórios</div>
              <div className="text-sm text-gray-500">Gerar relatórios</div>
            </button>

            <button className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="font-medium text-gray-900">Equipe</div>
              <div className="text-sm text-gray-500">Gerenciar funcionários</div>
            </button>

            <button className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-center">
              <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium text-gray-900">Estoque</div>
              <div className="text-sm text-gray-500">Controlar produtos</div>
            </button>

            <button className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-center">
              <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="font-medium text-gray-900">Análises</div>
              <div className="text-sm text-gray-500">Insights do negócio</div>
            </button>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Transações Recentes</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Ver todas
              </button>
            </div>
            
            {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'REVENUE' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'REVENUE' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{transaction.description}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: transaction.categoryColor }}
                          ></div>
                          <span>{transaction.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.type === 'REVENUE' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'REVENUE' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhuma transação recente
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;