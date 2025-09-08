# 🚀 Guia de Instalação Completa - GranaFlux

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- Node.js 18+ (https://nodejs.org/)
- PostgreSQL 12+ (https://www.postgresql.org/download/)
- Git (https://git-scm.com/)

## 🗄️ Configuração do PostgreSQL

### 1. Instalar PostgreSQL no Windows

1. **Baixe o PostgreSQL:**
   - Acesse: https://www.postgresql.org/download/windows/
   - Baixe a versão mais recente (16.x)
   - Execute o instalador

2. **Durante a instalação:**
   - Porta padrão: `5432`
   - Defina uma senha para o usuário `postgres` (anote essa senha!)
   - Instale o pgAdmin (interface gráfica)

### 2. Configurar o Banco de Dados

Abra o **Command Prompt** ou **PowerShell** como administrador e execute:

```cmd
# Conectar ao PostgreSQL (substitua 'SUA_SENHA' pela senha que você definiu)
psql -U postgres -h localhost

# Dentro do psql, execute os comandos:
CREATE DATABASE granaflux_db;
CREATE USER granaflux_user WITH PASSWORD 'granaflux123';
GRANT ALL PRIVILEGES ON DATABASE granaflux_db TO granaflux_user;
\q
```

**Alternativa usando pgAdmin:**
1. Abra o pgAdmin
2. Conecte com o usuário `postgres`
3. Clique direito em "Databases" → "Create" → "Database"
4. Nome: `granaflux_db`
5. Owner: `postgres`

## ⚙️ Configuração do Projeto

### 1. Clonar e Configurar

```cmd
# Navegar para o diretório do projeto
cd C:\Users\Jacques\OneDrive\Documentos\GitHub\granaflux

# Copiar arquivo de configuração
copy .env.example .env
```

### 2. Editar o arquivo .env

Abra o arquivo `.env` no seu editor favorito e configure:

```env
# Database Configuration
DATABASE_URL="postgresql://granaflux_user:granaflux123@localhost:5432/granaflux_db"

# JWT Configuration
JWT_SECRET="meu-jwt-super-secreto-granaflux-2024"
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

### 3. Instalar Dependências e Configurar

```cmd
# Instalar todas as dependências
npm install

# Corrigir vulnerabilidades (opcional)
npm audit fix

# Gerar cliente Prisma
npm run db:generate

# Aplicar schema ao banco
npm run db:push

# Executar setup inicial (criar usuário admin e categorias)
npm run setup
```

## 🚀 Executar o Sistema

### Opção 1: Dois terminais separados (Recomendado)

**Terminal 1 - Backend:**
```cmd
npm run dev:server
```

**Terminal 2 - Frontend:**
```cmd
npm run dev
```

### Opção 2: Um terminal só (alternativa)

Você pode usar o VS Code ou instalar o `concurrently`:

```cmd
npm install -g concurrently
```

Depois adicione no package.json:
```json
"dev:full": "concurrently \"npm run dev:server\" \"npm run dev\""
```

## 🔐 Credenciais de Acesso

Após executar o setup, use estas credenciais:

- **URL:** http://localhost:5173
- **Email:** admin@granaflux.com
- **Senha:** admin123

## 🛠️ Comandos Úteis

```cmd
# Ver logs do banco
npm run db:studio

# Resetar banco (cuidado - apaga tudo!)
npm run db:reset

# Ver estrutura do banco
npx prisma db pull

# Gerar nova migração
npx prisma migrate dev --name nome_da_migracao

# Build para produção
npm run build
npm run build:server
```

## 🔍 Verificar se está funcionando

1. **Backend:** Acesse http://localhost:3001/health
   - Deve retornar: `{"status":"OK","timestamp":"...","environment":"development","version":"1.0.0"}`

2. **Frontend:** Acesse http://localhost:5173
   - Deve carregar a página inicial do GranaFlux

3. **Banco:** Execute `npm run db:studio`
   - Abre interface visual do banco em http://localhost:5555

## ❌ Problemas Comuns

### Erro de conexão com banco:
```cmd
# Verificar se PostgreSQL está rodando
net start postgresql-x64-16

# Ou no Services.msc procurar por PostgreSQL
```

### Erro de porta ocupada:
```cmd
# Verificar o que está usando a porta
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# Matar processo se necessário
taskkill /PID <numero_do_pid> /F
```

### Erro de permissão no banco:
```sql
-- Conectar como postgres e executar:
GRANT ALL PRIVILEGES ON DATABASE granaflux_db TO granaflux_user;
GRANT ALL ON SCHEMA public TO granaflux_user;
```

## 📊 Estrutura de Pastas

```
granaflux/
├── src/                 # Frontend React
├── server/              # Backend Node.js
├── prisma/              # Schema do banco
├── logs/                # Logs da aplicação
├── .env                 # Configurações
└── package.json         # Dependências
```

## 🆘 Suporte

Se tiver problemas:
1. Verifique se PostgreSQL está rodando
2. Confirme as credenciais no .env
3. Execute `npm run db:studio` para ver o banco
4. Verifique os logs em `logs/error.log`

---

**Próximo passo:** Execute os comandos na ordem e teste o acesso!