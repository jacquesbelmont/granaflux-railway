import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Clock, 
  User, 
  TrendingUp,
  LogOut,
  Bell,
  Calendar,
  Target,
  Award,
  AlertCircle,
  Play,
  Pause,
  CheckCircle,
  X
} from 'lucide-react';
import { apiService } from '../../services/api';
import { Task, User as UserType } from '../../types/api';
import LoadingSpinner from '../LoadingSpinner';

interface EmployeeDashboardProps {
  user: UserType;
  onLogout: () => void;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myCommissions, setMyCommissions] = useState<any>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carregar minhas tasks
      const tasksData = await apiService.getTasks({ assigneeId: user.id });
      setTasks(tasksData.tasks);

      // Carregar minhas comissões
      try {
        const commissionsData = await apiService.getCommissions({
          userId: user.id,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        });
        setMyCommissions(commissionsData.summary);
      } catch (error) {
        console.error('Erro ao carregar comissões:', error);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await apiService.updateTaskStatus(taskId, newStatus as any);
      loadData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'LOW': 'bg-gray-100 text-gray-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'URGENT': 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'PENDING': 'Pendente',
      'IN_PROGRESS': 'Em Andamento',
      'COMPLETED': 'Concluída',
      'CANCELLED': 'Cancelada'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      'LOW': 'Baixa',
      'MEDIUM': 'Média',
      'HIGH': 'Alta',
      'URGENT': 'Urgente'
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTimeWorking = (startedAt: string) => {
    const start = new Date(startedAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'PENDING').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length
  };

  const currentTask = tasks.find(t => t.status === 'IN_PROGRESS');

  if (isLoading) {
    return <LoadingSpinner message="Carregando suas tarefas..." size="lg" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">GranaFlux Tasks</h1>
                <p className="text-sm text-gray-500">Minhas Tarefas</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">Funcionário</div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
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
              Olá, {user.name}!
            </h2>
            <p className="text-blue-100">
              {currentTask 
                ? `Você está trabalhando em: ${currentTask.title}`
                : 'Você não tem tarefas em andamento no momento'
              }
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-gray-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">{taskStats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                  <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Concluídas</p>
                  <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                </div>
                <Award className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Current Task */}
          {currentTask && (
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Task Atual</h3>
                  <p className="text-sm text-gray-500">Em andamento</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Clock className="h-4 w-4" />
                  {currentTask.startedAt && getTimeWorking(currentTask.startedAt)}
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">{currentTask.title}</h4>
                {currentTask.description && (
                  <p className="text-gray-600 mb-3">{currentTask.description}</p>
                )}
                
                <div className="flex items-center gap-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(currentTask.priority)}`}>
                    {getPriorityLabel(currentTask.priority)}
                  </span>
                  {currentTask.dueDate && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      Prazo: {formatDate(currentTask.dueDate)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusChange(currentTask.id, 'COMPLETED')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Marcar como Concluída
                </button>
                <button
                  onClick={() => handleStatusChange(currentTask.id, 'PENDING')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Pause className="h-4 w-4" />
                  Pausar
                </button>
              </div>
            </div>
          )}

          {/* Tasks List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Tasks */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tasks Pendentes ({taskStats.pending})
              </h3>
              
              {tasks.filter(t => t.status === 'PENDING').length > 0 ? (
                <div className="space-y-3">
                  {tasks.filter(t => t.status === 'PENDING').map((task) => (
                    <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          )}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                          {getPriorityLabel(task.priority)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          {task.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(task.dueDate)}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <Play className="h-3 w-3" />
                          Iniciar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma task pendente</p>
                </div>
              )}
            </div>

            {/* Completed Tasks */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tasks Concluídas ({taskStats.completed})
              </h3>
              
              {tasks.filter(t => t.status === 'COMPLETED').length > 0 ? (
                <div className="space-y-3">
                  {tasks.filter(t => t.status === 'COMPLETED').slice(0, 5).map((task) => (
                    <div key={task.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          )}
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        {task.completedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Concluída em {formatDate(task.completedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma task concluída ainda</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Minha Performance</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Productivity */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-500">Taxa de Conclusão</div>
              </div>

              {/* Tasks This Month */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckSquare className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{taskStats.completed}</div>
                <div className="text-sm text-gray-500">Tasks Concluídas</div>
              </div>

              {/* Commissions */}
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(myCommissions.totalCommissions || 0)}
                </div>
                <div className="text-sm text-gray-500">Comissões do Mês</div>
              </div>
            </div>
          </div>

          {/* Urgent Tasks Alert */}
          {tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED').length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">
                  Tasks Urgentes ({tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED').length})
                </h3>
              </div>
              
              <div className="space-y-3">
                {tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED').map((task) => (
                  <div key={task.id} className="bg-white p-4 rounded-lg border border-red-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-gray-600">{task.description}</p>
                        )}
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Prazo: {formatDate(task.dueDate)}
                          </div>
                        )}
                      </div>
                      {task.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors flex items-center gap-1"
                        >
                          <Play className="h-3 w-3" />
                          Iniciar Agora
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Tasks */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Todas as Minhas Tasks</h3>
            
            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                          {getPriorityLabel(task.priority)}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(task.dueDate)}
                          </div>
                        )}
                        {task.status === 'IN_PROGRESS' && task.startedAt && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Clock className="h-3 w-3" />
                            {getTimeWorking(task.startedAt)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {task.status === 'PENDING' && (
                          <button
                            onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                          >
                            <Play className="h-3 w-3" />
                            Iniciar
                          </button>
                        )}
                        {task.status === 'IN_PROGRESS' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Concluir
                            </button>
                            <button
                              onClick={() => handleStatusChange(task.id, 'PENDING')}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors flex items-center gap-1"
                            >
                              <Pause className="h-3 w-3" />
                              Pausar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma task atribuída</h3>
                <p className="text-gray-500">Aguarde novas tarefas serem atribuídas a você.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;