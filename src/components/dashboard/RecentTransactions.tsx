import React from 'react';
import { ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'REVENUE' | 'EXPENSE';
  description: string;
  amount: number;
  date: string;
  category: string;
  categoryColor: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, isLoading = false }) => {
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Transações Recentes</h3>
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <div className="text-gray-400 mb-2">Nenhuma transação encontrada</div>
          <p className="text-sm text-gray-500">Suas transações recentes aparecerão aqui</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Transações Recentes</h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          Ver todas
        </button>
      </div>
      
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${
                transaction.type === 'REVENUE' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {transaction.type === 'REVENUE' ? (
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">{transaction.description}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: transaction.categoryColor }}
                  ></div>
                  <span>{transaction.category}</span>
                  <span>•</span>
                  <span>{formatDate(transaction.date)}</span>
                </div>
              </div>
            </div>
            <div className={`font-semibold ${
              transaction.type === 'REVENUE' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'REVENUE' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;