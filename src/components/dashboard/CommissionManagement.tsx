import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Calendar, Filter } from 'lucide-react';
import { apiService } from '../../services/api';
import { Commission } from '../../types/api';

interface CommissionManagementProps {
  isLoading?: boolean;
}

const CommissionManagement: React.FC<CommissionManagementProps> = ({ isLoading = false }) => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState<any>({});

  useEffect(() => {
    loadCommissions();
  }, [selectedMonth, selectedYear]);

  const loadCommissions = async () => {
    setIsLoadingData(true);
    try {
      const data = await apiService.getCommissions({
        month: selectedMonth,
        year: selectedYear
      });
      setCommissions(data.commissions);
      setSummary(data.summary);
    } catch (error) {
      console.error('Erro ao carregar comissões:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  // Agrupar comissões por funcionário
  const commissionsByUser = commissions.reduce((acc: any, commission) => {
    const userId = commission.user.name;
    if (!acc[userId]) {
      acc[userId] = {
        user: commission.user,
        commissions: [],
        total: 0
      };
    }
    acc[userId].commissions.push(commission);
    acc[userId].total += Number(commission.amount);
    return acc;
  }, {});

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Comissões</h1>
          <p className="text-gray-600">
            {getMonthName(selectedMonth)} de {selectedYear}
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {getMonthName(i + 1)}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Comissões</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalCommissions || 0)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Número de Comissões</p>
              <p className="text-2xl font-bold text-blue-600">
                {summary.commissionsCount || 0}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Funcionários com Comissão</p>
              <p className="text-2xl font-bold text-purple-600">
                {Object.keys(commissionsByUser).length}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Commissions by User */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.values(commissionsByUser).map((userCommissions: any) => (
          <div key={userCommissions.user.name} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {userCommissions.user.name}
                </h3>
                <p className="text-sm text-gray-500">{userCommissions.user.email}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(userCommissions.total)}
                </div>
                <div className="text-sm text-gray-500">
                  {userCommissions.commissions.length} vendas
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {userCommissions.commissions.slice(0, 3).map((commission: Commission) => (
                <div key={commission.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {commission.sale.clientName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(commission.sale.createdAt)} • {Number(commission.percentage)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      {formatCurrency(Number(commission.amount))}
                    </div>
                    <div className="text-xs text-gray-500">
                      de {formatCurrency(Number(commission.sale.finalTotal))}
                    </div>
                  </div>
                </div>
              ))}
              
              {userCommissions.commissions.length > 3 && (
                <div className="text-center">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Ver mais {userCommissions.commissions.length - 3} comissões
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* All Commissions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Todas as Comissões</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Funcionário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comissão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commissions.map((commission) => (
                <tr key={commission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {commission.user.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {commission.user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {commission.sale.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(Number(commission.sale.finalTotal))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {Number(commission.percentage)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {formatCurrency(Number(commission.amount))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(commission.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {commissions.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma comissão encontrada</h3>
          <p className="text-gray-500">
            Nenhuma comissão foi gerada em {getMonthName(selectedMonth)} de {selectedYear}.
          </p>
        </div>
      )}
    </div>
  );
};

export default CommissionManagement;