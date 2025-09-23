#!/usr/bin/env node

// test-invertexto.js - Script de teste completo para API Invertexto
const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';
const API_ENDPOINT = '/api/invertexto';

// Cores para console
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

// Função para log colorido
function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para fazer requisição
async function makeRequest(endpoint, params = {}) {
  try {
    const startTime = Date.now();
    
    const response = await axios.post(`${BASE_URL}${API_ENDPOINT}`, {
      endpoint,
      params
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NEO.FLOWOFF-Test/1.0'
      },
      timeout: 15000
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      success: true,
      data: response.data,
      responseTime,
      status: response.status
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// Testes para cada endpoint
const tests = [
  {
    name: '📊 Barcode - Código de Barras',
    endpoint: 'barcode',
    params: {
      text: '123456789012',
      format: 'png',
      width: 300,
      height: 100
    },
    expected: 'qr_code_url'
  },
  {
    name: '📱 QR Code - QR Code',
    endpoint: 'qrcode',
    params: {
      text: 'https://neo.flowoff.com',
      size: 200,
      format: 'png'
    },
    expected: 'qr_code_url'
  },
  {
    name: '🌍 GeoIP - Localização por IP',
    endpoint: 'geoip',
    params: {
      ip: '8.8.8.8'
    },
    expected: 'country'
  },
  {
    name: '💱 Currency - Conversão de Moedas',
    endpoint: 'currency',
    params: {
      from: 'USD',
      to: 'BRL',
      amount: 100
    },
    expected: 'converted_amount'
  },
  {
    name: '🎭 Faker - Dados Falsos',
    endpoint: 'faker',
    params: {
      locale: 'pt_BR',
      type: 'name'
    },
    expected: 'data'
  },
  {
    name: '✅ Validator - Validação CPF',
    endpoint: 'validator',
    params: {
      type: 'cpf',
      value: '12345678901'
    },
    expected: 'valid'
  },
  {
    name: '✅ Validator - Validação CNPJ',
    endpoint: 'validator',
    params: {
      type: 'cnpj',
      value: '12345678000195'
    },
    expected: 'valid'
  },
  {
    name: '📮 CEP - Consulta de CEP',
    endpoint: 'cep',
    params: {
      cep: '74000000'
    },
    expected: 'logradouro'
  },
  {
    name: '🏢 CNPJ - Consulta de CNPJ',
    endpoint: 'cnpj',
    params: {
      cnpj: '12345678000195'
    },
    expected: 'nome'
  },
  {
    name: '🔢 Number-to-words - Números por Extenso',
    endpoint: 'number-to-words',
    params: {
      number: 1234,
      locale: 'pt_BR'
    },
    expected: 'text'
  },
  {
    name: '📧 Email-validator - Validação de Email',
    endpoint: 'email-validator',
    params: {
      email: 'usuario@exemplo.com'
    },
    expected: 'valid'
  }
];

// Função para testar health check
async function testHealthCheck() {
  log('cyan', '\n🔍 Testando Health Check...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    
    if (response.data.status === 'ok') {
      log('green', '✅ Health Check: OK');
      log('blue', `📊 APIs disponíveis:`, JSON.stringify(response.data.apis, null, 2));
      return true;
    } else {
      log('red', '❌ Health Check: FALHOU');
      return false;
    }
  } catch (error) {
    log('red', `❌ Health Check: ERRO - ${error.message}`);
    return false;
  }
}

// Função para testar token
async function testToken() {
  log('cyan', '\n🔑 Verificando configuração do token...');
  
  const token = process.env.INVERTEXTO_API_TOKEN;
  
  if (!token || token === 'seu_token_real_aqui') {
    log('red', '❌ Token não configurado!');
    log('yellow', '💡 Configure INVERTEXTO_API_TOKEN no arquivo .env');
    log('yellow', '💡 Obtenha seu token em: https://invertexto.com/api');
    return false;
  } else {
    log('green', '✅ Token configurado');
    log('blue', `🔐 Token: ${token.substring(0, 8)}...`);
    return true;
  }
}

// Função para executar todos os testes
async function runAllTests() {
  log('bright', '\n🚀 INICIANDO TESTES DA API INVERTEXTO');
  log('bright', '=' .repeat(50));
  
  // Verificar configurações
  const healthOk = await testHealthCheck();
  const tokenOk = await testToken();
  
  if (!healthOk || !tokenOk) {
    log('red', '\n❌ Configurações inválidas. Abortando testes.');
    process.exit(1);
  }
  
  let totalTests = tests.length;
  let passedTests = 0;
  let failedTests = 0;
  const results = [];
  
  log('cyan', `\n📋 Executando ${totalTests} testes...\n`);
  
  // Executar cada teste
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    log('blue', `[${i + 1}/${totalTests}] ${test.name}`);
    
    const result = await makeRequest(test.endpoint, test.params);
    
    if (result.success) {
      log('green', `  ✅ SUCESSO (${result.responseTime}ms)`);
      log('blue', `  📊 Status: ${result.status}`);
      
      // Verificar se a resposta contém o campo esperado
      if (result.data.data && result.data.data[test.expected] !== undefined) {
        log('green', `  🎯 Campo esperado encontrado: ${test.expected}`);
      } else {
        log('yellow', `  ⚠️ Campo esperado não encontrado: ${test.expected}`);
      }
      
      passedTests++;
    } else {
      log('red', `  ❌ FALHOU`);
      log('red', `  📊 Status: ${result.status}`);
      log('red', `  🔍 Erro: ${JSON.stringify(result.error)}`);
      failedTests++;
    }
    
    results.push({
      test: test.name,
      success: result.success,
      responseTime: result.responseTime || 0,
      status: result.status,
      error: result.error
    });
    
    // Pequena pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Relatório final
  log('bright', '\n📊 RELATÓRIO FINAL');
  log('bright', '=' .repeat(50));
  
  log('green', `✅ Testes passaram: ${passedTests}/${totalTests}`);
  log('red', `❌ Testes falharam: ${failedTests}/${totalTests}`);
  
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  log('cyan', `📈 Taxa de sucesso: ${successRate}%`);
  
  // Tempo médio de resposta
  const avgResponseTime = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.responseTime, 0) / passedTests;
  
  if (passedTests > 0) {
    log('blue', `⏱️ Tempo médio de resposta: ${avgResponseTime.toFixed(0)}ms`);
  }
  
  // Detalhes dos testes que falharam
  if (failedTests > 0) {
    log('red', '\n❌ TESTES QUE FALHARAM:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        log('red', `  • ${r.test}`);
        log('red', `    Status: ${r.status}`);
        log('red', `    Erro: ${JSON.stringify(r.error)}`);
      });
  }
  
  // Recomendações
  log('cyan', '\n💡 RECOMENDAÇÕES:');
  
  if (successRate >= 90) {
    log('green', '  🎉 Excelente! A integração está funcionando perfeitamente.');
  } else if (successRate >= 70) {
    log('yellow', '  ⚠️ Bom, mas alguns testes falharam. Verifique os logs.');
  } else {
    log('red', '  🚨 Muitos testes falharam. Verifique a configuração.');
  }
  
  log('blue', '  📖 Consulte a documentação: INVERTEXTO_API_EXAMPLES.md');
  log('blue', '  🔧 Configure seu token em: .env');
  log('blue', '  🌐 Obtenha seu token em: https://invertexto.com/api');
  
  // Exit code baseado no sucesso
  process.exit(failedTests > 0 ? 1 : 0);
}

// Função para teste rápido
async function quickTest() {
  log('cyan', '\n⚡ TESTE RÁPIDO - CEP');
  
  const result = await makeRequest('cep', { cep: '74000000' });
  
  if (result.success) {
    log('green', '✅ Teste rápido: SUCESSO');
    log('blue', `📊 Dados: ${JSON.stringify(result.data.data, null, 2)}`);
  } else {
    log('red', '❌ Teste rápido: FALHOU');
    log('red', `🔍 Erro: ${JSON.stringify(result.error)}`);
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--quick') || args.includes('-q')) {
    await quickTest();
  } else if (args.includes('--help') || args.includes('-h')) {
    log('cyan', '\n📖 USO DO SCRIPT DE TESTE');
    log('blue', '  node test-invertexto.js           # Executar todos os testes');
    log('blue', '  node test-invertexto.js --quick   # Teste rápido (CEP)');
    log('blue', '  node test-invertexto.js --help    # Mostrar esta ajuda');
    log('cyan', '\n🔧 PRÉ-REQUISITOS:');
    log('yellow', '  1. Servidor rodando (npm run dev)');
    log('yellow', '  2. Token configurado no .env');
    log('yellow', '  3. Dependências instaladas (npm install)');
  } else {
    await runAllTests();
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  main().catch(error => {
    log('red', `\n💥 ERRO FATAL: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  makeRequest,
  runAllTests,
  quickTest,
  tests
};
