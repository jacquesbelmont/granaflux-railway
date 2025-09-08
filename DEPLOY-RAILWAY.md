# 🚀 Deploy no Railway - GranaFlux

## 📋 Pré-requisitos Verificados

✅ **package.json atualizado** com scripts necessários:
- `start`: Inicia a aplicação em produção
- `build`: Constrói frontend e backend
- `build:frontend`: Constrói apenas o frontend
- `build:server`: Constrói apenas o backend
- `postinstall`: Gera cliente Prisma após instalação

✅ **Procfile criado** para garantir comando de inicialização

✅ **server/app.ts ajustado** para servir arquivos estáticos em produção

✅ **railway.json** configurado para otimizar o deploy

## 🚂 Passos para Deploy no Railway

### 1. Criar Conta no Railway
1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Conecte seu repositório

### 2. Configurar Banco de Dados
1. No painel do Railway, clique em "New Project"
2. Selecione "Provision PostgreSQL"
3. Anote as credenciais do banco

### 3. Configurar Variáveis de Ambiente
No painel do Railway, vá em "Variables" e adicione:

```env
DATABASE_URL=postgresql://postgres:password@host:port/database
JWT_SECRET=your-super-secure-jwt-secret-for-production
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://your-app.railway.app
PORT=3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Deploy da Aplicação
1. Conecte seu repositório GitHub
2. Railway detectará automaticamente o projeto Node.js
3. O build será executado automaticamente
4. Aguarde o deploy finalizar

### 5. Configurar Domínio (Opcional)
1. No painel, vá em "Settings" > "Domains"
2. Clique em "Generate Domain" para um subdomínio gratuito
3. Ou configure seu domínio personalizado

## 🔧 Comandos de Build

O Railway executará automaticamente:

```bash
# 1. Instalar dependências
npm install

# 2. Executar postinstall (gerar Prisma)
npm run postinstall

# 3. Build da aplicação
npm run build

# 4. Iniciar aplicação
npm start
```

## 📊 Monitoramento

### Health Check
- **Endpoint:** `/health`
- **Resposta esperada:** `{"status":"OK","timestamp":"...","environment":"production","version":"1.0.0"}`

### Logs
- Acesse os logs em tempo real no painel do Railway
- Logs são salvos automaticamente

## 🔒 Segurança em Produção

### Variáveis Críticas:
- **DATABASE_URL:** URL completa do PostgreSQL
- **JWT_SECRET:** Chave secreta forte (mínimo 32 caracteres)
- **FRONTEND_URL:** URL exata do seu domínio

### Headers de Segurança:
- Helmet configurado automaticamente
- CORS restrito ao domínio de produção
- Rate limiting ativo

## 🗄️ Banco de Dados

### Primeira Execução:
Após o deploy, execute uma vez para criar dados iniciais:

```bash
# No terminal do Railway ou localmente apontando para produção
npm run setup
```

### Credenciais Padrão:
- **Email:** admin@granaflux.com
- **Senha:** admin123

## 📱 Funcionalidades Disponíveis

### ✅ Módulos Implementados:
- **Gestão Financeira** (receitas/despesas)
- **Controle de Estoque** (produtos/movimentações)
- **Sistema de Vendas** (PDV/comissões)
- **CRM** (clientes/histórico)
- **Gestão de Tasks** (funcionários/produtividade)
- **Sistema de Permissões** (4 níveis)
- **Dashboard Completo** (KPIs/relatórios)

### 👥 Níveis de Acesso:
- **OWNER:** Acesso total
- **ADMIN:** Gestão administrativa
- **CASHIER:** Operações de venda
- **USER:** Tasks e consultas

## 🔍 Verificação Pós-Deploy

### 1. Testar Health Check:
```bash
curl https://your-app.railway.app/health
```

### 2. Testar Login:
```bash
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@granaflux.com","password":"admin123"}'
```

### 3. Testar Frontend:
- Acesse `https://your-app.railway.app`
- Faça login com as credenciais padrão
- Navegue pelas seções do dashboard

## 🚨 Troubleshooting

### Erro de Build:
- Verifique se todas as dependências estão no `package.json`
- Confirme se o `tsconfig.server.json` está correto

### Erro de Banco:
- Verifique se a `DATABASE_URL` está correta
- Confirme se o banco PostgreSQL está ativo

### Erro 404 nas Rotas:
- Verifique se o `express.static` está configurado
- Confirme se o catch-all handler está funcionando

### Erro de CORS:
- Verifique se `FRONTEND_URL` aponta para o domínio correto
- Confirme se não há trailing slash na URL

## 📈 Próximos Passos

Após o deploy bem-sucedido:

1. **Configurar dados reais** da sua empresa
2. **Criar usuários** para sua equipe
3. **Importar produtos** e clientes existentes
4. **Configurar comissões** personalizadas
5. **Treinar equipe** no uso do sistema

---

**🎉 Seu sistema está pronto para produção no Railway!**