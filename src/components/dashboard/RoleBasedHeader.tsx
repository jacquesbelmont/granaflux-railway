import React from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  CheckSquare, 
  LogOut, 
  Bell, 
  Settings,
  User as UserIcon
} from 'lucide-react';
import { User } from '../../types/api';

interface RoleBasedHeaderProps {
  user: User;
  onLogout: () => void;
}

const RoleBasedHeader: React.FC<RoleBasedHeaderProps> = ({ user, onLogout }) => {
  const getHeaderConfig = () => {
    switch (user.role) {
      case 'OWNER':
      case 'ADMIN':
        return {
          icon: TrendingUp,
          title: 'GranaFlux',
          subtitle: 'Dashboard Administrativo',
          color: 'text-blue-600'
        };
      case 'CASHIER':
        return {
          icon: ShoppingCart,
          title: 'GranaFlux PDV',
          subtitle: 'Sistema de Vendas',
          color: 'text-green-600'
        };
      case 'USER':
        return {
          icon: CheckSquare,
          title: 'GranaFlux Tasks',
          subtitle: 'Minhas Tarefas',
          color: 'text-blue-600'
        };
      default:
        return {
          icon: TrendingUp,
          title: 'GranaFlux',
          subtitle: 'Dashboard',
          color: 'text-blue-600'
        };
    }
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      'USER': 'Funcionário',
      'CASHIER': 'Operador de Caixa',
      'ADMIN': 'Gerente',
      'OWNER': 'Proprietário'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const config = getHeaderConfig();
  const IconComponent = config.icon;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <IconComponent className={`h-8 w-8 ${config.color}`} />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{config.title}</h1>
              <p className="text-sm text-gray-500">{config.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">{getRoleLabel(user.role)}</div>
            </div>
            
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            
            {(user.role === 'OWNER' || user.role === 'ADMIN') && (
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            )}
            
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
            
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
  );
};

export default RoleBasedHeader;