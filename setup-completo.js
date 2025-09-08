import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Cores para logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    success: `${colors.green}[SUCESSO]${colors.reset}`,
    error: `${colors.red}[ERRO]${colors.reset}`,
    info: `${colors.blue}[INFO]${colors.reset}`,
    warning: `${colors.yellow}[AVISO]${colors.reset}`
  };
  
  console.log(`${prefix[type]} ${timestamp} - ${message}`);
}

async function main() {
  try {
    log('🚀 Iniciando configuração completa do GranaFlux...', 'info');

    // 1. Verificar se o arquivo .env existe
    if (!fs.existsSync('.env')) {
      log('Arquivo .env não encontrado. Copie o .env.example e configure suas variáveis.', 'error');
      process.exit(1);
    }

    // 2. Instalar dependências
    log('📦 Instalando dependências...', 'info');
    try {
      execSync('npm install', { stdio: 'inherit' });
      log('Dependências instaladas com sucesso!', 'success');
    } catch (error) {
      log('Erro ao instalar dependências', 'error');
      throw error;
    }

    // 3. Gerar cliente Prisma
    log('🔧 Gerando cliente Prisma...', 'info');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      log('Cliente Prisma gerado com sucesso!', 'success');
    } catch (error) {
      log('Erro ao gerar cliente Prisma', 'error');
      throw error;
    }

    // 4. Aplicar migrações
    log('🗄️ Aplicando schema do banco de dados...', 'info');
    try {
      execSync('npx prisma db push', { stdio: 'inherit' });
      log('Schema aplicado com sucesso!', 'success');
    } catch (error) {
      log('Erro ao aplicar schema. Verifique a conexão com o banco de dados.', 'error');
      throw error;
    }

    // 5. Conectar ao banco e criar dados iniciais
    log('🌱 Criando dados iniciais...', 'info');
    const prisma = new PrismaClient();

    try {
      // Verificar se já existe um usuário admin
      const existingAdmin = await prisma.user.findFirst({
        where: { role: 'OWNER' }
      });

      if (!existingAdmin) {
        // Criar empresa padrão
        const company = await prisma.company.create({
          data: {
            name: 'GranaFlux Demo',
            email: 'admin@granaflux.com'
          }
        });

        // Criar usuário admin (OWNER)
        const hashedPassword = await bcrypt.hash('admin123', 12);
        const adminUser = await prisma.user.create({
          data: {
            email: 'admin@granaflux.com',
            password: hashedPassword,
            name: 'Administrador',
            role: 'OWNER',
            companyId: company.id
          }
        });

        // Criar usuário caixa
        const cashierPassword = await bcrypt.hash('caixa123', 12);
        const cashierUser = await prisma.user.create({
          data: {
            email: 'caixa@granaflux.com',
            password: cashierPassword,
            name: 'Operador de Caixa',
            role: 'CASHIER',
            companyId: company.id
          }
        });

        // Criar funcionário comum
        const userPassword = await bcrypt.hash('func123', 12);
        const commonUser = await prisma.user.create({
          data: {
            email: 'funcionario@granaflux.com',
            password: userPassword,
            name: 'Funcionário Comum',
            role: 'USER',
            companyId: company.id
          }
        });

        // Criar categorias financeiras
        await prisma.category.createMany({
          data: [
            // Categorias de receita
            { name: 'Vendas', type: 'REVENUE', companyId: company.id, color: '#10B981', description: 'Receitas de vendas de produtos/serviços' },
            { name: 'Serviços', type: 'REVENUE', companyId: company.id, color: '#3B82F6', description: 'Receitas de prestação de serviços' },
            { name: 'Investimentos', type: 'REVENUE', companyId: company.id, color: '#8B5CF6', description: 'Receitas de investimentos e aplicações' },
            
            // Categorias de despesa
            { name: 'Folha de Pagamento', type: 'EXPENSE', companyId: company.id, color: '#EF4444', description: 'Salários e encargos trabalhistas' },
            { name: 'Fornecedores', type: 'EXPENSE', companyId: company.id, color: '#F59E0B', description: 'Pagamentos a fornecedores' },
            { name: 'Marketing', type: 'EXPENSE', companyId: company.id, color: '#EC4899', description: 'Gastos com marketing e publicidade' },
            { name: 'Aluguel', type: 'EXPENSE', companyId: company.id, color: '#6B7280', description: 'Aluguel de imóveis e equipamentos' },
            { name: 'Impostos', type: 'EXPENSE', companyId: company.id, color: '#DC2626', description: 'Impostos e taxas governamentais' },
            
            // Categorias de produtos
            { name: 'Eletrônicos', type: 'PRODUCT', companyId: company.id, color: '#3B82F6', description: 'Produtos eletrônicos' },
            { name: 'Roupas', type: 'PRODUCT', companyId: company.id, color: '#EC4899', description: 'Vestuário e acessórios' },
            { name: 'Casa e Jardim', type: 'PRODUCT', companyId: company.id, color: '#10B981', description: 'Produtos para casa e jardim' },
            { name: 'Serviços', type: 'PRODUCT', companyId: company.id, color: '#8B5CF6', description: 'Serviços prestados' }
          ]
        });

        // Buscar categorias criadas
        const categories = await prisma.category.findMany({
          where: { companyId: company.id }
        });

        const productCategory = categories.find(c => c.name === 'Eletrônicos');

        // Criar produtos de exemplo
        if (productCategory) {
          await prisma.product.createMany({
            data: [
              {
                name: 'Smartphone Samsung Galaxy',
                model: 'A54 5G',
                description: 'Smartphone com 128GB de armazenamento',
                price: 1299.99,
                stock: 15,
                minStock: 5,
                categoryId: productCategory.id,
                companyId: company.id
              },
              {
                name: 'Notebook Dell',
                model: 'Inspiron 15 3000',
                description: 'Notebook para uso profissional',
                price: 2499.99,
                stock: 8,
                minStock: 2,
                categoryId: productCategory.id,
                companyId: company.id
              },
              {
                name: 'Fone de Ouvido Bluetooth',
                model: 'JBL Tune 510BT',
                description: 'Fone sem fio com cancelamento de ruído',
                price: 199.99,
                stock: 25,
                minStock: 10,
                categoryId: productCategory.id,
                companyId: company.id
              }
            ]
          });
        }

        // Criar clientes de exemplo
        await prisma.client.createMany({
          data: [
            {
              name: 'João Silva',
              email: 'joao.silva@email.com',
              phone: '(11) 99999-1234',
              cpf: '123.456.789-01',
              address: 'Rua das Flores, 123',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01234-567',
              companyId: company.id
            },
            {
              name: 'Maria Santos',
              email: 'maria.santos@email.com',
              phone: '(11) 88888-5678',
              cpf: '987.654.321-09',
              address: 'Av. Paulista, 456',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01310-100',
              companyId: company.id
            },
            {
              name: 'Empresa ABC Ltda',
              email: 'contato@empresaabc.com',
              phone: '(11) 3333-4444',
              cnpj: '12.345.678/0001-90',
              address: 'Rua Comercial, 789',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '04567-890',
              companyId: company.id
            }
          ]
        });

        // Criar tasks de exemplo
        await prisma.task.createMany({
          data: [
            {
              title: 'Organizar estoque',
              description: 'Reorganizar produtos no depósito',
              status: 'PENDING',
              priority: 'HIGH',
              assigneeId: commonUser.id,
              creatorId: adminUser.id,
              companyId: company.id,
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
            },
            {
              title: 'Atualizar preços',
              description: 'Revisar e atualizar preços dos produtos',
              status: 'IN_PROGRESS',
              priority: 'MEDIUM',
              assigneeId: commonUser.id,
              creatorId: adminUser.id,
              companyId: company.id,
              startedAt: new Date(),
              dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 dias
            },
            {
              title: 'Conferir caixa',
              description: 'Fazer fechamento do caixa do dia',
              status: 'PENDING',
              priority: 'URGENT',
              assigneeId: cashierUser.id,
              creatorId: adminUser.id,
              companyId: company.id,
              dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 dia
            }
          ]
        });

        log(`✅ Dados iniciais criados com sucesso!`, 'success');
        log(`👤 Usuário OWNER: ${adminUser.email} / senha: admin123`, 'success');
        log(`🏪 Usuário CAIXA: ${cashierUser.email} / senha: caixa123`, 'success');
        log(`👷 Usuário FUNCIONÁRIO: ${commonUser.email} / senha: func123`, 'success');
        log(`🏢 Empresa: ${company.name}`, 'success');
        log(`📦 3 produtos de exemplo criados`, 'success');
        log(`👥 3 clientes de exemplo criados`, 'success');
        log(`📋 3 tasks de exemplo criadas`, 'success');
      } else {
        log('Dados iniciais já existem no banco de dados.', 'info');
      }

      await prisma.$disconnect();
      log('✅ Configuração concluída com sucesso!', 'success');
      
      console.log('\n' + '='.repeat(80));
      console.log('🎉 GranaFlux - Sistema Completo configurado e pronto para uso!');
      console.log('='.repeat(80));
      console.log('📋 Próximos passos:');
      console.log('   1. Execute: npm run dev:server (para iniciar o backend)');
      console.log('   2. Execute: npm run dev (para iniciar o frontend)');
      console.log('   3. Acesse: http://localhost:5173');
      console.log('\n🔐 Credenciais de acesso:');
      console.log('   👑 ADMINISTRADOR:');
      console.log('      Email: admin@granaflux.com');
      console.log('      Senha: admin123');
      console.log('   🏪 OPERADOR DE CAIXA:');
      console.log('      Email: caixa@granaflux.com');
      console.log('      Senha: caixa123');
      console.log('   👷 FUNCIONÁRIO:');
      console.log('      Email: funcionario@granaflux.com');
      console.log('      Senha: func123');
      console.log('\n🎯 Funcionalidades implementadas:');
      console.log('   ✅ Gestão Financeira (receitas/despesas)');
      console.log('   ✅ Gestão de Estoque (produtos/movimentações)');
      console.log('   ✅ Gestão de Vendas (PDV/comissões)');
      console.log('   ✅ CRM (clientes/histórico)');
      console.log('   ✅ Gestão de Tasks (funcionários/produtividade)');
      console.log('   ✅ Sistema de Permissões (OWNER/ADMIN/CASHIER/USER)');
      console.log('='.repeat(80) + '\n');

    } catch (dbError) {
      log('Erro ao criar dados iniciais no banco de dados', 'error');
      throw dbError;
    }

  } catch (error) {
    log(`Erro durante a configuração: ${error.message}`, 'error');
    process.exit(1);
  }
}

main();