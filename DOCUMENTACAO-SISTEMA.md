# 📊 GranaFlux - Documentação Completa do Sistema

## 🎯 Visão Geral
O GranaFlux é um sistema completo de gestão financeira empresarial, desenvolvido com React + TypeScript no frontend e Node.js + Express + PostgreSQL no backend.

---

## 🖥️ FRONTEND - Estrutura de Telas

### 1. 🏠 **Landing Page (HomePage)**
**Rota:** `/`
**Arquivo:** `src/pages/HomePage.tsx`

#### Funcionalidades:
- **Hero Section:** Apresentação principal com call-to-action
- **Features Section:** 4 cards com principais recursos
  - Dashboard Intuitivo
  - Segurança Total
  - Acesso Mobile
  - Gestão de Equipe
- **Benefits Section:** Lista de benefícios com checkmarks
- **Stats Section:** Estatísticas da empresa (500+ empresas, R$ 2.5M+ processados)
- **CTA Section:** Chamada final para ação

#### Componentes Utilizados:
- `Header` (navegação principal)
- `Footer` (informações de contato)
- Ícones do Lucide React
- Imagens do Pexels

---

### 2. 💰 **Página de Preços (PricingPage)**
**Rota:** `/pricing`
**Arquivo:** `src/pages/PricingPage.tsx`

#### Funcionalidades:
- **Toggle Mensal/Anual:** Desconto de 20% no plano anual
- **3 Planos de Preços:**
  - **Starter:** R$ 49/mês (R$ 39 anual) - 1 usuário
  - **Growth:** R$ 149/mês (R$ 119 anual) - 10 usuários (Mais Popular)
  - **Fleet:** R$ 299/mês (R$ 239 anual) - Usuários ilimitados
- **FAQ Section:** Perguntas frequentes
- **Teste Grátis:** 30 dias para todos os planos

#### Recursos por Plano:
- **Starter:** Básico para microempresas
- **Growth:** Integração bancária, relatórios avançados
- **Fleet:** API personalizada, múltiplas empresas, suporte 24/7

---

### 3. ℹ️ **Sobre Nós (AboutPage)**
**Rota:** `/about`
**Arquivo:** `src/pages/AboutPage.tsx`

#### Funcionalidades:
- **História da Empresa:** Origem e propósito do GranaFlux
- **Valores:** Missão, Visão e Valores da empresa
- **Equipe:** Apresentação dos fundadores
- **Estatísticas:** Números da empresa
- **Contato:** Informações para contato

---

### 4. 🔐 **Login (LoginPage)**
**Rota:** `/login`
**Arquivo:** `src/pages/LoginPage.tsx`

#### Funcionalidades:
- **Formulário de Login:** Email e senha
- **Validação:** Campos obrigatórios e formato de email
- **Mostrar/Ocultar Senha:** Toggle de visibilidade
- **Lembrar-me:** Checkbox para persistir login
- **Credenciais Demo:** Exibição das credenciais de teste
- **Redirecionamento:** Para dashboard após login bem-sucedido

#### Credenciais Padrão:
- **Email:** admin@granaflux.com
- **Senha:** admin123

---

### 5. 📊 **Dashboard Principal (DashboardPage)**
**Rota:** `/dashboard`
**Arquivo:** `src/pages/DashboardPage.tsx`

#### Layout:
- **Sidebar:** Navegação lateral com seções
- **Header:** Barra superior com ações do usuário
- **Content Area:** Área principal de conteúdo

#### Seções da Sidebar:
1. **Dashboard Principal** ✅
2. **Financials** ✅
3. **Transações** ✅
4. **Relatórios** (em desenvolvimento)
5. **Clientes** (em desenvolvimento)
6. **Configurações** (em desenvolvimento)

---

## 📊 DASHBOARD - Componentes e Funcionalidades

### 1. 📈 **KPI Cards (KPICards.tsx)**
**Localização:** `src/components/dashboard/KPICards.tsx`

#### Métricas Exibidas:
- **Entradas Totais:** Soma de todas as receitas (verde)
- **Saídas Totais:** Soma de todas as despesas (vermelho)
- **Lucro/Prejuízo:** Diferença entre entradas e saídas
- **Margem de Lucro:** Percentual de lucratividade

#### Funcionalidades:
- Formatação automática em Real (R$)
- Cores dinâmicas baseadas no resultado
- Loading state com skeleton
- Hover effects

---

### 2. 📊 **Gráfico Entradas vs Saídas (RevenueExpenseChart.tsx)**
**Localização:** `src/components/dashboard/RevenueExpenseChart.tsx`

#### Funcionalidades:
- **Barras Horizontais:** Comparação visual entre receitas e despesas
- **Percentuais Relativos:** Barras proporcionais ao maior valor
- **Resultado Final:** Cálculo automático do saldo
- **Animações:** Transições suaves nas barras

---

### 3. 🎯 **Medidor de Margem de Lucro (ProfitMarginGauge.tsx)**
**Localização:** `src/components/dashboard/ProfitMarginGauge.tsx`

#### Funcionalidades:
- **Gauge Semicircular:** Medidor visual da margem
- **Cores Dinâmicas:**
  - Vermelho: Prejuízo
  - Amarelo: Margem baixa (<10%)
  - Azul: Margem boa (10-25%)
  - Verde: Margem excelente (>25%)
- **Legenda:** Explicação das faixas de margem

---

### 4. 🥧 **Gráfico de Pizza - Despesas (ExpensesPieChart.tsx)**
**Localização:** `src/components/dashboard/ExpensesPieChart.tsx`

#### Funcionalidades:
- **Gráfico de Pizza SVG:** Distribuição das despesas por categoria
- **Legenda Interativa:** Lista com cores, valores e percentuais
- **Hover Effects:** Destaque ao passar o mouse
- **Total Centralizado:** Valor total no centro do gráfico

---

### 5. 📋 **Transações Recentes (RecentTransactions.tsx)**
**Localização:** `src/components/dashboard/RecentTransactions.tsx`

#### Funcionalidades:
- **Lista das 10 Últimas Transações:** Receitas e despesas
- **Informações Exibidas:**
  - Tipo (receita/despesa) com ícone
  - Descrição
  - Categoria com cor
  - Data formatada
  - Valor com sinal (+/-)
- **Estados Vazios:** Mensagem quando não há transações

---

### 6. ➕ **Modal de Nova Transação (AddTransactionModal.tsx)**
**Localização:** `src/components/dashboard/AddTransactionModal.tsx`

#### Funcionalidades:
- **Formulário Dinâmico:** Adapta-se para receita ou despesa
- **Campos:**
  - Descrição (obrigatório)
  - Valor em Real (obrigatório)
  - Data (padrão: hoje)
  - Categoria (carregada dinamicamente)
  - Observações (opcional)
- **Validação:** Frontend e backend
- **Loading States:** Durante carregamento e envio

---

## 🔧 BACKEND - API e Funcionalidades

### 1. 🔐 **Autenticação (auth.ts)**
**Rota Base:** `/api/auth`
**Arquivo:** `server/routes/auth.ts`

#### Endpoints:
- **POST /register:** Registro de usuário e empresa
- **POST /login:** Autenticação de usuário

#### Funcionalidades:
- Hash de senhas com bcryptjs (salt 12)
- Geração de JWT com expiração configurável
- Criação automática de categorias padrão
- Validação de entrada com express-validator
- Logging completo de ações

---

### 2. 👥 **Usuários (users.ts)**
**Rota Base:** `/api/users`
**Arquivo:** `server/routes/users.ts`

#### Endpoints:
- **GET /** Listar usuários da empresa (ADMIN/OWNER)
- **GET /:id** Buscar usuário específico
- **GET /me/profile** Perfil do usuário logado
- **POST /** Criar novo usuário (ADMIN/OWNER)
- **PUT /:id** Atualizar usuário
- **PUT /:id/password** Alterar senha
- **DELETE /:id** Deletar usuário (OWNER)

#### Controle de Acesso:
- **USER:** Acesso básico
- **ADMIN:** Gerenciar usuários
- **OWNER:** Controle total

---

### 3. 🏷️ **Categorias (categories.ts)**
**Rota Base:** `/api/categories`
**Arquivo:** `server/routes/categories.ts`

#### Endpoints:
- **GET /** Listar categorias (filtro por tipo)
- **GET /:id** Buscar categoria específica
- **POST /** Criar nova categoria
- **PUT /:id** Atualizar categoria
- **DELETE /:id** Deletar categoria (se não estiver em uso)

#### Tipos de Categoria:
- **REVENUE:** Apenas receitas
- **EXPENSE:** Apenas despesas
- **BOTH:** Receitas e despesas

#### Categorias Padrão:
**Receitas:**
- Vendas (#10B981)
- Serviços (#3B82F6)
- Investimentos (#8B5CF6)

**Despesas:**
- Folha de Pagamento (#EF4444)
- Fornecedores (#F59E0B)
- Marketing (#EC4899)
- Aluguel (#6B7280)
- Impostos (#DC2626)
- Matéria Prima (#059669)
- Energia (#D97706)
- Internet (#7C3AED)

---

### 4. 💰 **Receitas (revenues.ts)**
**Rota Base:** `/api/revenues`
**Arquivo:** `server/routes/revenues.ts`

#### Endpoints:
- **GET /** Listar receitas (paginação + filtros)
- **GET /:id** Buscar receita específica
- **POST /** Criar nova receita
- **PUT /:id** Atualizar receita
- **DELETE /:id** Deletar receita

#### Filtros Disponíveis:
- Paginação (page, limit)
- Categoria (categoryId)
- Período (startDate, endDate)

---

### 5. 💸 **Despesas (expenses.ts)**
**Rota Base:** `/api/expenses`
**Arquivo:** `server/routes/expenses.ts`

#### Endpoints:
- **GET /** Listar despesas (paginação + filtros)
- **GET /:id** Buscar despesa específica
- **POST /** Criar nova despesa
- **PUT /:id** Atualizar despesa
- **DELETE /:id** Deletar despesa

#### Funcionalidades Idênticas às Receitas:
- Mesma estrutura de filtros
- Mesma validação
- Mesmo controle de acesso

---

### 6. 📊 **Relatórios (reports.ts)**
**Rota Base:** `/api/reports`
**Arquivo:** `server/routes/reports.ts`

#### Endpoints:

##### **GET /dashboard**
- Resumo financeiro geral
- KPIs principais
- Distribuição por categorias
- Dados mensais para gráficos
- Transações recentes

##### **GET /monthly-summary**
- Resumo específico de um mês
- KPIs mensais
- Distribuição de despesas
- Contadores de transações

##### **GET /cash-flow**
- Relatório de fluxo de caixa
- Agrupamento por período (dia/semana/mês/ano)
- Entradas, saídas e saldo líquido

##### **GET /balance**
- Balanço anual
- Dados mensais do ano
- Resumo anual consolidado

---

## 🗄️ BANCO DE DADOS - Estrutura

### **Tabelas Principais:**

#### **Users (Usuários)**
- id, email, password, name, role
- Relacionamento: pertence a uma Company
- Roles: USER, ADMIN, OWNER

#### **Companies (Empresas)**
- id, name, cnpj, email, phone, address
- Relacionamento: tem muitos Users, Categories, Revenues, Expenses

#### **Categories (Categorias)**
- id, name, description, type, color
- Types: REVENUE, EXPENSE, BOTH
- Relacionamento: pertence a uma Company

#### **Revenues (Receitas)**
- id, description, amount, date, notes, attachment
- Relacionamentos: Category, Company, User

#### **Expenses (Despesas)**
- id, description, amount, date, notes, attachment
- Relacionamentos: Category, Company, User

---

## 🔒 SEGURANÇA E AUTENTICAÇÃO

### **Middleware de Segurança:**
- **Helmet:** Headers de segurança
- **CORS:** Configurado para frontend específico
- **Rate Limiting:** 100 requests por 15 minutos
- **JWT:** Tokens com expiração configurável
- **bcryptjs:** Hash de senhas com salt 12

### **Controle de Acesso:**
- **Autenticação:** JWT obrigatório em todas as rotas (exceto auth)
- **Autorização:** Baseada em roles (USER/ADMIN/OWNER)
- **Isolamento:** Dados por empresa (multi-tenant)

---

## 📱 FUNCIONALIDADES POR TELA

### **🏠 Landing Page**
✅ **Implementado:**
- Design responsivo e moderno
- Navegação com Header/Footer
- Seções informativas
- Call-to-actions para conversão

### **🔐 Página de Login**
✅ **Implementado:**
- Formulário de autenticação
- Validação de campos
- Credenciais de demonstração
- Redirecionamento automático
- Estados de loading e erro

### **📊 Dashboard Principal**
✅ **Implementado:**
- **KPI Cards:** 4 métricas principais
- **Gráfico de Barras:** Entradas vs Saídas
- **Medidor de Margem:** Gauge semicircular
- **Gráfico de Pizza:** Despesas por categoria
- **Transações Recentes:** Lista das últimas 10
- **Botões de Ação:** Nova receita/despesa

### **💼 Seção Financials**
✅ **Implementado:**
- Reutiliza componentes do dashboard
- Botões específicos para gestão financeira
- Foco em despesas e categorização

### **📋 Seção Transações**
✅ **Implementado:**
- Lista completa de transações
- Filtros de busca e categoria
- Botões para nova receita/despesa
- Modal de criação integrado

### **📈 Seções em Desenvolvimento**
🚧 **Planejado:**
- **Relatórios:** Relatórios detalhados e exportação
- **Clientes:** Gestão de clientes e faturamento
- **Configurações:** Perfil, empresa e preferências

---

## 🛠️ TECNOLOGIAS UTILIZADAS

### **Frontend:**
- **React 18** + TypeScript
- **Vite** (build tool)
- **Tailwind CSS** (estilização)
- **React Router** (navegação)
- **Lucide React** (ícones)

### **Backend:**
- **Node.js** + Express 4.18.2
- **TypeScript** (tipagem)
- **Prisma ORM** (banco de dados)
- **PostgreSQL** (banco)
- **JWT** (autenticação)
- **Winston** (logging)

### **Segurança:**
- **bcryptjs** (hash de senhas)
- **Helmet** (headers de segurança)
- **CORS** (controle de origem)
- **Rate Limiting** (proteção contra spam)

---

## 🚀 FLUXOS PRINCIPAIS

### **1. Fluxo de Registro:**
1. Usuário acessa `/pricing` ou `/login`
2. Clica em "Começar Teste Grátis"
3. Preenche dados pessoais e da empresa
4. Sistema cria empresa + usuário OWNER
5. Cria categorias padrão automaticamente
6. Redireciona para dashboard

### **2. Fluxo de Login:**
1. Usuário acessa `/login`
2. Insere credenciais
3. Sistema valida e gera JWT
4. Redireciona para dashboard
5. Token salvo no localStorage

### **3. Fluxo de Nova Transação:**
1. Usuário clica em "Nova Receita/Despesa"
2. Modal abre com formulário
3. Categorias carregadas dinamicamente
4. Validação frontend + backend
5. Transação salva no banco
6. Dashboard atualizada automaticamente

### **4. Fluxo de Dashboard:**
1. Carregamento dos dados via API
2. Processamento dos KPIs
3. Geração dos gráficos
4. Exibição das transações recentes
5. Atualização em tempo real

---

## 📊 DADOS E RELATÓRIOS

### **KPIs Calculados:**
- **Total de Receitas:** Soma por período
- **Total de Despesas:** Soma por período
- **Lucro Líquido:** Receitas - Despesas
- **Margem de Lucro:** (Lucro / Receitas) × 100

### **Relatórios Disponíveis:**
- **Dashboard Geral:** Visão consolidada
- **Resumo Mensal:** Dados específicos do mês
- **Fluxo de Caixa:** Entradas e saídas por período
- **Balanço Anual:** Dados anuais consolidados

### **Filtros e Agrupamentos:**
- Por período (data inicial/final)
- Por categoria
- Por tipo (receita/despesa)
- Agrupamento temporal (dia/semana/mês/ano)

---

## 🎨 DESIGN E UX

### **Paleta de Cores:**
- **Primária:** Azul (#3B82F6, #1E40AF)
- **Receitas:** Verde (#10B981)
- **Despesas:** Vermelho (#EF4444)
- **Neutros:** Cinzas (#6B7280, #F3F4F6)

### **Componentes de UI:**
- **Cards:** Bordas arredondadas, sombras sutis
- **Botões:** Estados hover, loading e disabled
- **Formulários:** Validação visual, placeholders
- **Gráficos:** Animações suaves, cores consistentes

### **Responsividade:**
- **Mobile First:** Design adaptável
- **Breakpoints:** sm, md, lg, xl
- **Sidebar:** Colapsável em mobile
- **Grid System:** Tailwind CSS Grid

---

## 🔧 CONFIGURAÇÃO E DEPLOY

### **Variáveis de Ambiente:**
```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="secret-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

### **Scripts Disponíveis:**
- `npm run dev` - Frontend (Vite)
- `npm run dev:server` - Backend (tsx watch)
- `npm run build` - Build frontend
- `npm run build:server` - Build backend
- `npm run setup` - Configuração inicial
- `npm run db:studio` - Interface visual do banco

### **Estrutura de Logs:**
- **combined.log:** Todos os logs
- **error.log:** Apenas erros
- **Winston:** Logging estruturado
- **Morgan:** Logs HTTP

---

## 📈 MÉTRICAS E MONITORAMENTO

### **Health Check:**
- **Endpoint:** `/health`
- **Informações:** Status, timestamp, environment, version

### **Logging:**
- **Ações de usuário:** Login, CRUD operations
- **Erros:** Stack traces completos
- **Performance:** Tempo de resposta das APIs
- **Segurança:** Tentativas de acesso inválido

---

## 🚀 PRÓXIMAS FUNCIONALIDADES

### **Em Desenvolvimento:**
1. **Módulo de Relatórios Avançados**
   - Exportação PDF/Excel
   - Gráficos personalizáveis
   - Comparativos temporais

2. **Gestão de Clientes**
   - Cadastro de clientes
   - Faturamento
   - Controle de recebimentos

3. **Configurações Avançadas**
   - Perfil da empresa
   - Preferências do usuário
   - Integrações bancárias

4. **App Mobile**
   - React Native
   - Sincronização offline
   - Notificações push

---

## 📋 RESUMO TÉCNICO

### **Arquitetura:**
- **Frontend:** SPA React com roteamento
- **Backend:** API REST com Express
- **Banco:** PostgreSQL com Prisma ORM
- **Autenticação:** JWT stateless
- **Deploy:** Preparado para Hostinger/VPS

### **Padrões Utilizados:**
- **MVC:** Separação de responsabilidades
- **RESTful:** APIs padronizadas
- **Component-Based:** Componentes reutilizáveis
- **Type Safety:** TypeScript em todo o projeto

### **Performance:**
- **Lazy Loading:** Componentes sob demanda
- **Paginação:** Listas grandes otimizadas
- **Caching:** localStorage para token
- **Otimização:** Vite para build otimizado

---

**🎉 Sistema completo e funcional, pronto para produção!**