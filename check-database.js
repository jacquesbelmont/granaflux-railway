import { PrismaClient } from '@prisma/client';
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

async function checkDatabase() {
  log('🔍 Verificando conexão com o banco de dados...', 'info');
  
  const prisma = new PrismaClient();
  
  try {
    // Testar conexão
    await prisma.$connect();
    log('✅ Conexão com banco estabelecida com sucesso!', 'success');
    
    // Verificar se as tabelas existem
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    log(`📊 Encontradas ${tables.length} tabelas no banco`, 'info');
    
    // Verificar usuários
    try {
      const userCount = await prisma.user.count();
      log(`👥 Total de usuários no banco: ${userCount}`, 'info');
      
      if (userCount === 0) {
        log('⚠️ Nenhum usuário encontrado. Execute npm run setup para criar dados iniciais.', 'warning');
      } else {
        const users = await prisma.user.findMany({
          select: {
            email: true,
            name: true,
            role: true
          }
        });
        
        log('👤 Usuários encontrados:', 'info');
        users.forEach(user => {
          console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
        });
      }
    } catch (error) {
      log('❌ Erro ao verificar usuários. Tabelas podem não existir.', 'error');
      log('💡 Execute: npx prisma db push', 'info');
    }
    
    // Verificar empresas
    try {
      const companyCount = await prisma.company.count();
      log(`🏢 Total de empresas no banco: ${companyCount}`, 'info');
    } catch (error) {
      log('❌ Erro ao verificar empresas.', 'error');
    }
    
  } catch (error) {
    log('❌ Erro de conexão com o banco de dados:', 'error');
    console.error(error);
    
    log('🔧 Possíveis soluções:', 'info');
    console.log('   1. Verifique se o PostgreSQL está rodando:');
    console.log('      net start postgresql-x64-16');
    console.log('   2. Verifique as credenciais no arquivo .env');
    console.log('   3. Teste a conexão manualmente:');
    console.log('      psql -U granaflux_admin -h localhost -d granaflux_sistema');
    
  } finally {
    await prisma.$disconnect();
  }
}

async function testCredentials() {
  log('🔐 Testando credenciais de usuários...', 'info');
  
  const prisma = new PrismaClient();
  
  try {
    const testUsers = [
      'admin@granaflux.com',
      'gerente@granaflux.com', 
      'caixa@granaflux.com',
      'funcionario@granaflux.com'
    ];
    
    for (const email of testUsers) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { email: true, name: true, role: true }
      });
      
      if (user) {
        log(`✅ ${email} - ${user.name} (${user.role})`, 'success');
      } else {
        log(`❌ ${email} - Usuário não encontrado`, 'error');
      }
    }
    
  } catch (error) {
    log('❌ Erro ao testar credenciais:', 'error');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🔍 DIAGNÓSTICO DO BANCO DE DADOS - GRANAFLUX');
  console.log('='.repeat(60));
  
  await checkDatabase();
  console.log('');
  await testCredentials();
  
  console.log('');
  console.log('='.repeat(60));
  console.log('✅ Diagnóstico concluído!');
  console.log('='.repeat(60));
}

main().catch(console.error);