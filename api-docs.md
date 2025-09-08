# GranaFlux API Documentation

## Base URL
- **Desenvolvimento:** `http://localhost:3001/api`
- **Produção:** `https://seudominio.com/api`

## Autenticação

Todas as rotas (exceto auth) requerem um token JWT no header:
```
Authorization: Bearer <token>
```

## Endpoints

### 🔐 Autenticação

#### POST /auth/register
Registra um novo usuário e empresa.

**Body:**
```json
{
  "email": "usuario@empresa.com",
  "password": "senha123",
  "name": "Nome do Usuário",
  "companyName": "Nome da Empresa",
  "cnpj": "12.345.678/0001-90" // opcional
}
```

**Response (201):**
```json
{
  "message": "Usuário criado com sucesso",
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "email": "usuario@empresa.com",
    "name": "Nome do Usuário",
    "role": "OWNER",
    "company": {
      "id": "company-id",
      "name": "Nome da Empresa"
    }
  }
}
```

#### POST /auth/login
Autentica um usuário.

**Body:**
```json
{
  "email": "usuario@empresa.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "message": "Login realizado com sucesso",
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "email": "usuario@empresa.com",
    "name": "Nome do Usuário",
    "role": "OWNER",
    "company": {
      "id": "company-id",
      "name": "Nome da Empresa"
    }
  }
}
```

### 💰 Receitas

#### GET /revenues
Lista receitas da empresa.

**Query Parameters:**
- `page` (number): Página (padrão: 1)
- `limit` (number): Itens por página (padrão: 10)
- `categoryId` (string): Filtrar por categoria
- `startDate` (string): Data inicial (YYYY-MM-DD)
- `endDate` (string): Data final (YYYY-MM-DD)

**Response (200):**
```json
{
  "revenues": [
    {
      "id": "revenue-id",
      "description": "Venda de produto",
      "amount": "1500.00",
      "date": "2024-01-15T00:00:00.000Z",
      "notes": "Observações",
      "attachment": null,
      "category": {
        "id": "category-id",
        "name": "Vendas",
        "color": "#10B981"
      },
      "user": {
        "name": "Nome do Usuário",
        "email": "usuario@empresa.com"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### GET /revenues/:id
Busca uma receita específica.

#### POST /revenues
Cria uma nova receita.

**Body:**
```json
{
  "description": "Venda de produto",
  "amount": 1500.00,
  "date": "2024-01-15",
  "categoryId": "category-id",
  "notes": "Observações opcionais",
  "attachment": "url-do-anexo"
}
```

#### PUT /revenues/:id
Atualiza uma receita.

#### DELETE /revenues/:id
Deleta uma receita.

### 💸 Despesas

#### GET /expenses
Lista despesas da empresa (mesma estrutura das receitas).

#### POST /expenses
Cria uma nova despesa.

**Body:**
```json
{
  "description": "Pagamento fornecedor",
  "amount": 800.00,
  "date": "2024-01-15",
  "categoryId": "category-id",
  "notes": "Observações opcionais"
}
```

### 🏷️ Categorias

#### GET /categories
Lista categorias da empresa.

**Query Parameters:**
- `type` (string): REVENUE, EXPENSE ou BOTH

**Response (200):**
```json
[
  {
    "id": "category-id",
    "name": "Vendas",
    "description": "Receitas de vendas",
    "type": "REVENUE",
    "color": "#10B981",
    "_count": {
      "revenues": 15,
      "expenses": 0
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /categories
Cria uma nova categoria.

**Body:**
```json
{
  "name": "Marketing Digital",
  "description": "Gastos com marketing online",
  "type": "EXPENSE",
  "color": "#FF6B6B"
}
```

### 👥 Usuários

#### GET /users
Lista usuários da empresa (apenas ADMIN/OWNER).

#### GET /users/me/profile
Busca o perfil do usuário logado.

#### POST /users
Cria um novo usuário (apenas ADMIN/OWNER).

#### PUT /users/:id/password
Altera senha de um usuário.

### 📊 Relatórios

#### GET /reports/dashboard
Dashboard com resumo financeiro.

**Query Parameters:**
- `startDate` (string): Data inicial
- `endDate` (string): Data final

**Response (200):**
```json
{
  "summary": {
    "totalRevenues": 15000.00,
    "totalExpenses": 8000.00,
    "netProfit": 7000.00,
    "profitMargin": 46.67,
    "revenuesCount": 25,
    "expensesCount": 18
  },
  "revenuesByCategory": [
    {
      "name": "Vendas",
      "color": "#10B981",
      "total": 12000.00,
      "count": 20
    }
  ],
  "expensesByCategory": [
    {
      "name": "Folha de Pagamento",
      "color": "#EF4444",
      "total": 5000.00,
      "count": 5,
      "percentage": 62.5
    }
  ],
  "monthlyData": [
    {
      "month": "2024-01",
      "revenues": 5000.00,
      "expenses": 3000.00,
      "balance": 2000.00
    }
  ],
  "recentTransactions": [
    {
      "id": "trans-id",
      "type": "REVENUE",
      "description": "Venda produto X",
      "amount": 1500.00,
      "date": "2024-01-15T00:00:00.000Z",
      "category": "Vendas",
      "categoryColor": "#10B981"
    }
  ]
}
```

#### GET /reports/monthly-summary
Resumo financeiro mensal específico.

**Query Parameters:**
- `month` (number): Mês (1-12)
- `year` (number): Ano

**Response (200):**
```json
{
  "month": 8,
  "year": 2025,
  "monthName": "agosto",
  "kpis": {
    "totalRevenues": 15000.00,
    "totalExpenses": 8000.00,
    "netProfit": 7000.00,
    "profitMargin": 46.67
  },
  "expensesByCategory": [
    {
      "name": "Folha de Pagamento",
      "color": "#EF4444",
      "total": 5000.00,
      "percentage": 62.5
    }
  ],
  "transactionCounts": {
    "revenues": 25,
    "expenses": 18
  }
}
```

#### GET /reports/cash-flow
Relatório de fluxo de caixa.

**Query Parameters:**
- `startDate` (string): Data inicial
- `endDate` (string): Data final
- `groupBy` (string): day, week, month, year

#### GET /reports/balance
Relatório de balanço anual.

**Query Parameters:**
- `year` (number): Ano (padrão: ano atual)

## Códigos de Status

- **200** - Sucesso
- **201** - Criado com sucesso
- **400** - Erro de validação
- **401** - Não autenticado
- **403** - Acesso negado
- **404** - Não encontrado
- **429** - Muitas tentativas (rate limit)
- **500** - Erro interno do servidor

## Exemplos com cURL

### Registro
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@empresa.com",
    "password": "senha123",
    "name": "Usuário Teste",
    "companyName": "Empresa Teste"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@empresa.com",
    "password": "senha123"
  }'
```

### Criar receita
```bash
curl -X POST http://localhost:3001/api/revenues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "description": "Venda de produto",
    "amount": 1500.00,
    "date": "2024-01-15",
    "categoryId": "CATEGORY_ID"
  }'
```

### Dashboard
```bash
curl -X GET "http://localhost:3001/api/reports/dashboard" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Resumo mensal
```bash
curl -X GET "http://localhost:3001/api/reports/monthly-summary?month=8&year=2025" \
  -H "Authorization: Bearer SEU_TOKEN"
```

## Exemplos com JavaScript/Fetch

### Login
```javascript
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@granaflux.com',
    password: 'admin123'
  })
});

const data = await response.json();
const token = data.token;
```

### Criar receita
```javascript
const response = await fetch('http://localhost:3001/api/revenues', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    description: 'Venda de produto',
    amount: 1500.00,
    date: '2024-01-15',
    categoryId: 'category-id'
  })
});

const revenue = await response.json();
```

### Buscar dashboard
```javascript
const response = await fetch('http://localhost:3001/api/reports/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const dashboard = await response.json();
```

### Resumo mensal para dashboard
```javascript
const response = await fetch('http://localhost:3001/api/reports/monthly-summary?month=8&year=2025', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const monthlyData = await response.json();
console.log('KPIs do mês:', monthlyData.kpis);
console.log('Despesas por categoria:', monthlyData.expensesByCategory);
```

## 🔧 Scripts Disponíveis

- `npm run setup` - Configuração inicial completa
- `npm run dev` - Inicia frontend (Vite)
- `npm run dev:server` - Inicia backend (nodemon)
- `npm run build` - Build do frontend
- `npm run build:server` - Build do backend
- `npm run db:generate` - Gera cliente Prisma
- `npm run db:push` - Aplica schema ao banco
- `npm run db:migrate` - Executa migrações
- `npm run db:studio` - Interface visual do banco

## 📁 Estrutura de Logs

Os logs são salvos em:
- `logs/combined.log` - Todos os logs
- `logs/error.log` - Apenas erros

Logs incluem:
- Requisições HTTP (Morgan)
- Operações de banco de dados
- Autenticação e autorização
- Erros de aplicação
- Ações de usuários (CRUD)