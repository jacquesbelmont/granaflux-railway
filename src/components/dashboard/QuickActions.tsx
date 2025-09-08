import React from 'react';
import { 
  Plus, 
  Package, 
  Users, 
  FileText, 
  Calculator,
  TrendingUp,
  ShoppingCart,
  CheckSquare
} from 'lucide-react';

interface QuickActionsProps {
  userRole: string;
  onAction: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ userRole, onAction }) => {
  const getActionsForRole = () => {
    switch (userRole) {
      case 'OWNER':
      case 'ADMIN':
        return [
          { id: 'new-revenue', label: 'Nova Receita', icon: TrendingUp, color: 'bg-green-600 hover:bg-green-700' },
          { id: 'new-expense', label: 'Nova Despesa', icon: TrendingUp, color: 'bg-red-600 hover:bg-red-700' },
          { id: 'new-product', label: 'Novo Produto', icon: Package, color: 'bg-blue-600 hover:bg-blue-700' },
          { id: 'new-client', label: 'Novo Cliente', icon: Users, color: 'bg-purple-600 hover:bg-purple-700' },
          { id: 'new-sale', label: 'Nova Venda', icon: ShoppingCart, color: 'bg-green-600 hover:bg-green-700' },
          { id: 'new-task', label: 'Nova Task', icon: CheckSquare, color: 'bg-orange-600 hover:bg-orange-700' },
          { id: 'generate-report', label: 'Gerar Relatório', icon: FileText, color: 'bg-gray-600 hover:bg-gray-700' },
          { id: 'calculator', label: 'Calculadora', icon: Calculator, color: 'bg-indigo-600 hover:bg-indigo-700' }
        ];
      
      case 'CASHIER':
        return [
          { id: 'new-sale', label: 'Nova Venda', icon: ShoppingCart, color: 'bg-green-600 hover:bg-green-700' },
          { id: 'new-client', label: 'Novo Cliente', icon: Users, color: 'bg-purple-600 hover:bg-purple-700' },
          { id: 'add-stock', label: 'Adicionar Estoque', icon: Package, color: 'bg-blue-600 hover:bg-blue-700' },
          { id: 'calculator', label: 'Calculadora', icon: Calculator, color: 'bg-indigo-600 hover:bg-indigo-700' }
        ];
      
      case 'USER':
        return [
          { id: 'my-tasks', label: 'Minhas Tasks', icon: CheckSquare, color: 'bg-blue-600 hover:bg-blue-700' },
          { id: 'my-commissions', label: 'Minhas Comissões', icon: TrendingUp, color: 'bg-green-600 hover:bg-green-700' },
          { id: 'calculator', label: 'Calculadora', icon: Calculator, color: 'bg-indigo-600 hover:bg-indigo-700' }
        ];
      
      default:
        return [];
    }
  };

  const actions = getActionsForRole();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className={`${action.color} text-white p-4 rounded-lg transition-colors text-center`}
          >
            <action.icon className="h-6 w-6 mx-auto mb-2" />
            <div className="text-sm font-medium">{action.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;