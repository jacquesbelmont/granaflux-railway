import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, Shield, Smartphone, Users, DollarSign, CheckCircle, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: "Controle de Produção",
      description: "Gerencie ordens de produção, etapas e prazos em tempo real"
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Aprovação de Arte",
      description: "Sistema completo para aprovação de artes pelos clientes"
    },
    {
      icon: <Smartphone className="h-8 w-8 text-blue-600" />,
      title: "Gestão de Estoque",
      description: "Controle tintas, materiais e produtos acabados automaticamente"
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Caixa Integrado",
      description: "PDV completo com controle de comissões e fechamento de caixa"
    }
  ];

  const benefits = [
    "Pedidos ilimitados",
    "Controle de produção",
    "Aprovação de arte",
    "Suporte 24/7",
    "Gestão de estoque",
    "Caixa integrado"
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Sistema completo para sua serigrafia
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Gerencie pedidos, produção, estoque e vendas da sua serigrafia em um só lugar. 
                Do orçamento à entrega, controle total do seu negócio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/dashboard" 
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                >
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link 
                  to="/pricing" 
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
                >
                  Ver Preços
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Dashboard Serigrafia</h3>
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Pedidos do Mês</span>
                    <span className="text-2xl font-bold text-green-400">247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Em Produção</span>
                    <span className="text-xl font-semibold text-yellow-400">18</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Faturamento</span>
                    <span className="text-2xl font-bold text-green-400">R$ 89.450</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que sua serigrafia precisa
            </h2>
            <p className="text-xl text-gray-600">
              Gerencie todo o processo produtivo da sua serigrafia
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Por que escolher o GranaFlux para sua serigrafia?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Sistema desenvolvido especificamente para serigrafias brasileiras, 
                cobrindo todo o fluxo produtivo do orçamento à entrega.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Serigrafia" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para revolucionar sua serigrafia?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Teste o GranaFlux gratuitamente e veja como podemos otimizar sua produção.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/dashboard" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              Começar Teste Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              to="/pricing" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
            >
              Ver Planos
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;