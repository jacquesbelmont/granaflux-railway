import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';

interface KPICardsProps {
  totalRevenues: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  isLoading?: boolean;
}

const KPICards: React.FC<KPICardsProps> = ({
  totalRevenues,
  totalExpenses,
  netProfit,
  profitMargin,
  isLoading = false
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const cards = [
    {
      title: 'Entradas Totais',
      value: totalRevenues,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Saídas Totais',
      value: totalExpenses,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Lucro/Prejuízo',
      value: netProfit,
      icon: DollarSign,
      color: netProfit >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: netProfit >= 0 ? 'bg-green-50' : 'bg-red-50',
      borderColor: netProfit >= 0 ? 'border-green-200' : 'border-red-200'
    },
    {
      title: 'Margem de Lucro',
      value: profitMargin,
      icon: Target,
      color: profitMargin >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: profitMargin >= 0 ? 'bg-blue-50' : 'bg-red-50',
      borderColor: profitMargin >= 0 ? 'border-blue-200' : 'border-red-200',
      isPercentage: true
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className={`bg-white rounded-xl shadow-sm border ${card.borderColor} p-6 hover:shadow-md transition-shadow`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
          </div>
          <div className={`text-2xl font-bold ${card.color}`}>
            {card.isPercentage 
              ? `${card.value.toFixed(1)}%` 
              : formatCurrency(card.value)
            }
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;