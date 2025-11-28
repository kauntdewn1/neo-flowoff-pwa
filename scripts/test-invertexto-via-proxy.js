/**
 * Teste de Tokens Invertexto via Proxy Netlify
 * Testa qual token funciona através da função Netlify já configurada
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar .env
dotenv.config({ path: join(__dirname, '..', '.env') });

const tokens = [
  '21976|hZQXuMyP6eW0sydqMCxNC9JLJKSHbsOs',
  '23236|oOyXKxz1LopCdmfMJJDt1EWa3Kz689Zm'
];

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testTokenViaProxy(token, index) {
  log(`\n🧪 Testando Token ${index + 1} via Proxy...`, 'cyan');
  log(`   Token: ${token.substring(0, 20)}...`, 'blue');
  
  try {
    // Testar via função Netlify local (se disponível) ou via servidor local
    const proxyUrl = process.env.TEST_PROXY_URL || 'http://localhost:3000/api/invertexto';
    
    // Temporariamente setar o token no env para a função usar
    const originalToken = process.env.INVERTEXTO_API_TOKEN;
    process.env.INVERTEXTO_API_TOKEN = token;
    
    const response = await axios.post(proxyUrl, {
      endpoint: 'cep',
      params: {
        cep: '01310100'
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    // Restaurar token original
    process.env.INVERTEXTO_API_TOKEN = originalToken;

    if (response.data?.success && response.data?.data) {
      log(`   ✅ Token ${index + 1} FUNCIONA!`, 'green');
      log(`   📊 Resposta:`, 'yellow');
      console.log(JSON.stringify(response.data.data, null, 2));
      return { token, valid: true, data: response.data.data };
    } else {
      log(`   ❌ Token ${index + 1} - Resposta inválida`, 'red');
      log(`   📄 Erro: ${response.data?.error || JSON.stringify(response.data)}`, 'yellow');
      return { token, valid: false, error: response.data?.error || 'Resposta inválida' };
    }
  } catch (error) {
    // Restaurar token original
    process.env.INVERTEXTO_API_TOKEN = originalToken || process.env.INVERTEXTO_API_TOKEN;
    
    if (error.code === 'ECONNREFUSED') {
      log(`   ⚠️  Servidor local não está rodando`, 'yellow');
      log(`   💡 Inicie o servidor: npm run dev`, 'yellow');
      return { token, valid: false, error: 'Servidor não disponível' };
    } else if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401 || status === 403) {
        log(`   ❌ Token ${index + 1} INVÁLIDO (${status})`, 'red');
        log(`   📄 Erro: ${data?.error || data?.message || 'Token inválido'}`, 'yellow');
      } else {
        log(`   ❌ Token ${index + 1} - Erro ${status}`, 'red');
        log(`   📄 Erro: ${JSON.stringify(data)}`, 'yellow');
      }
    } else {
      log(`   ❌ Token ${index + 1} - Erro: ${error.message}`, 'red');
    }
    
    return { token, valid: false, error: error.message };
  }
}

async function testAllTokens() {
  log('\n🔍 TESTE DE TOKENS INVERTEXTO (via Proxy)\n', 'cyan');
  log('=' .repeat(50), 'cyan');
  log('⚠️  Certifique-se de que o servidor está rodando (npm run dev)', 'yellow');
  log('=' .repeat(50), 'cyan');
  
  const results = [];
  
  for (let i = 0; i < tokens.length; i++) {
    const result = await testTokenViaProxy(tokens[i], i);
    results.push(result);
    
    // Aguardar entre testes
    if (i < tokens.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Resumo
  log('\n📊 RESUMO DOS TESTES\n', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  const validTokens = results.filter(r => r.valid);
  
  if (validTokens.length === 0) {
    log('\n❌ Nenhum token válido encontrado!', 'red');
    log('\n💡 Possíveis causas:', 'yellow');
    log('   1. Servidor não está rodando (npm run dev)', 'yellow');
    log('   2. Tokens estão incorretos', 'yellow');
    log('   3. APIs não estão habilitadas no dashboard Invertexto', 'yellow');
  } else if (validTokens.length === 1) {
    log(`\n✅ Token válido encontrado:`, 'green');
    log(`   Token: ${validTokens[0].token}`, 'green');
    log(`\n📝 Use este token no .env:`, 'cyan');
    log(`   INVERTEXTO_API_TOKEN=${validTokens[0].token}`, 'blue');
  } else {
    log(`\n✅ ${validTokens.length} tokens válidos encontrados!`, 'green');
    log(`\n💡 Recomendação: Use o primeiro token válido`, 'yellow');
    log(`   INVERTEXTO_API_TOKEN=${validTokens[0].token}`, 'blue');
  }
  
  return results;
}

// Executar
testAllTokens()
  .then(results => {
    const hasValid = results.some(r => r.valid);
    process.exit(hasValid ? 0 : 1);
  })
  .catch(error => {
    log(`\n❌ ERRO FATAL: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });

