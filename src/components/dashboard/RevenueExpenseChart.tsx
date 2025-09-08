import React from 'react';

interface RevenueExpenseChartProps {
  totalRevenues: number;
  totalExpenses: number;
  isLoading?: boolean;
}

const RevenueExpenseChart: React.FC<RevenueExpenseChartProps> = ({
  totalRevenues,
  totalExpenses,
  isLoading = false
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(totalRevenues, totalExpenses);
  const revenuePercentage = maxValue > 0 ? (totalRevenues / maxValue) * 100 : 0;
  const expensePercentage = maxValue > 0 ? (totalExpenses / maxValue) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Entradas vs. Saídas</h3>
      
      <div className="space-y-6">
        {/* Receitas */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="font-medium text-gray-700">Entradas</span>
            </div>
            <span className="font-semibold text-green-600">{formatCurrency(totalRevenues)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${revenuePercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Despesas */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="font-medium text-gray-700">Saídas</span>
            </div>
            <span className="font-semibold text-red-600">{formatCurrency(totalExpenses)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-red-500 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${expensePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Resultado:</span>
          <span className={`text-xl font-bold ${
            totalRevenues - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(totalRevenues - totalExpenses)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RevenueExpenseChart;