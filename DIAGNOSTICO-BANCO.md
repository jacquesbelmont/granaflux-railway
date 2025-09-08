# 🔍 Diagnóstico do Banco de Dados

## Passo 1: Verificar se PostgreSQL está rodando

```cmd
# Verificar serviços do Windows
net start | findstr postgres

# Ou abrir gerenciador de serviços
services.msc
```

## Passo 2: Testar conexão básica

```cmd
# Tentar conectar como postgres (usuário padrão)
psql -U postgres -h localhost

# Se funcionar, você verá algo como:
# postgres=#
```

## Passo 3: Verificar bancos existentes

Dentro do psql:
```sql
\l
```

## Passo 4: Verificar usuários existentes

```sql
\du
```

## Passo 5: Recriar tudo do zero

Se nada funcionar, execute estes comandos dentro do psql:

```sql
-- Deletar banco se existir
DROP DATABASE IF EXISTS granaflux_db;

-- Deletar usuário se existir  
DROP USER IF EXISTS granaflux_user;

-- Recriar banco
CREATE DATABASE granaflux_db;

-- Recriar usuário
CREATE USER granaflux_user WITH PASSWORD 'senha123';

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE granaflux_db TO granaflux_user;

-- Conectar ao banco
\c granaflux_db

-- Dar permissões no schema
GRANT ALL ON SCHEMA public TO granaflux_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO granaflux_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO granaflux_user;

-- Sair
\q
```

## Configurações alternativas para .env:

### Opção 1: Usuário dedicado
```env
DATABASE_URL="postgresql://granaflux_user:senha123@localhost:5432/granaflux_db"
```

### Opção 2: Usuário postgres (mais simples)
```env
DATABASE_URL="postgresql://postgres:SUA_SENHA_POSTGRES@localhost:5432/granaflux_db"
```

### Opção 3: Com parâmetros SSL
```env
DATABASE_URL="postgresql://granaflux_user:senha123@localhost:5432/granaflux_db?sslmode=disable"
```