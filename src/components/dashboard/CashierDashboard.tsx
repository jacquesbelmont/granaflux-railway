import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  Plus, 
  Search,
  TrendingUp,
  LogOut,
  Bell,
  Calculator,
  CreditCard,
  Clock,
  CheckCircle
} from 'lucide-react';
import { apiService } from '../../services/api';
import { Product, Client, Sale, User } from '../../types/api';
import LoadingSpinner from '../LoadingSpinner';

interface CashierDashboardProps {
  user: User;
  onLogout: () => void;
}

const CashierDashboard: React.FC<CashierDashboardProps> = ({ user, onLogout }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [myCommissions, setMyCommissions] = useState<any>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsData, clientsData, salesData] = await Promise.all([
        apiService.getProducts({ limit: 50 }),
        apiService.getClients({ limit: 20 }),
        apiService.getSales({ limit: 10, sellerId: user.id })
      ]);

      setProducts(productsData.products);
      setClients(clientsData.clients);
      setRecentSales(salesData.sales);

      // Carregar minhas comissões
      try {
        const commissionsData = await apiService.getCommissions({
          userId: user.id,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        });
        setMyCommissions(commissionsData.summary);
      } catch (error) {
        console.error('Erro ao carregar comissões:', error);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        itemName: product.name,
        description: product.description,
        unitPrice: Number(product.price),
        quantity: 1
      }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.productId === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  };

  const handleFinalizeSale = async () => {
    if (cart.length === 0) return;

    try {
      const saleData = {
        clientId: selectedClient?.id,
        clientName: selectedClient?.name || 'Cliente Avulso',
        items: cart,
        paymentMethod: 'CASH', // Padrão, pode ser alterado
        notes: ''
      };

      await apiService.createSale(saleData);
      setCart([]);
      setSelectedClient(null);
      setShowNewSaleModal(false);
      loadData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner message="Carregando sistema de vendas..." size="lg" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">GranaFlux PDV</h1>
                <p className="text-sm text-gray-500">Sistema de Vendas</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">Operador de Caixa</div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Products and Cart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Vendas Hoje</p>
                    <p className="text-xl font-bold text-green-600">{recentSales.length}</p>
                  </div>
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Minhas Comissões</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(myCommissions.totalCommissions || 0)}
                    </p>
                  </div>
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Produtos</p>
                    <p className="text-xl font-bold text-purple-600">{products.length}</p>
                  </div>
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Product Search */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Produtos</h3>
                <button 
                  onClick={() => setShowNewSaleModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nova Venda
                </button>
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        {product.model && (
                          <p className="text-sm text-gray-500">{product.model}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(Number(product.price))}
                        </div>
                        <div className={`text-sm ${
                          product.stock <= product.minStock ? 'text-red-500' : 'text-gray-500'
                        }`}>
                          Estoque: {product.stock}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Cart and Recent Sales */}
          <div className="space-y-6">
            {/* Cart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Carrinho</h3>
                <Calculator className="h-5 w-5 text-gray-400" />
              </div>

              {cart.length > 0 ? (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.itemName}</div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(item.unitPrice)} cada
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 bg-gray-200 rounded text-gray-600 hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 bg-gray-200 rounded text-gray-600 hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="text-xl font-bold text-green-600">
                        {formatCurrency(getCartTotal())}
                      </span>
                    </div>
                    
                    <button
                      onClick={handleFinalizeSale}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      Finalizar Venda
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>Carrinho vazio</p>
                  <p className="text-sm">Adicione produtos para iniciar uma venda</p>
                </div>
              )}
            </div>

            {/* Quick Client Search */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cliente</h3>
              
              {selectedClient ? (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{selectedClient.name}</div>
                      <div className="text-sm text-gray-500">{selectedClient.email}</div>
                    </div>
                    <button
                      onClick={() => setSelectedClient(null)}
                      className="text-red-600 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors">
                    + Cliente Avulso
                  </button>
                  
                  <div className="text-center text-sm text-gray-500">ou</div>
                  
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {clients.slice(0, 5).map((client) => (
                      <button
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className="w-full p-2 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-500">{client.email}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* My Performance */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Minha Performance</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Vendas Hoje</span>
                  <span className="font-semibold text-blue-600">{recentSales.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Comissões do Mês</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(myCommissions.totalCommissions || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ticket Médio</span>
                  <span className="font-semibold text-purple-600">
                    {recentSales.length > 0 
                      ? formatCurrency(recentSales.reduce((sum, sale) => sum + Number(sale.finalTotal), 0) / recentSales.length)
                      : formatCurrency(0)
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Minhas Vendas Recentes</h3>
          
          {recentSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Itens
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Pagamento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {sale.clientName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {sale.items.length} item(s)
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">
                        {formatCurrency(Number(sale.finalTotal))}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(sale.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Nenhuma venda registrada hoje</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CashierDashboard;