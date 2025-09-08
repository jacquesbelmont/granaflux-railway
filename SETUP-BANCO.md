# 🗄️ Configuração Completa do PostgreSQL - GranaFlux

## 🔧 Passo 1: Verificar PostgreSQL

Primeiro, vamos verificar se o PostgreSQL está funcionando:

```cmd
# Verificar se o serviço está rodando
net start postgresql-x64-16

# Ou verificar a versão instalada
psql --version
```

## 🔑 Passo 2: Configurar o Banco (Método Simples)

**Abra o Command Prompt como ADMINISTRADOR** e execute:

```cmd
# Conectar como usuário postgres (vai pedir a senha que você definiu na instalação)
psql -U postgres -h localhost

# Se der erro, tente:
psql -U postgres
```

**Dentro do psql, execute estes comandos um por vez:**

```sql
-- Criar o banco
CREATE DATABASE granaflux_db;

-- Criar usuário (use uma senha simples para teste)
CREATE USER granaflux_user WITH PASSWORD 'senha123';

-- Dar todas as permissões
GRANT ALL PRIVILEGES ON DATABASE granaflux_db TO granaflux_user;

-- Conectar ao banco criado
\c granaflux_db

-- Dar permissões no schema
GRANT ALL ON SCHEMA public TO granaflux_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO granaflux_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO granaflux_user;

-- Sair do psql
\q
```

## 📝 Passo 3: Atualizar o .env

Edite seu arquivo `.env` com estas configurações:

```env
# Database Configuration
DATABASE_URL="postgresql://granaflux_user:senha123@localhost:5432/granaflux_db"

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

## 🧪 Passo 4: Testar a Conexão

```cmd
# Testar se consegue conectar
psql -U granaflux_user -h localhost -d granaflux_db

# Se pedir senha, digite: senha123
# Se conectar, digite \q para sair
```

## 🚀 Passo 5: Aplicar o Schema

```cmd
# Agora tente novamente
npm run db:push
```

## ❌ Se ainda der erro, tente o método alternativo:

### Método Alternativo - Usar usuário postgres:

Edite o `.env` para usar o usuário postgres diretamente:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA_POSTGRES@localhost:5432/granaflux_db"
```

Substitua `SUA_SENHA_POSTGRES` pela senha que você definiu quando instalou o PostgreSQL.

## 🔍 Verificar se PostgreSQL está rodando:

```cmd
# Windows - verificar serviços
services.msc

# Procurar por "postgresql" e verificar se está "Running"
# Se não estiver, clique direito e "Start"
```

## 📋 Comandos de Diagnóstico:

```cmd
# Verificar se a porta 5432 está aberta
netstat -an | findstr 5432

# Verificar versão do PostgreSQL
psql --version

# Listar bancos (se conseguir conectar)
psql -U postgres -l
```

---

**Execute estes passos na ordem e me avise qual comando deu erro!**