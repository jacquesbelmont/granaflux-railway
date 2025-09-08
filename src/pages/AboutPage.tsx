import React, { useState } from 'react';
import { Target, Users, Award, TrendingUp } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const values = [
    {
      icon: <Target className="h-8 w-8 text-blue-600" />,
      title: "Missão",
      description: "Simplificar a gestão financeira das empresas brasileiras através de tecnologia acessível e eficiente."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
      title: "Visão",
      description: "Ser a principal plataforma de gestão financeira para empresas no Brasil até 2030."
    },
    {
      icon: <Award className="h-8 w-8 text-blue-600" />,
      title: "Valores",
      description: "Transparência, inovação, simplicidade e compromisso com o sucesso dos nossos clientes."
    }
  ];

  const team = [
    {
      name: "Carlos Silva",
      role: "CEO & Fundador",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      name: "Ana Santos",
      role: "CTO",
      image: "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      name: "Roberto Costa",
      role: "Head de Produto",
      image: "https://images.pexels.com/photos/4342498/pexels-photo-4342498.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Sobre o GranaFlux
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Nascemos para revolucionar a gestão financeira das empresas brasileiras, 
            oferecendo uma plataforma moderna, intuitiva e poderosa.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Nossa História
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                O GranaFlux surgiu da necessidade real de empresários brasileiros que buscavam 
                uma solução simples e eficiente para gerenciar suas finanças. Fundada em 2023, 
                nossa equipe combina expertise em tecnologia e profundo conhecimento do mercado 
                brasileiro.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Acreditamos que toda empresa, independentemente do seu tamanho, merece ter 
                acesso a ferramentas de gestão financeira de qualidade. Por isso, desenvolvemos 
                o GranaFlux com foco na simplicidade, sem abrir mão da robustez e segurança.
              </p>
              <p className="text-lg text-gray-600">
                Hoje, já ajudamos centenas de empresas a terem maior controle sobre suas 
                finanças, reduzindo custos e aumentando a lucratividade através de insights 
                precisos e automação inteligente.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Equipe GranaFlux" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nossos Valores
            </h2>
            <p className="text-xl text-gray-600">
              Os princípios que nos guiam em tudo que fazemos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm text-center">
                <div className="flex justify-center mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nossa Equipe
            </h2>
            <p className="text-xl text-gray-600">
              Conheça as pessoas por trás do GranaFlux
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Empresas Atendidas</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">R$ 2.5M+</div>
              <div className="text-blue-100">Transações Processadas</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Suporte</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Vamos Conversar?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Tem alguma dúvida ou sugestão? Nossa equipe está sempre pronta para ajudar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:contato@granaflux.com" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Enviar Email
            </a>
            <a 
              href="tel:+551140028922" 
              className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
            >
              Ligar Agora
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;