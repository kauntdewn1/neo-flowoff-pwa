/**
 * Script de Teste Completo - Protocolo NΞØ
 * Valida todos os módulos e integrações
 * 
 * Execute: npm run test-neo-protocol
 */

import { getIdentityGraph } from '../src/modules/neo-id/identity-graph.js';
import { getGamificationController } from '../src/modules/gamification/gamification-controller.js';
import { getFlowPayClient } from '../src/modules/flowpay/flowpay-client.js';
import { getMCPRouter } from '../src/modules/mcp-router/mcp-router.js';

// Simulação do ambiente browser
if (typeof window === 'undefined') {
  global.window = {
    localStorage: {
      data: {},
      getItem(key) { return this.data[key] || null; },
      setItem(key, value) { this.data[key] = value; },
      removeItem(key) { delete this.data[key]; },
      clear() { this.data = {}; }
    },
    location: { hostname: 'localhost' },
    addEventListener: () => {},
    dispatchEvent: () => {}
  };
}

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testModule(name, testFn) {
  log(`\n🧪 Testando: ${name}`, 'magenta');
  try {
    await testFn();
    log(`   ✅ ${name} passou`, 'green');
    return true;
  } catch (error) {
    log(`   ❌ ${name} falhou: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

async function runAllTests() {
  log('\n🧬 TESTE COMPLETO - PROTOCOLO NΞØ\n', 'cyan');
  
  const results = {
    identity: false,
    gamification: false,
    flowpay: false,
    router: false
  };

  // Teste 1: Identity Graph
  results.identity = await testModule('Identity Graph', async () => {
    const identity = getIdentityGraph();
    await identity.init();
    
    const user = await identity.setIdentity({
      name: 'Test User',
      email: 'test@neo.xyz'
    });
    
    if (!user.id) throw new Error('ID não gerado');
    if (user.level !== 1) throw new Error('Nível inicial incorreto');
    
    await identity.addXP(50);
    const updated = identity.getIdentity();
    if (updated.xp !== 50) throw new Error('XP não atualizado');
  });

  // Teste 2: Gamification
  results.gamification = await testModule('GamificationController', async () => {
    const gamification = getGamificationController();
    await gamification.init();
    
    const quests = gamification.getAvailableQuests();
    if (quests.length === 0) throw new Error('Nenhuma quest disponível');
    
    await gamification.addPoints(100);
    const progress = gamification.getProgress();
    if (progress.points !== 100) throw new Error('Pontos não adicionados');
  });

  // Teste 3: FlowPay
  results.flowpay = await testModule('FlowPay Client', async () => {
    const flowpay = getFlowPayClient();
    await flowpay.init();
    
    const checkout = await flowpay.createCheckout(100.00, 'BRL');
    if (!checkout.id) throw new Error('Checkout não criado');
    if (!checkout.qrCode) throw new Error('QR Code não gerado');
  });

  // Teste 4: MCP Router
  results.router = await testModule('MCP Router', async () => {
    const router = getMCPRouter();
    await router.init({});
    
    const status = router.getStatus();
    if (!status.initialized) throw new Error('Router não inicializado');
    if (!status.modules.identity) throw new Error('Módulo identity não carregado');
    
    const profile = await router.route('user.profile');
    if (!profile.identity) throw new Error('Perfil não retornado');
  });

  // Resumo
  log('\n📊 RESUMO DOS TESTES\n', 'cyan');
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(r => r).length;
  
  Object.entries(results).forEach(([module, passed]) => {
    log(`   ${passed ? '✅' : '❌'} ${module}`, passed ? 'green' : 'red');
  });
  
  log(`\n   Total: ${passed}/${total} módulos passaram`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 TODOS OS TESTES PASSARAM!\n', 'green');
  } else {
    log('\n⚠️  Alguns testes falharam. Revise os erros acima.\n', 'yellow');
  }
  
  return passed === total;
}

// Executar
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log(`\n❌ ERRO FATAL: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });

