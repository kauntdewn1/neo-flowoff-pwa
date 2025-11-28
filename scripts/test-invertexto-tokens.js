/**
 * Script de Teste - Validar Tokens Invertexto
 * Testa qual token está funcionando
 */

import axios from 'axios';

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

async function testToken(token, index) {
  log(`\n🧪 Testando Token ${index + 1}...`, 'cyan');
  log(`   Token: ${token.substring(0, 20)}...`, 'blue');
  
  try {
    // Testar com endpoint simples (CEP)
    // API Invertexto: https://invertexto.com/api/{endpoint} com POST
    const baseUrl = 'https://invertexto.com/api';
    const url = `${baseUrl}/cep`;
    
    const requestParams = {
      token: token,
      cep: '01310100' // CEP válido para teste
    };
    
    const response = await axios.post(url, requestParams, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NEO.FLOWOFF-PWA/1.0',
        'Accept': 'application/json'
      },
      timeout: 10000,
      validateStatus: (status) => status < 500 // Aceitar 4xx como válidos
    });

    // Verificar resposta
    if (response.status === 200 && response.data) {
      // Verificar se é uma resposta válida da API (não HTML de erro)
      if (typeof response.data === 'object' && !response.data.toString().includes('<!DOCTYPE')) {
        log(`   ✅ Token ${index + 1} FUNCIONA!`, 'green');
        log(`   📊 Status: ${response.status}`, 'yellow');
        log(`   📊 Resposta:`, 'yellow');
        console.log(JSON.stringify(response.data, null, 2));
        return { token, valid: true, data: response.data };
      } else {
        log(`   ❌ Token ${index + 1} - Resposta HTML (erro)`, 'red');
        return { token, valid: false, error: 'Resposta HTML inválida' };
      }
    } else if (response.status < 400) {
      log(`   ⚠️  Token ${index + 1} - Status ${response.status}`, 'yellow');
      log(`   📊 Resposta:`, 'yellow');
      console.log(JSON.stringify(response.data, null, 2));
      return { token, valid: response.status === 200, data: response.data };
    } else {
      log(`   ❌ Token ${index + 1} - Status ${response.status}`, 'red');
      log(`   📄 Resposta:`, 'yellow');
      console.log(JSON.stringify(response.data, null, 2));
      return { token, valid: false, error: `Status ${response.status}` };
    }
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401 || status === 403) {
        log(`   ❌ Token ${index + 1} INVÁLIDO (${status})`, 'red');
        log(`   📄 Erro: ${data?.message || data?.error || 'Token inválido'}`, 'yellow');
      } else if (status === 429) {
        log(`   ⚠️  Token ${index + 1} - Rate limit excedido (${status})`, 'yellow');
        log(`   ℹ️  Token pode estar válido, mas com limite atingido`, 'yellow');
      } else {
        log(`   ❌ Token ${index + 1} - Erro ${status}`, 'red');
        log(`   📄 Erro: ${JSON.stringify(data)}`, 'yellow');
      }
    } else if (error.code === 'ECONNABORTED') {
      log(`   ⏱️  Token ${index + 1} - Timeout`, 'yellow');
    } else {
      log(`   ❌ Token ${index + 1} - Erro: ${error.message}`, 'red');
    }
    
    return { token, valid: false, error: error.message };
  }
}

async function testAllTokens() {
  log('\n🔍 TESTE DE TOKENS INVERTEXTO\n', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  const results = [];
  
  for (let i = 0; i < tokens.length; i++) {
    const result = await testToken(tokens[i], i);
    results.push(result);
    
    // Aguardar um pouco entre testes para evitar rate limit
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
    log('\n💡 Verifique:', 'yellow');
    log('   1. Se os tokens estão corretos', 'yellow');
    log('   2. Se as APIs estão habilitadas no dashboard Invertexto', 'yellow');
    log('   3. Se não há rate limit ativo', 'yellow');
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

