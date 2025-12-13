#!/usr/bin/env node
/**
 * 🧪 Teste da API Invertexto
 * 
 * Testa todos os endpoints da API Invertexto usando o token do .env
 * 
 * Uso:
 *   npm run test-invertexto          # Teste completo
 *   npm run test-invertexto-quick    # Teste rápido (apenas alguns endpoints)
 */

import dotenv from 'dotenv';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carrega .env
dotenv.config({ path: join(__dirname, '.env') });

const API_TOKEN = process.env.INVERTEXTO_API_TOKEN;
// API Invertexto tem restrição de site (flowoff.xyz)
// Opções de teste:
const USE_NETLIFY = process.argv.includes('--netlify');
const USE_PROXY = process.argv.includes('--proxy') || process.argv.includes('--local');
const BASE_URL = USE_NETLIFY
  ? 'https://flowoff.xyz/.netlify/functions/invertexto' // Via Netlify (produção)
  : USE_PROXY 
    ? 'http://localhost:3000/api/invertexto' // Via proxy local
    : 'https://invertexto.com/api'; // Direto (pode falhar por restrição de site)
const isQuick = process.argv.includes('--quick');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Endpoints para testar
const endpoints = [
  {
    name: 'CEP',
    endpoint: 'cep',
    params: { cep: '74000000' },
    quick: true
  },
  {
    name: 'Validador CPF',
    endpoint: 'validator',
    params: { type: 'cpf', value: '12345678901' },
    quick: true
  },
  {
    name: 'Validador Email',
    endpoint: 'email-validator',
    params: { email: 'teste@exemplo.com' },
    quick: true
  },
  {
    name: 'QR Code',
    endpoint: 'qrcode',
    params: { text: 'https://flowoff.xyz', size: 200, format: 'png' },
    quick: false
  },
  {
    name: 'Código de Barras',
    endpoint: 'barcode',
    params: { text: '123456789012', format: 'png', width: 300, height: 100 },
    quick: false
  },
  {
    name: 'GeoIP',
    endpoint: 'geoip',
    params: { ip: '8.8.8.8' },
    quick: true
  },
  {
    name: 'Conversão de Moedas',
    endpoint: 'currency',
    params: { from: 'USD', to: 'BRL', amount: 100 },
    quick: true
  },
  {
    name: 'CNPJ',
    endpoint: 'cnpj',
    params: { cnpj: '12345678000195' },
    quick: false
  },
  {
    name: 'Número por Extenso',
    endpoint: 'number-to-words',
    params: { number: 1234, locale: 'pt_BR' },
    quick: true
  },
  {
    name: 'Faker (Dados Falsos)',
    endpoint: 'faker',
    params: { locale: 'pt_BR', type: 'name' },
    quick: false
  }
];

async function testEndpoint(endpointConfig) {
  const { name, endpoint, params } = endpointConfig;
  const startTime = Date.now();
  
  try {
    log(`\n🔍 Testando: ${name}`, 'cyan');
    log(`   Endpoint: ${endpoint}`, 'blue');
    const viaMethod = USE_NETLIFY ? 'Netlify Functions (produção)' : USE_PROXY ? 'Proxy local (server.js)' : 'API direta';
    log(`   Via: ${viaMethod}`, 'blue');
    
    let response;
    
    if (USE_NETLIFY || USE_PROXY) {
      // Testa via proxy (Netlify ou local) que faz a requisição correta
      response = await axios.post(
        BASE_URL,
        { endpoint, params },
        {
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 20000, // Mais tempo para Netlify
          validateStatus: (status) => status < 500
        }
      );
    } else {
      // Testa diretamente na API (pode falhar por restrição de site)
      response = await axios.post(
        `${BASE_URL}/${endpoint}`,
        { token: API_TOKEN, ...params },
        {
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'NEO.FLOWOFF-PWA/1.0',
            'Accept': 'application/json',
            'Origin': 'https://flowoff.xyz',
            'Referer': 'https://flowoff.xyz/'
          },
          timeout: 10000,
          maxRedirects: 5,
          validateStatus: (status) => status < 500
        }
      );
    }
    
    const duration = Date.now() - startTime;
    
    // Verifica se a resposta é HTML (página de erro)
    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('text/html')) {
      log(`   ⚠️  Resposta HTML (possível 404 ou página de erro)`, 'yellow');
      log(`   📄 Primeiros 100 chars: ${String(response.data).substring(0, 100)}`, 'yellow');
      return { success: false, duration, endpoint: name, error: `Resposta HTML (endpoint pode não existir)` };
    }
    
    // Se usar proxy (Netlify ou local), a resposta vem em response.data.data
    const responseData = (USE_NETLIFY || USE_PROXY) && response.data?.data ? response.data.data : response.data;
    const success = (USE_NETLIFY || USE_PROXY) ? response.data?.success : response.status === 200;
    
    if (success) {
      log(`   ✅ Sucesso (${duration}ms)`, 'green');
      
      // Mostra resultado resumido
      if (typeof responseData === 'object' && responseData !== null) {
        const keys = Object.keys(responseData).slice(0, 3);
        const preview = keys.map(k => `${k}: ${JSON.stringify(responseData[k]).substring(0, 50)}`).join(', ');
        log(`   📊 Resultado: {${preview}${keys.length < Object.keys(responseData).length ? '...' : ''}}`, 'blue');
      } else {
        log(`   📊 Resultado: ${String(responseData).substring(0, 100)}`, 'blue');
      }
      
      return { success: true, duration, endpoint: name };
    } else {
      log(`   ⚠️  Status: ${response.status}`, 'yellow');
      const errorMsg = USE_PROXY ? response.data?.error : JSON.stringify(responseData).substring(0, 150);
      log(`   📄 Resposta: ${errorMsg}`, 'yellow');
      return { success: false, duration, endpoint: name, error: `Status ${response.status}` };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error.response) {
      log(`   ❌ Erro HTTP ${error.response.status}: ${error.response.data?.error || error.message}`, 'red');
      return { success: false, duration, endpoint: name, error: `HTTP ${error.response.status}` };
    } else if (error.request) {
      log(`   ❌ Sem resposta do servidor`, 'red');
      return { success: false, duration, endpoint: name, error: 'Timeout/Network' };
    } else {
      log(`   ❌ Erro: ${error.message}`, 'red');
      return { success: false, duration, endpoint: name, error: error.message };
    }
  }
}

async function runTests() {
  log('\n🚀 Teste da API Invertexto', 'cyan');
  log('='.repeat(50), 'cyan');
  
  if (!API_TOKEN || API_TOKEN === 'seu_token_real_aqui') {
    log('\n❌ Token não configurado!', 'red');
    log('   Configure INVERTEXTO_API_TOKEN no arquivo .env', 'yellow');
    process.exit(1);
  }
  
  log(`\n✅ Token encontrado: ${API_TOKEN.substring(0, 20)}...`, 'green');
  log(`📋 Modo: ${isQuick ? 'Rápido (apenas endpoints principais)' : 'Completo (todos os endpoints)'}`, 'blue');
  
  // Filtra endpoints baseado no modo
  const endpointsToTest = isQuick 
    ? endpoints.filter(e => e.quick)
    : endpoints;
  
  log(`\n📊 Total de endpoints: ${endpointsToTest.length}`, 'cyan');
  log(`\n⚠️  NOTA: Se todos os testes falharem com 404, pode ser que:`, 'yellow');
  log(`   1. A API Invertexto mudou seus endpoints`, 'yellow');
  log(`   2. O token está inválido ou expirado`, 'yellow');
  log(`   3. A API requer autenticação diferente`, 'yellow');
  log(`   4. Verifique: https://invertexto.com/api para documentação atualizada\n`, 'yellow');
  
  const results = [];
  
  for (const endpoint of endpointsToTest) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Pequena pausa entre requisições
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Resumo
  log('\n' + '='.repeat(50), 'cyan');
  log('\n📊 Resumo dos Testes', 'cyan');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  
  log(`\n✅ Sucessos: ${successful}/${results.length}`, successful === results.length ? 'green' : 'yellow');
  log(`❌ Falhas: ${failed}/${results.length}`, failed > 0 ? 'red' : 'green');
  log(`⏱️  Tempo médio: ${Math.round(avgDuration)}ms`, 'blue');
  
  if (failed > 0) {
    log('\n⚠️  Endpoints com falha:', 'yellow');
    results.filter(r => !r.success).forEach(r => {
      log(`   - ${r.endpoint}: ${r.error}`, 'red');
    });
  }
  
  log('\n' + '='.repeat(50), 'cyan');
  
  // Exit code baseado no resultado
  process.exit(failed > 0 ? 1 : 0);
}

// Executa os testes
runTests().catch(error => {
  log(`\n❌ Erro fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
