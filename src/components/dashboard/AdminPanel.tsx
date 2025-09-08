import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  Users, 
  Code, 
  Edit3, 
  Plus, 
  Trash2, 
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import AdminDashboard from './AdminDashboard';

interface AdminPanelProps {
  isLoading?: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isLoading = false }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showSqlEditor, setShowSqlEditor] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('');
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  });

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'categories') {
      loadCategories();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    setIsLoadingData(true);
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadCategories = async () => {
    setIsLoadingData(true);
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simular criação de usuário
      const userData = {
        ...newUser,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      setUsers([...users, userData]);
      setNewUser({ name: '', email: '', password: '', role: 'USER' });
      setShowCreateUser(false);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
    }
  };

  const executeSqlQuery = async () => {
    try {
      // Simular execução de SQL
      setSqlResult({
        success: true,
        message: 'Query executada com sucesso (simulação)',
        rows: [
          { id: 1, name: 'Exemplo', value: 'Dados simulados' },
          { id: 2, name: 'Teste', value: 'Resultado fictício' }
        ]
      });
    } catch (error) {
      setSqlResult({
        success: false,
        message: 'Erro na execução da query',
        error: error
      });
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'categories', label: 'Categorias', icon: Settings },
    { id: 'database', label: 'Banco de Dados', icon: Database },
    { id: 'customization', label: 'Personalização', icon: Edit3 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600">Gerenciamento avançado do sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            <AlertTriangle className="h-4 w-4 inline mr-1" />
            Área Restrita
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <AdminDashboard />
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Gerenciar Usuários</h3>
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Novo Usuário
                </button>
              </div>

              {/* Create User Modal */}
              {showCreateUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl p-6 w-full max-w-md">
                    <h3 className="text-lg font-semibold mb-4">Criar Novo Usuário</h3>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome
                        </label>
                        <input
                          type="text"
                          required
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Senha
                        </label>
                        <input
                          type="password"
                          required
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Função
                        </label>
                        <select
                          value={newUser.role}
                          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="USER">Funcionário</option>
                          <option value="CASHIER">Operador de Caixa</option>
                          <option value="ADMIN">Administrador</option>
                          <option value="OWNER">Proprietário</option>
                        </select>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowCreateUser(false)}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Criar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Função
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'OWNER' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'CASHIER' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Database Tab */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Editor SQL</h3>
                <button
                  onClick={() => setShowSqlEditor(!showSqlEditor)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                >
                  {showSqlEditor ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showSqlEditor ? 'Ocultar' : 'Mostrar'} Editor
                </button>
              </div>

              {showSqlEditor && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertTriangle className="h-5 w-5" />
                      <strong>Atenção:</strong> Use com cuidado! Comandos SQL podem afetar dados permanentemente.
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Query SQL
                    </label>
                    <textarea
                      value={sqlQuery}
                      onChange={(e) => setSqlQuery(e.target.value)}
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder="SELECT * FROM users WHERE role = 'ADMIN';"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={executeSqlQuery}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Code className="h-4 w-4" />
                      Executar Query
                    </button>
                    <button
                      onClick={() => setSqlQuery('')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Limpar
                    </button>
                  </div>

                  {sqlResult && (
                    <div className={`p-4 rounded-lg ${
                      sqlResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className={`flex items-center gap-2 mb-2 ${
                        sqlResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {sqlResult.success ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                        <strong>{sqlResult.message}</strong>
                      </div>
                      
                      {sqlResult.rows && (
                        <div className="mt-3">
                          <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
                            {JSON.stringify(sqlResult.rows, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Backup do Banco</h4>
                  <p className="text-sm text-gray-600 mb-3">Criar backup completo dos dados</p>
                  <button className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                    Gerar Backup
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Limpar Logs</h4>
                  <p className="text-sm text-gray-600 mb-3">Remover logs antigos do sistema</p>
                  <button className="px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700">
                    Limpar Logs
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Otimizar BD</h4>
                  <p className="text-sm text-gray-600 mb-3">Otimizar performance do banco</p>
                  <button className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                    Otimizar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Customization Tab */}
          {activeTab === 'customization' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Personalização do Sistema</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Configurações de Interface</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cor Primária
                      </label>
                      <input
                        type="color"
                        defaultValue="#3B82F6"
                        className="w-full h-10 rounded border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome da Empresa
                      </label>
                      <input
                        type="text"
                        defaultValue="GranaFlux"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Salvar Configurações
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Módulos do Sistema</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Gestão Financeira', enabled: true },
                      { name: 'Controle de Estoque', enabled: true },
                      { name: 'Gestão de Vendas', enabled: true },
                      { name: 'CRM', enabled: true },
                      { name: 'Tasks', enabled: true },
                      { name: 'Comissões', enabled: false },
                      { name: 'Relatórios Avançados', enabled: false }
                    ].map((module, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{module.name}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={module.enabled}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Gerenciar Categorias</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Categoria
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        category.type === 'REVENUE' ? 'bg-green-100 text-green-800' :
                        category.type === 'EXPENSE' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {category.type}
                      </span>
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;