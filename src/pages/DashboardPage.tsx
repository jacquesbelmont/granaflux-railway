import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  MessageSquare, 
  Users, 
  User, 
  Settings, 
  TrendingUp,
  Menu,
  X,
  Plus,
  FileText,
  CreditCard,
  LogOut,
  Package,
  ShoppingCart,
  UserCheck,
  CheckSquare,
  DollarSign
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { DashboardData, MonthlyData } from '../types/api';
import KPICards from '../components/dashboard/KPICards';
import ProfitMarginGauge from '../components/dashboard/ProfitMarginGauge';
import RevenueExpenseChart from '../components/dashboard/RevenueExpenseChart';
import ExpensesPieChart from '../components/dashboard/ExpensesPieChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import AddTransactionModal from '../components/dashboard/AddTransactionModal';
import LoadingSpinner from '../components/LoadingSpinner';
import StockManagement from '../components/dashboard/StockManagement';
import SalesManagement from '../components/dashboard/SalesManagement';
import TaskManagement from '../components/dashboard/TaskManagement';
import CommissionManagement from '../components/dashboard/CommissionManagement';
import ClientManagement from '../components/dashboard/ClientManagement';
import AdminPanel from '../components/dashboard/AdminPanel';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import TeamManagement from '../components/dashboard/TeamManagement';

interface DashboardPageProps {
  isLoggedIn: boolean;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ isLoggedIn }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [addTransactionModal, setAddTransactionModal] = useState<{
    isOpen: boolean;
    type: 'REVENUE' | 'EXPENSE';
  }>({ isOpen: false, type: 'REVENUE' });
  
  const navigate = useNavigate();

  // Se não estiver logado, redireciona para login
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (isLoggedIn) {
      loadDashboardData();
    }
  }, [isLoggedIn]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError('');
    
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
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setError(error.message || 'Erro ao carregar dados da dashboard');
      
      // Se erro de autenticação, redirecionar para login
      if (error.message?.includes('Token') || error.message?.includes('401')) {
        apiService.removeToken();
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.removeToken();
    window.location.href = '/login';
  };

  const handleTransactionSuccess = () => {
    loadDashboardData(); // Recarregar dados após criar transação
  };

  if (!isLoggedIn) {
    return null;
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard Principal', icon: BarChart3 },
    { id: 'financials', label: 'Financeiro', icon: TrendingUp },
    { id: 'transactions', label: 'Transações', icon: CreditCard },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'sales', label: 'Vendas', icon: ShoppingCart },
    { id: 'clients', label: 'Clientes', icon: UserCheck },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'commissions', label: 'Comissões', icon: DollarSign },
    { id: 'team', label: 'Equipe', icon: Users },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'admin', label: 'Painel Admin', icon: Settings },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const renderDashboard = () => {
    if (error) {
      return (
        <div className="text-center py-20">
          <div className="text-red-500 mb-4">
            <X className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Erro ao carregar dados</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={loadDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
            <button 
              onClick={handleLogout}
              className="ml-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Fazer Logout
            </button>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <LoadingSpinner message="Carregando dashboard..." size="lg" />
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Principal</h1>
            <p className="text-gray-600">
              Visão geral financeira - {monthlyData?.monthName} {monthlyData?.year}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setAddTransactionModal({ isOpen: true, type: 'REVENUE' })}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Receita
            </button>
            <button 
              onClick={() => setAddTransactionModal({ isOpen: true, type: 'EXPENSE' })}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Despesa
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <KPICards
          totalRevenues={monthlyData?.kpis.totalRevenues || 0}
          totalExpenses={monthlyData?.kpis.totalExpenses || 0}
          netProfit={monthlyData?.kpis.netProfit || 0}
          profitMargin={monthlyData?.kpis.profitMargin || 0}
          isLoading={isLoading}
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RevenueExpenseChart
            totalRevenues={monthlyData?.kpis.totalRevenues || 0}
            totalExpenses={monthlyData?.kpis.totalExpenses || 0}
            isLoading={isLoading}
          />
          
          <ProfitMarginGauge
            profitMargin={monthlyData?.kpis.profitMargin || 0}
            isLoading={isLoading}
          />

          <ExpensesPieChart
            expensesByCategory={monthlyData?.expensesByCategory || []}
            isLoading={isLoading}
          />
        </div>

        {/* Recent Transactions */}
        <RecentTransactions
          transactions={dashboardData?.recentTransactions || []}
          isLoading={isLoading}
        />
      </div>
    );
  };

  const renderFinancials = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão Financeira</h1>
          <p className="text-gray-600">Controle completo das finanças da empresa</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Receita
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Despesa
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards
        totalRevenues={monthlyData?.kpis.totalRevenues || 0}
        totalExpenses={monthlyData?.kpis.totalExpenses || 0}
        netProfit={monthlyData?.kpis.netProfit || 0}
        profitMargin={monthlyData?.kpis.profitMargin || 0}
        isLoading={isLoading}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueExpenseChart
          totalRevenues={monthlyData?.kpis.totalRevenues || 0}
          totalExpenses={monthlyData?.kpis.totalExpenses || 0}
          isLoading={isLoading}
        />
        
        <ExpensesPieChart
          expensesByCategory={monthlyData?.expensesByCategory || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
          <p className="text-gray-600">Histórico completo de receitas e despesas</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setAddTransactionModal({ isOpen: true, type: 'REVENUE' })}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Receita
          </button>
          <button 
            onClick={() => setAddTransactionModal({ isOpen: true, type: 'EXPENSE' })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Despesa
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <RecentTransactions
        transactions={dashboardData?.recentTransactions || []}
        isLoading={isLoading}
      />
    </div>
  );

  const renderInventory = () => (
    <StockManagement isLoading={isLoading} />
  );

  const renderSales = () => (
    <SalesManagement isLoading={isLoading} />
  );

  const renderClients = () => (
    <ClientManagement isLoading={isLoading} />
  );

  const renderTasks = () => (
    <TaskManagement isLoading={isLoading} />
  );

  const renderCommissions = () => (
    <CommissionManagement isLoading={isLoading} />
  );

  const renderAdmin = () => (
    <AdminDashboard isLoading={isLoading} />
  );

  const renderTeam = () => (
    <TeamManagement isLoading={isLoading} />
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Relatórios detalhados e análises</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Gerar Relatório
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Relatórios Gerados</h3>
          <div className="text-3xl font-bold text-blue-600">12</div>
          <p className="text-sm text-gray-500">Este mês</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Análises</h3>
          <div className="text-3xl font-bold text-green-600">5</div>
          <p className="text-sm text-gray-500">Análises detalhadas</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exportações</h3>
          <div className="text-3xl font-bold text-purple-600">8</div>
          <p className="text-sm text-gray-500">Arquivos exportados</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboards</h3>
          <div className="text-3xl font-bold text-orange-600">3</div>
          <p className="text-sm text-gray-500">Dashboards ativos</p>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Configurações do sistema e da empresa</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Editar Configurações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Perfil da Empresa</h3>
          <div className="text-3xl font-bold text-blue-600">✓</div>
          <p className="text-sm text-gray-500">Configurado</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usuários</h3>
          <div className="text-3xl font-bold text-green-600">4</div>
          <p className="text-sm text-gray-500">Usuários ativos</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup</h3>
          <div className="text-3xl font-bold text-purple-600">✓</div>
          <p className="text-sm text-gray-500">Automático</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'financials':
        return renderFinancials();
      case 'transactions':
        return renderTransactions();
      case 'inventory':
        return renderInventory();
      case 'sales':
        return renderSales();
      case 'clients':
        return renderClients();
      case 'tasks':
        return renderTasks();
      case 'commissions':
        return renderCommissions();
      case 'admin':
        return renderAdmin();
      case 'team':
        return renderTeam();
      case 'reports':
        return renderReports();
      case 'settings':
        return renderSettings();
      default:
        return (
          <div className="text-center py-20">
            <div className="text-gray-500 mb-4">
              <BarChart3 className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Seção em desenvolvimento</h3>
              <p>Esta funcionalidade estará disponível em breve.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:static inset-y-0 left-0 z-50 w-64 bg-blue-600 text-white`}>
        <div className="flex items-center justify-between p-4 border-b border-blue-500">
          <Link to="/" className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8" />
            <span className="text-xl font-bold">GranaFlux</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-8 flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-blue-500 transition-colors ${
                activeSection === item.id ? 'bg-blue-500 border-r-4 border-white' : ''
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-500">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-left hover:bg-blue-500 transition-colors rounded-lg"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <MessageSquare className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-5 w-5" />
              </button>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={addTransactionModal.isOpen}
        onClose={() => setAddTransactionModal({ ...addTransactionModal, isOpen: false })}
        onSuccess={handleTransactionSuccess}
        type={addTransactionModal.type}
      />
    </div>
  );
};

export default DashboardPage;