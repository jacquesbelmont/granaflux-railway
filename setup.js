import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m'
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
    log('🚀 Iniciando configuração completa do GranaFlux - Sistema Empresarial Completo...', 'info');

    if (!fs.existsSync('.env')) {
      log('Arquivo .env não encontrado. Copie o .env.example e configure suas variáveis.', 'error');
      process.exit(1);
    }

    log('📦 Instalando dependências...', 'info');
    execSync('npm install', { stdio: 'inherit' });
    log('Dependências instaladas!', 'success');

    log('🔧 Gerando cliente Prisma...', 'info');
    execSync('npx prisma generate', { stdio: 'inherit' });
    log('Cliente Prisma gerado!', 'success');

    log('🗄️ Aplicando schema do banco...', 'info');
    execSync('npx prisma db push', { stdio: 'inherit' });
    log('Schema aplicado!', 'success');

    log('🌱 Criando dados iniciais...', 'info');
    const prisma = new PrismaClient();

    try {
      const existingAdmin = await prisma.user.findFirst({
        where: { role: 'OWNER' }
      });

      if (!existingAdmin) {
        // Criar empresa
        const company = await prisma.company.create({
          data: {
            name: 'GranaFlux Empresa Demo',
            email: 'admin@granaflux.com',
            phone: '(11) 99999-9999',
            address: 'Rua Exemplo, 123',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567'
          }
        });

        // Criar usuários com diferentes níveis de acesso
        const hashedPassword = await bcrypt.hash('admin123', 12);
        const adminUser = await prisma.user.create({
          data: {
            email: 'admin@granaflux.com',
            password: hashedPassword,
            name: 'Administrador Geral',
            role: 'OWNER',
            companyId: company.id
          }
        });

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

        const adminPassword = await bcrypt.hash('gerente123', 12);
        const adminUser2 = await prisma.user.create({
          data: {
            email: 'admin2@granaflux.com',
            password: adminPassword,
            name: 'Administrador Secundário',
            role: 'ADMIN',
            companyId: company.id
          }
        });

        // Criar usuários adicionais com credenciais corretas
        const gerentePassword = await bcrypt.hash('gerente123', 12);
        const gerenteUser = await prisma.user.create({
          data: {
            email: 'gerente@granaflux.com',
            password: gerentePassword,
            name: 'Gerente Administrativo',
            role: 'ADMIN',
            companyId: company.id
          }
        });

        // Criar categorias completas
        await prisma.category.createMany({
          data: [
            // Receitas
            { name: 'Vendas de Produtos', type: 'REVENUE', companyId: company.id, color: '#10B981', description: 'Receitas de vendas de produtos' },
            { name: 'Prestação de Serviços', type: 'REVENUE', companyId: company.id, color: '#3B82F6', description: 'Receitas de serviços prestados' },
            { name: 'Comissões Recebidas', type: 'REVENUE', companyId: company.id, color: '#8B5CF6', description: 'Comissões e parcerias' },
            { name: 'Investimentos', type: 'REVENUE', companyId: company.id, color: '#06B6D4', description: 'Rendimentos de investimentos' },
            
            // Despesas
            { name: 'Folha de Pagamento', type: 'EXPENSE', companyId: company.id, color: '#EF4444', description: 'Salários e encargos trabalhistas' },
            { name: 'Fornecedores', type: 'EXPENSE', companyId: company.id, color: '#F59E0B', description: 'Pagamentos a fornecedores' },
            { name: 'Marketing e Publicidade', type: 'EXPENSE', companyId: company.id, color: '#EC4899', description: 'Gastos com marketing' },
            { name: 'Aluguel e Condomínio', type: 'EXPENSE', companyId: company.id, color: '#6B7280', description: 'Aluguel de imóveis' },
            { name: 'Impostos e Taxas', type: 'EXPENSE', companyId: company.id, color: '#DC2626', description: 'Impostos governamentais' },
            { name: 'Energia e Telecomunicações', type: 'EXPENSE', companyId: company.id, color: '#D97706', description: 'Contas de energia, internet, telefone' },
            { name: 'Material de Escritório', type: 'EXPENSE', companyId: company.id, color: '#7C3AED', description: 'Materiais e suprimentos' },
            { name: 'Manutenção e Reparos', type: 'EXPENSE', companyId: company.id, color: '#059669', description: 'Manutenção de equipamentos' },
            
            // Produtos
            { name: 'Eletrônicos', type: 'PRODUCT', companyId: company.id, color: '#3B82F6', description: 'Produtos eletrônicos' },
            { name: 'Roupas e Acessórios', type: 'PRODUCT', companyId: company.id, color: '#EC4899', description: 'Vestuário e acessórios' },
            { name: 'Casa e Decoração', type: 'PRODUCT', companyId: company.id, color: '#10B981', description: 'Produtos para casa' },
            { name: 'Esporte e Lazer', type: 'PRODUCT', companyId: company.id, color: '#F59E0B', description: 'Artigos esportivos' },
            { name: 'Livros e Educação', type: 'PRODUCT', companyId: company.id, color: '#8B5CF6', description: 'Material educativo' },
            { name: 'Serviços Diversos', type: 'PRODUCT', companyId: company.id, color: '#06B6D4', description: 'Serviços prestados' }
          ]
        });

        const categories = await prisma.category.findMany({
          where: { companyId: company.id }
        });

        const eletronicosCategory = categories.find(c => c.name === 'Eletrônicos');
        const roupasCategory = categories.find(c => c.name === 'Roupas e Acessórios');
        const casaCategory = categories.find(c => c.name === 'Casa e Decoração');

        // Criar produtos de exemplo
        if (eletronicosCategory && roupasCategory && casaCategory) {
          await prisma.product.createMany({
            data: [
              // Eletrônicos
              {
                name: 'Smartphone Samsung Galaxy',
                model: 'A54 5G 128GB',
                description: 'Smartphone com tela de 6.4", câmera tripla e 5G',
                price: 1299.99,
                stock: 25,
                minStock: 5,
                categoryId: eletronicosCategory.id,
                companyId: company.id
              },
              {
                name: 'Notebook Dell Inspiron',
                model: '15 3000 i5 8GB 256GB SSD',
                description: 'Notebook para uso profissional e pessoal',
                price: 2499.99,
                stock: 12,
                minStock: 3,
                categoryId: eletronicosCategory.id,
                companyId: company.id
              },
              {
                name: 'Fone de Ouvido Bluetooth',
                model: 'JBL Tune 510BT',
                description: 'Fone sem fio com cancelamento de ruído',
                price: 199.99,
                stock: 35,
                minStock: 10,
                categoryId: eletronicosCategory.id,
                companyId: company.id
              },
              {
                name: 'Smart TV LG',
                model: '55" 4K UHD',
                description: 'Smart TV 55 polegadas com resolução 4K',
                price: 2199.99,
                stock: 8,
                minStock: 2,
                categoryId: eletronicosCategory.id,
                companyId: company.id
              },
              
              // Roupas
              {
                name: 'Camiseta Básica',
                model: '100% Algodão',
                description: 'Camiseta básica disponível em várias cores',
                price: 29.99,
                stock: 100,
                minStock: 20,
                categoryId: roupasCategory.id,
                companyId: company.id
              },
              {
                name: 'Calça Jeans',
                model: 'Slim Fit',
                description: 'Calça jeans masculina corte slim',
                price: 89.99,
                stock: 45,
                minStock: 10,
                categoryId: roupasCategory.id,
                companyId: company.id
              },
              
              // Casa
              {
                name: 'Conjunto de Panelas',
                model: 'Antiaderente 5 Peças',
                description: 'Conjunto de panelas antiaderentes',
                price: 159.99,
                stock: 20,
                minStock: 5,
                categoryId: casaCategory.id,
                companyId: company.id
              }
            ]
          });
        }

        // Criar clientes de exemplo
        await prisma.client.createMany({
          data: [
            {
              name: 'João Silva Santos',
              email: 'joao.silva@email.com',
              phone: '(11) 99999-1234',
              cpf: '123.456.789-01',
              address: 'Rua das Flores, 123, Apto 45',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01234-567',
              notes: 'Cliente preferencial, sempre pontual nos pagamentos',
              companyId: company.id
            },
            {
              name: 'Maria Santos Oliveira',
              email: 'maria.santos@email.com',
              phone: '(11) 88888-5678',
              cpf: '987.654.321-09',
              address: 'Av. Paulista, 456, Sala 1201',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01310-100',
              notes: 'Empresária, compra em grandes quantidades',
              companyId: company.id
            },
            {
              name: 'Empresa ABC Comércio Ltda',
              email: 'contato@empresaabc.com',
              phone: '(11) 3333-4444',
              cnpj: '12.345.678/0001-90',
              address: 'Rua Comercial, 789',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '04567-890',
              notes: 'Cliente corporativo, pagamento via boleto',
              companyId: company.id
            },
            {
              name: 'Pedro Costa Lima',
              email: 'pedro.costa@email.com',
              phone: '(11) 77777-9999',
              cpf: '456.789.123-45',
              address: 'Rua das Palmeiras, 321',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '05678-901',
              companyId: company.id
            },
            {
              name: 'Ana Beatriz Ferreira',
              email: 'ana.ferreira@email.com',
              phone: '(11) 66666-7777',
              cpf: '789.123.456-78',
              address: 'Av. Brasil, 654',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '08901-234',
              notes: 'Cliente fidelizada há 3 anos',
              companyId: company.id
            }
          ]
        });

        // Criar algumas vendas de exemplo
        const clients = await prisma.client.findMany({ where: { companyId: company.id } });
        const products = await prisma.product.findMany({ where: { companyId: company.id } });

        if (clients.length > 0 && products.length > 0) {
          // Venda 1
          const sale1 = await prisma.sale.create({
            data: {
              clientId: clients[0].id,
              clientName: clients[0].name,
              total: 1499.98,
              discount: 50.00,
              finalTotal: 1449.98,
              paymentMethod: 'PIX',
              notes: 'Cliente pagou à vista, desconto aplicado',
              sellerId: cashierUser.id,
              companyId: company.id
            }
          });

          await prisma.saleItem.createMany({
            data: [
              {
                saleId: sale1.id,
                productId: products[0].id,
                itemName: products[0].name,
                description: products[0].description,
                quantity: 1,
                unitPrice: 1299.99,
                totalPrice: 1299.99
              },
              {
                saleId: sale1.id,
                productId: products[2].id,
                itemName: products[2].name,
                description: products[2].description,
                quantity: 1,
                unitPrice: 199.99,
                totalPrice: 199.99
              }
            ]
          });

          // Criar comissão para a venda
          await prisma.commission.create({
            data: {
              saleId: sale1.id,
              userId: cashierUser.id,
              percentage: 5.0,
              amount: 72.50, // 5% de 1449.98
              companyId: company.id
            }
          });

          // Venda 2
          const sale2 = await prisma.sale.create({
            data: {
              clientId: clients[1].id,
              clientName: clients[1].name,
              total: 89.99,
              discount: 0,
              finalTotal: 89.99,
              paymentMethod: 'CREDIT_CARD',
              sellerId: cashierUser.id,
              companyId: company.id
            }
          });

          await prisma.saleItem.create({
            data: {
              saleId: sale2.id,
              productId: products[5].id,
              itemName: products[5].name,
              description: products[5].description,
              quantity: 1,
              unitPrice: 89.99,
              totalPrice: 89.99
            }
          });

          await prisma.commission.create({
            data: {
              saleId: sale2.id,
              userId: cashierUser.id,
              percentage: 5.0,
              amount: 4.50,
              companyId: company.id
            }
          });
        }

        // Criar tasks de exemplo
        await prisma.task.createMany({
          data: [
            {
              title: 'Organizar estoque de produtos eletrônicos',
              description: 'Reorganizar produtos eletrônicos no depósito e verificar itens com estoque baixo',
              status: 'PENDING',
              priority: 'HIGH',
              assigneeId: commonUser.id,
              creatorId: adminUser.id,
              companyId: company.id,
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
            },
            {
              title: 'Atualizar preços da tabela de produtos',
              description: 'Revisar e atualizar preços conforme nova política comercial',
              status: 'IN_PROGRESS',
              priority: 'MEDIUM',
              assigneeId: commonUser.id,
              creatorId: adminUser.id,
              companyId: company.id,
              startedAt: new Date(),
              dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 dias
            },
            {
              title: 'Conferir fechamento do caixa',
              description: 'Fazer fechamento e conferência do caixa do dia anterior',
              status: 'PENDING',
              priority: 'URGENT',
              assigneeId: cashierUser.id,
              creatorId: adminUser.id,
              companyId: company.id,
              dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 dia
            },
            {
              title: 'Contatar clientes em atraso',
              description: 'Entrar em contato com clientes que possuem pagamentos pendentes',
              status: 'PENDING',
              priority: 'HIGH',
              assigneeId: adminUser2.id,
              creatorId: adminUser.id,
              companyId: company.id,
              dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 dias
            },
            {
              title: 'Preparar relatório mensal',
              description: 'Compilar dados de vendas e estoque para relatório gerencial',
              status: 'COMPLETED',
              priority: 'MEDIUM',
              assigneeId: adminUser2.id,
              creatorId: adminUser.id,
              companyId: company.id,
              startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
          ]
        });

        // Criar algumas receitas e despesas de exemplo
        const revenueCategories = categories.filter(c => c.type === 'REVENUE');
        const expenseCategories = categories.filter(c => c.type === 'EXPENSE');

        if (revenueCategories.length > 0) {
          await prisma.revenue.createMany({
            data: [
              {
                description: 'Venda de produtos eletrônicos',
                amount: 1449.98,
                date: new Date(),
                categoryId: revenueCategories[0].id,
                companyId: company.id,
                userId: cashierUser.id,
                notes: 'Venda registrada no sistema de PDV'
              },
              {
                description: 'Prestação de serviço de consultoria',
                amount: 800.00,
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                categoryId: revenueCategories[1].id,
                companyId: company.id,
                userId: adminUser2.id,
                notes: 'Consultoria em gestão empresarial'
              },
              {
                description: 'Venda de roupas e acessórios',
                amount: 89.99,
                date: new Date(),
                categoryId: revenueCategories[0].id,
                companyId: company.id,
                userId: cashierUser.id
              }
            ]
          });
        }

        if (expenseCategories.length > 0) {
          await prisma.expense.createMany({
            data: [
              {
                description: 'Pagamento de salários - mês atual',
                amount: 8500.00,
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                categoryId: expenseCategories[0].id,
                companyId: company.id,
                userId: adminUser.id,
                notes: 'Folha de pagamento completa'
              },
              {
                description: 'Compra de produtos para revenda',
                amount: 3200.00,
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                categoryId: expenseCategories[1].id,
                companyId: company.id,
                userId: adminUser2.id,
                notes: 'Reposição de estoque'
              },
              {
                description: 'Campanha de marketing digital',
                amount: 450.00,
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                categoryId: expenseCategories[2].id,
                companyId: company.id,
                userId: adminUser2.id,
                notes: 'Anúncios no Google e Facebook'
              },
              {
                description: 'Aluguel do escritório',
                amount: 2800.00,
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                categoryId: expenseCategories[3].id,
                companyId: company.id,
                userId: adminUser.id
              }
            ]
          });
        }

        log(`✅ Sistema completo configurado com sucesso!`, 'success');
        log(`👑 PROPRIETÁRIO: ${adminUser.email} / admin123`, 'success');
        log(`👨‍💼 GERENTE: ${adminUser2.email} / gerente123`, 'success');
        log(`🏪 CAIXA: ${cashierUser.email} / caixa123`, 'success');
        log(`👷 FUNCIONÁRIO: ${commonUser.email} / func123`, 'success');
        log(`🏢 Empresa: ${company.name}`, 'success');
        log(`📦 ${products.length} produtos criados`, 'success');
        log(`👥 ${clients.length} clientes criados`, 'success');
        log(`💰 2 vendas de exemplo criadas`, 'success');
        log(`📋 5 tasks de exemplo criadas`, 'success');
        log(`💳 Comissões configuradas automaticamente`, 'success');
      } else {
        log('Dados iniciais já existem no banco de dados.', 'info');
      }

      await prisma.$disconnect();
      
      console.log('\n' + '='.repeat(80));
      console.log('🎉 GranaFlux - Sistema Empresarial Completo configurado!');
      console.log('='.repeat(80));
      console.log('📋 Próximos passos:');
      console.log('   1. Execute: npm run dev:server (para iniciar o backend)');
      console.log('   2. Execute: npm run dev (para iniciar o frontend)');
      console.log('   3. Acesse: http://localhost:5173');
      console.log('\n🔐 Credenciais de acesso:');
      console.log('   👑 PROPRIETÁRIO (acesso total):');
      console.log('      Email: admin@granaflux.com');
      console.log('      Senha: admin123');
      console.log('   👨‍💼 GERENTE (gestão administrativa):');
      console.log('      Email: gerente@granaflux.com');
      console.log('      Senha: gerente123');
      console.log('   🏪 OPERADOR DE CAIXA (vendas/estoque):');
      console.log('      Email: caixa@granaflux.com');
      console.log('      Senha: caixa123');
      console.log('   👷 FUNCIONÁRIO (tasks/consultas):');
      console.log('      Email: funcionario@granaflux.com');
      console.log('      Senha: func123');
      console.log('\n🎯 Funcionalidades implementadas:');
      console.log('   ✅ Gestão Financeira (receitas/despesas)');
      console.log('   ✅ Gestão de Estoque (produtos/movimentações)');
      console.log('   ✅ Gestão de Vendas (PDV/comissões)');
      console.log('   ✅ CRM (clientes/histórico)');
      console.log('   ✅ Gestão de Tasks (funcionários/produtividade)');
      console.log('   ✅ Sistema de Comissões (automático)');
      console.log('   ✅ Sistema de Permissões (4 níveis)');
      console.log('   ✅ Dashboard Completo (KPIs/relatórios)');
      console.log('='.repeat(80) + '\n');

    } catch (dbError) {
      log('Erro ao criar dados iniciais no banco de dados', 'error');
      console.error(dbError);
      throw dbError;
    }

  } catch (error) {
    log(`Erro durante a configuração: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

main();