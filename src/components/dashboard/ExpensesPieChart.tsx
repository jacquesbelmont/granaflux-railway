import React from 'react';

interface ExpenseCategory {
  name: string;
  color: string;
  total: number;
  percentage?: number;
}

interface ExpensesPieChartProps {
  expensesByCategory: ExpenseCategory[];
  isLoading?: boolean;
}

const ExpensesPieChart: React.FC<ExpensesPieChartProps> = ({ expensesByCategory, isLoading = false }) => {
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
        <div className="flex justify-center mb-6">
          <div className="w-48 h-48 bg-gray-200 rounded-full"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (expensesByCategory.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Despesas por Categoria</h3>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">Nenhuma despesa encontrada</div>
          <p className="text-sm text-gray-500">Adicione despesas para ver a distribuição por categoria</p>
        </div>
      </div>
    );
  }

  const total = expensesByCategory.reduce((sum, category) => sum + category.total, 0);

  // Calcular ângulos para o gráfico de pizza
  let currentAngle = 0;
  const segments = expensesByCategory.map((category) => {
    const percentage = (category.total / total) * 100;
    const angle = (percentage / 100) * 360;
    const segment = {
      ...category,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angle
    };
    currentAngle += angle;
    return segment;
  });

  // Função para criar o path do SVG
  const createPath = (startAngle: number, endAngle: number, innerRadius = 0, outerRadius = 40) => {
    const start = polarToCartesian(50, 50, outerRadius, endAngle);
    const end = polarToCartesian(50, 50, outerRadius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    if (innerRadius === 0) {
      return [
        "M", 50, 50,
        "L", start.x, start.y,
        "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
        "Z"
      ].join(" ");
    } else {
      const startInner = polarToCartesian(50, 50, innerRadius, endAngle);
      const endInner = polarToCartesian(50, 50, innerRadius, startAngle);
      
      return [
        "M", start.x, start.y,
        "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
        "L", endInner.x, endInner.y,
        "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
        "Z"
      ].join(" ");
    }
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Despesas por Categoria</h3>
      
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Pie Chart */}
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 100 100" className="transform rotate-0">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={createPath(segment.startAngle, segment.endAngle, 15, 40)}
                fill={segment.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                title={`${segment.name}: ${formatCurrency(segment.total)} (${segment.percentage.toFixed(1)}%)`}
              />
            ))}
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{formatCurrency(total)}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: segment.color }}
                ></div>
                <span className="text-sm text-gray-700">{segment.name}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{formatCurrency(segment.total)}</div>
                <div className="text-xs text-gray-500">{segment.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpensesPieChart;