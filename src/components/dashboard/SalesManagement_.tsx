import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, DollarSign, TrendingUp, Users, Calendar } from 'lucide-react';
import { apiService } from '../../services/api';
import { Sale, Product, Client } from '../../types/api';

interface SalesManagementProps {
  isLoading?: boolean;
}

const SalesManagement: React.FC<SalesManagementProps> = ({ isLoading = false }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    loadSales();
  }, [selectedPeriod]);

  const loadSales = async () => {
    setIsLoadingData(true);
    try {
      const params: any = {};
      
      const today = new Date();
      switch (selectedPeriod) {
        case 'today':
          params.startDate = today.toISOString().split('T')[0];
          params.endDate = today.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - 7);
          params.startDate = weekStart.toISOString().split('T')[0];
          params.endDate = today.toISOString().split('T')[0];
          break;
        case 'month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          params.startDate = monthStart.toISOString().split('T')[0];
          params.endDate = today.toISOString().split('T')[0];
          break;
      }

      const data = await apiService.getSales(params);
      setSales(data.sales);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: { [key: string]: string } = {
      'CASH': 'Dinheiro',
      'CREDIT_CARD': 'Cartão de Crédito',
      'DEBIT_CARD': 'Cartão de Débito',
      'PIX': 'PIX',
      'BANK_TRANSFER': 'Transferência',
      'CHECK': 'Cheque'
    };
    return methods[method] || method;
  };

  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.finalTotal), 0);
  const averageTicket = sales.length > 0 ? totalSales / sales.length : 0;

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
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
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Vendas</h1>
          <p className="text-gray-600">Controle completo das suas vendas</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Hoje</option>
            <option value="week">Última Semana</option>
            <option value="month">Este Mês</option>
          </select>
          <button 
            onClick={() => setShowNewSaleModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Venda
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSales)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Número de Vendas</p>
              <p className="text-2xl font-bold text-blue-600">{sales.length}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(averageTicket)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes Únicos</p>
              <p className="text-2xl font-bold text-orange-600">
                {new Set(sales.map(s => s.clientName)).size}
              </p>
            </div>
            <Users className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Vendas Recentes</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Itens
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{sale.clientName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {sale.items.map((item, index) => (
                        <div key={index} className="mb-1">
                          {item.quantity}x {item.itemName}
                          {item.description && (
                            <div className="text-xs text-gray-500">{item.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(Number(sale.finalTotal))}
                    </div>
                    {Number(sale.discount) > 0 && (
                      <div className="text-xs text-gray-500">
                        Desc: {formatCurrency(Number(sale.discount))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getPaymentMethodLabel(sale.paymentMethod)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.seller.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(sale.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sales.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma venda encontrada</h3>
          <p className="text-gray-500">
            {selectedPeriod === 'today' ? 'Nenhuma venda foi registrada hoje.' : 
             selectedPeriod === 'week' ? 'Nenhuma venda na última semana.' :
             'Nenhuma venda neste mês.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SalesManagement;