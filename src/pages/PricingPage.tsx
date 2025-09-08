import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PricingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      subtitle: "Ideal para microempresas",
      monthlyPrice: 49,
      annualPrice: 39,
      features: [
        "1 usuário",
        "Lançamentos ilimitados",
        "Relatórios básicos",
        "Suporte por email",
        "Backup automático",
        "App mobile"
      ],
      limitations: [
        "Sem integração bancária",
        "Relatórios limitados"
      ],
      popular: false
    },
    {
      name: "Growth",
      subtitle: "Para pequenas empresas",
      monthlyPrice: 149,
      annualPrice: 119,
      features: [
        "Até 10 usuários",
        "Lançamentos ilimitados",
        "Relatórios avançados",
        "Integração bancária",
        "Suporte prioritário",
        "Dashboard personalizado",
        "Controle de fluxo de caixa",
        "Exportação de dados"
      ],
      limitations: [],
      popular: true
    },
    {
      name: "Fleet",
      subtitle: "Para médias e grandes empresas",
      monthlyPrice: 299,
      annualPrice: 239,
      features: [
        "Usuários ilimitados",
        "Lançamentos ilimitados",
        "Relatórios premium",
        "Integração completa",
        "Suporte 24/7",
        "API personalizada",
        "Múltiplas empresas",
        "Gestor de projetos dedicado"
      ],
      limitations: [],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Planos que crescem com sua empresa
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Escolha o plano ideal para sua empresa. Todos os planos incluem teste grátis de 30 dias.
          </p>
          
          {/* Toggle Annual/Monthly */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`${!isAnnual ? 'text-white' : 'text-blue-200'}`}>Mensal</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-white' : 'bg-blue-400'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-blue-600 transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`${isAnnual ? 'text-white' : 'text-blue-200'}`}>Anual</span>
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">
              20% OFF
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg p-8 relative ${
                  plan.popular ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Mais Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.subtitle}</p>
                  
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      R$ {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-500 ml-2">/mês</span>
                  </div>
                  
                  {isAnnual && (
                    <p className="text-sm text-green-600 mt-2">
                      Economize R$ {(plan.monthlyPrice - plan.annualPrice) * 12} por ano
                    </p>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.map((limitation, limitationIndex) => (
                    <div key={limitationIndex} className="flex items-center">
                      <X className="h-5 w-5 text-red-500 mr-3" />
                      <span className="text-gray-500">{limitation}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  Começar Teste Grátis
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Perguntas Frequentes
          </h2>
          
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Posso cancelar a qualquer momento?
              </h3>
              <p className="text-gray-600">
                Sim, você pode cancelar sua assinatura a qualquer momento. Não há contratos de longo prazo ou taxas de cancelamento.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                O teste grátis é realmente gratuito?
              </h3>
              <p className="text-gray-600">
                Sim, oferecemos 30 dias completamente grátis. Você não precisa fornecer cartão de crédito para começar.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Vocês oferecem suporte em português?
              </h3>
              <p className="text-gray-600">
                Sim, nossa equipe de suporte é 100% brasileira e atende em português durante horário comercial.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;