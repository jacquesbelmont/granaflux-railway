# GranaFlux - Sistema de Gestão Financeira Empresarial

Sistema completo de gestão financeira para empresas, com frontend React e backend Node.js + PostgreSQL.

## 🚀 Funcionalidades

### Frontend
- Landing page moderna e responsiva
- Sistema de autenticação (login/registro)
- Dashboard financeiro interativo
- Gestão de receitas e despesas
- Relatórios e gráficos
- Gestão de categorias
- Perfil de usuário e empresa

### Backend API
- API REST completa
- Autenticação JWT
- CRUD para todas as entidades
- Relatórios financeiros
- Controle de acesso por roles
- Rate limiting e segurança
- Sistema de logging com Winston

## 🛠️ Tecnologias

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React (ícones)

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcryptjs para hash de senhas
- Winston para logging

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 12+
- npm ou yarn

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <repository-url>
cd granaflux
```

### 2. Configure o banco de dados

#### Opção A: PostgreSQL Local
```bash
# Instale o PostgreSQL
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (com Homebrew)
brew install postgresql
brew services start postgresql

# Crie o banco de dados
sudo -u postgres createdb granaflux_db
```

#### Opção B: PostgreSQL no Hostinger
1. Acesse o painel do Hostinger
2. Vá em "Databases" > "Create Database"
3. Anote as credenciais fornecidas

### 3. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
nano .env
```

**Configuração para desenvolvimento local:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/granaflux_db"
JWT_SECRET="seu-jwt-secret-super-seguro"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

**Configuração para produção (Hostinger):**
```env
DATABASE_URL="postgresql://username:password@your-hostinger-db-host:5432/granaflux_production"
JWT_SECRET="seu-jwt-secret-super-seguro-producao"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="production"
FRONTEND_URL="https://seudominio.com"
```

### 4. Execute o script de configuração inicial
```bash
npm run setup
```

Este script irá:
- Instalar todas as dependências
- Gerar o cliente Prisma
- Aplicar migrações do banco
- Criar usuário admin padrão
- Criar categorias padrão

### 5. Inicie o desenvolvimento
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run dev:server
```

## 📊 Credenciais Padrão

Após executar o setup inicial, use estas credenciais para fazer login:

- **Email:** admin@granaflux.com
- **Senha:** admin123

## 📚 Documentação da API

### Autenticação

#### Registro
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@empresa.com",
  "password": "senha123",
  "name": "Nome do Usuário",
  "companyName": "Nome da Empresa",
  "cnpj": "12.345.678/0001-90"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@empresa.com",
  "password": "senha123"
}
```

### Receitas

#### Listar receitas
```bash
GET /api/revenues?page=1&limit=10&categoryId=xxx&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

#### Criar receita
```bash
POST /api/revenues
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Venda de produto",
  "amount": 1500.00,
  "date": "2024-01-15",
  "categoryId": "categoria-id",
  "notes": "Observações opcionais"
}
```

### Despesas

#### Criar despesa
```bash
POST /api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Pagamento fornecedor",
  "amount": 800.00,
  "date": "2024-01-15",
  "categoryId": "categoria-id"
}
```

### Relatórios

#### Dashboard
```bash
GET /api/reports/dashboard?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

#### Resumo mensal
```bash
GET /api/reports/monthly-summary?month=8&year=2025
Authorization: Bearer <token>
```

## 🚀 Deploy em Produção

### Hostinger VPS

1. **Conecte via SSH:**
```bash
ssh root@seu-ip-hostinger
```

2. **Instale dependências:**
```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Instalar PM2
npm install -g pm2

# Instalar PostgreSQL (se necessário)
apt install postgresql postgresql-contrib
```

3. **Clone e configure o projeto:**
```bash
git clone <seu-repositorio>
cd granaflux
```

4. **Configure variáveis de ambiente:**
```bash
cp .env.example .env
nano .env
# Configure com dados do Hostinger
```

5. **Execute setup:**
```bash
npm run setup
```

6. **Build e start:**
```bash
npm run build:server
pm2 start dist/app.js --name "granaflux-api"
pm2 startup
pm2 save
```

### Hostinger Shared Hosting

Para hospedagem compartilhada, você precisará:

1. **Configurar Node.js no painel:**
   - Ative Node.js no painel do Hostinger
   - Configure a versão 18+

2. **Upload dos arquivos:**
   - Faça upload do código via File Manager
   - Configure o arquivo .env

3. **Instalar dependências:**
```bash
npm install --production
```

4. **Configurar startup:**
   - Configure o arquivo de entrada no painel
   - Geralmente: `server/app.js`

## 🔒 Segurança

- Senhas são hasheadas com bcrypt
- JWT para autenticação
- Rate limiting implementado
- Validação de entrada em todas as rotas
- CORS configurado
- Helmet para headers de segurança
- Logging completo com Winston

## 📊 Monitoramento

### Logs
```bash
# Ver logs do PM2
pm2 logs granaflux-api

# Ver logs em tempo real
pm2 logs granaflux-api --lines 100

# Ver arquivos de log
tail -f logs/combined.log
tail -f logs/error.log
```

### Health Check
```bash
curl http://localhost:3001/health
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

Para suporte, envie um email para suporte@granaflux.com ou abra uma issue no GitHub.

---

**GranaFlux** - Transformando a gestão financeira das empresas brasileiras 🚀