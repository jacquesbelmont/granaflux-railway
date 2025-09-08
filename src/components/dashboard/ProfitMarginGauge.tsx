import React from 'react';

interface ProfitMarginGaugeProps {
  profitMargin: number;
  isLoading?: boolean;
}

const ProfitMarginGauge: React.FC<ProfitMarginGaugeProps> = ({ profitMargin, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
        <div className="flex justify-center">
          <div className="w-48 h-48 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  // Normalizar o valor para o gauge (0-100%)
  const normalizedValue = Math.max(0, Math.min(100, profitMargin));
  const rotation = (normalizedValue / 100) * 180; // 180 graus para semicírculo

  const getColor = (margin: number) => {
    if (margin < 0) return '#EF4444'; // Vermelho
    if (margin < 10) return '#F59E0B'; // Amarelo
    if (margin < 25) return '#3B82F6'; // Azul
    return '#10B981'; // Verde
  };

  const color = getColor(profitMargin);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Margem de Lucro</h3>
      
      <div className="flex justify-center">
        <div className="relative w-48 h-24">
          {/* Background semicircle */}
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              stroke="#E5E7EB"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            {/* Progress semicircle */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(normalizedValue / 100) * 125.66} 125.66`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color }}>
                {profitMargin.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Margem</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">Prejuízo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-gray-600">Baixa (&lt;10%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-600">Boa (10-25%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">Excelente (&gt;25%)</span>
        </div>
      </div>
    </div>
  );
};

export default ProfitMarginGauge;