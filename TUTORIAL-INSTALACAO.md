# 🚀 Tutorial de Instalação - GranaFlux Sistema Completo

## 📋 O que você vai ter após a instalação:

### 🎯 **Sistema Completo de Gestão Empresarial:**
- ✅ **Gestão Financeira** (receitas/despesas)
- ✅ **Gestão de Estoque** (produtos/movimentações)
- ✅ **PDV - Ponto de Venda** (vendas/comissões)
- ✅ **CRM** (clientes/histórico)
- ✅ **Gestão de Tasks** (funcionários/produtividade)
- ✅ **Sistema de Permissões** (4 níveis de acesso)

### 👥 **Níveis de Acesso:**
- **OWNER** - Proprietário (acesso total)
- **ADMIN** - Administrador (gestão completa)
- **CASHIER** - Operador de Caixa (vendas/estoque)
- **USER** - Funcionário (tasks/consultas)

---

## 🛠️ **PASSO 1: Pré-requisitos**

### Windows:
```cmd
# 1. Instalar Node.js 18+
# Baixe em: https://nodejs.org/

# 2. Instalar PostgreSQL
# Baixe em: https://www.postgresql.org/download/windows/
# Durante instalação, anote a SENHA do usuário 'postgres'
```

### Verificar instalação:
```cmd
node --version
npm --version
psql --version
```

---

## 🗄️ **PASSO 2: Configurar PostgreSQL**

### Abra o **Command Prompt como ADMINISTRADOR**:

```cmd
# Conectar ao PostgreSQL (substitua 'SUA_SENHA' pela senha do postgres)
psql -U postgres -h localhost
```

### Dentro do psql, execute:
```sql
-- Criar banco de dados
CREATE DATABASE granaflux_sistema;

-- Criar usuário dedicado
CREATE USER granaflux_admin WITH PASSWORD 'granaflux2024';

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE granaflux_sistema TO granaflux_admin;

-- Conectar ao banco
\c granaflux_sistema

-- Dar permissões no schema
GRANT ALL ON SCHEMA public TO granaflux_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO granaflux_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO granaflux_admin;

-- Sair
\q
```

---

## ⚙️ **PASSO 3: Configurar o Projeto**

### 1. Navegar para o diretório:
```cmd
cd C:\caminho\para\seu\projeto\granaflux
```

### 2. Copiar configurações:
```cmd
copy .env.example .env
```

### 3. Editar o arquivo `.env`:
Abra o arquivo `.env` e configure:

```env
# Database Configuration
DATABASE_URL="postgresql://granaflux_admin:granaflux2024@localhost:5432/granaflux_sistema"

# JWT Configuration
JWT_SECRET="granaflux-jwt-super-secreto-2024-sistema-completo"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV="development"

# CORS Configuration
FRONTEND_URL="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🚀 **PASSO 4: Executar Instalação Automática**

### Execute o script de configuração completa:
```cmd
npm run setup:complete
```

**Este script vai:**
- ✅ Instalar todas as dependências
- ✅ Configurar o banco de dados
- ✅ Criar todas as tabelas
- ✅ Criar usuários de exemplo
- ✅ Criar produtos de exemplo
- ✅ Criar clientes de exemplo
- ✅ Criar tasks de exemplo
- ✅ Configurar categorias padrão

---

## 🎯 **PASSO 5: Iniciar o Sistema**

### Terminal 1 - Backend:
```cmd
npm run dev:server
```

### Terminal 2 - Frontend:
```cmd
npm run dev
```

### Aguarde as mensagens:
```
🚀 Servidor GranaFlux rodando na porta 3001
📊 Ambiente: development
🌐 CORS habilitado para: http://localhost:5173
```

---

## 🔐 **CREDENCIAIS DE ACESSO**

### Acesse: http://localhost:5173

#### **👑 ADMINISTRADOR (Acesso Total):**
- **Email:** admin@granaflux.com
- **Senha:** admin123
- **Permissões:** Tudo (financeiro, estoque, vendas, CRM, tasks, relatórios)

#### **🏪 OPERADOR DE CAIXA:**
- **Email:** caixa@granaflux.com
- **Senha:** caixa123
- **Permissões:** Vendas, estoque, consulta de clientes

#### **👷 FUNCIONÁRIO:**
- **Email:** funcionario@granaflux.com
- **Senha:** func123
- **Permissões:** Tasks, consultas básicas

---

## 📊 **FUNCIONALIDADES POR PERFIL**

### **👑 OWNER/ADMIN:**
- 📈 Dashboard financeiro completo
- 💰 Gestão de receitas e despesas
- 📦 Controle total do estoque
- 🛒 Relatórios de vendas e comissões
- 👥 CRM completo
- 📋 Criação e gestão de tasks
- ⚙️ Configurações do sistema

### **🏪 CASHIER (Operador de Caixa):**
- 🛒 Registro de vendas (PDV)
- 📦 Adição/ajuste de estoque
- 👥 Consulta de clientes
- 📊 Relatórios básicos de vendas
- 💰 Consulta de comissões próprias

### **👷 USER (Funcionário):**
- 📋 Visualização de tasks atribuídas
- ✅ Atualização de status das tasks
- 📊 Consulta de produtividade própria
- 💰 Consulta de comissões próprias

---

## 🧪 **TESTAR O SISTEMA**

### 1. **Teste como Administrador:**
```
1. Faça login com admin@granaflux.com
2. Acesse "Dashboard Principal" - veja KPIs financeiros
3. Acesse "Estoque" - veja produtos cadastrados
4. Acesse "Vendas" - veja relatórios de vendas
5. Acesse "CRM" - veja clientes cadastrados
6. Acesse "Tasks" - veja visão geral da equipe
```

### 2. **Teste como Operador de Caixa:**
```
1. Faça login com caixa@granaflux.com
2. Acesse "Vendas" - registre uma nova venda
3. Acesse "Estoque" - ajuste estoque de produtos
4. Acesse "CRM" - consulte clientes
```

### 3. **Teste como Funcionário:**
```
1. Faça login com funcionario@granaflux.com
2. Acesse "Tasks" - veja suas tarefas
3. Atualize status de uma task para "Em Andamento"
4. Consulte suas comissões (se houver)
```

---

## 📊 **DADOS DE EXEMPLO CRIADOS**

### **👥 Usuários:**
- 1 Proprietário (OWNER)
- 1 Operador de Caixa (CASHIER)  
- 1 Funcionário (USER)

### **📦 Produtos:**
- Smartphone Samsung Galaxy A54 5G (15 unidades)
- Notebook Dell Inspiron 15 3000 (8 unidades)
- Fone de Ouvido Bluetooth JBL (25 unidades)

### **👤 Clientes:**
- João Silva (CPF)
- Maria Santos (CPF)
- Empresa ABC Ltda (CNPJ)

### **📋 Tasks:**
- Organizar estoque (PENDENTE - Alta prioridade)
- Atualizar preços (EM ANDAMENTO - Média prioridade)
- Conferir caixa (PENDENTE - Urgente)

### **🏷️ Categorias:**
- **Financeiras:** Vendas, Serviços, Folha de Pagamento, etc.
- **Produtos:** Eletrônicos, Roupas, Casa e Jardim, Serviços

---

## 🔧 **COMANDOS ÚTEIS**

```cmd
# Ver interface visual do banco
npm run db:studio

# Resetar banco (CUIDADO - apaga tudo!)
npm run db:reset

# Testar conexão com banco
node test-db-connection.js

# Ver logs do sistema
tail -f logs/combined.log

# Verificar saúde da API
curl http://localhost:3001/health
```

---

## ❌ **SOLUÇÃO DE PROBLEMAS**

### **Erro de conexão com banco:**
```cmd
# Verificar se PostgreSQL está rodando
net start postgresql-x64-16

# Ou abrir services.msc e procurar "postgresql"
```

### **Erro de porta ocupada:**
```cmd
# Verificar o que está usando as portas
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# Matar processo se necessário
taskkill /PID <numero_do_pid> /F
```

### **Erro de permissão no banco:**
```sql
-- Conectar como postgres e executar:
GRANT ALL PRIVILEGES ON DATABASE granaflux_sistema TO granaflux_admin;
GRANT ALL ON SCHEMA public TO granaflux_admin;
```

---

## 📁 **ESTRUTURA DO SISTEMA**

```
granaflux/
├── src/                     # Frontend React
│   ├── components/          # Componentes reutilizáveis
│   │   └── dashboard/       # Componentes do dashboard
│   ├── pages/              # Páginas da aplicação
│   ├── services/           # Serviços de API
│   └── types/              # Tipos TypeScript
├── server/                 # Backend Node.js
│   ├── routes/             # Rotas da API
│   ├── config/             # Configurações
│   └── middleware/         # Middlewares
├── prisma/                 # Schema do banco
├── logs/                   # Logs da aplicação
└── .env                    # Configurações
```

---

## 🎉 **PRÓXIMOS PASSOS**

Após a instalação bem-sucedida:

1. **Explore o sistema** com as diferentes credenciais
2. **Cadastre seus próprios dados** (produtos, clientes, etc.)
3. **Configure comissões** para seus funcionários
4. **Crie tasks** para sua equipe
5. **Registre vendas** e veja o estoque sendo atualizado automaticamente

---

## 🆘 **SUPORTE**

Se tiver problemas:
1. ✅ Verifique se PostgreSQL está rodando
2. ✅ Confirme as credenciais no .env
3. ✅ Execute `npm run db:studio` para ver o banco
4. ✅ Verifique os logs em `logs/error.log`
5. ✅ Teste a API: `curl http://localhost:3001/health`

---

**🎯 Sistema completo e funcional, pronto para produção!**