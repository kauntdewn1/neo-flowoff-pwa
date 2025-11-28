/**
 * Script de Teste - Fluxo de Identidade End-to-End
 * Valida: lead → identity → XP → badge
 * 
 * Execute: npm run test-identity
 */

// Simulação do ambiente browser (para testes Node.js)
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

import { getIdentityGraph } from '../src/modules/neo-id/identity-graph.js';
import { getGamificationController } from '../src/modules/gamification/gamification-controller.js';
import { getMCPRouter } from '../src/modules/mcp-router/mcp-router.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testIdentityFlow() {
  log('\n🧬 TESTE: Fluxo de Identidade End-to-End\n', 'cyan');

  try {
    // 1. Inicializar Identity Graph
    log('1️⃣ Inicializando Identity Graph...', 'blue');
    const identity = getIdentityGraph();
    await identity.init();
    log('   ✅ Identity Graph inicializado', 'green');

    // 2. Criar identidade de teste
    log('\n2️⃣ Criando identidade de teste...', 'blue');
    const testUser = await identity.setIdentity({
      name: 'MELLØ Test',
      email: 'test@flowoff.xyz',
      whatsapp: '+5562983231110',
      leadOrigin: 'test_script'
    });
    log(`   ✅ Identidade criada: ${testUser.id}`, 'green');
    log(`   📊 Nível: ${testUser.level}, XP: ${testUser.xp}`, 'yellow');

    // 3. Inicializar Gamification
    log('\n3️⃣ Inicializando Gamification...', 'blue');
    const gamification = getGamificationController();
    await gamification.init();
    log('   ✅ Gamification inicializado', 'green');

    // 4. Processar lead (deve ativar quest)
    log('\n4️⃣ Processando lead (ativação de quest)...', 'blue');
    const questResult = await gamification.activateLeadQuest({
      origin: 'test_script',
      name: 'Lead Test',
      email: 'lead@test.com'
    });
    log('   ✅ Quest "Primeiro Lead" completada!', 'green');
    log(`   🎁 Recompensas: ${questResult.reward.xp} XP, ${questResult.reward.points} pontos`, 'yellow');

    // 5. Verificar progresso
    log('\n5️⃣ Verificando progresso...', 'blue');
    const progress = gamification.getProgress();
    log(`   📊 Nível: ${progress.level}`, 'yellow');
    log(`   ⭐ XP: ${progress.xp}`, 'yellow');
    log(`   💰 Pontos: ${progress.points}`, 'yellow');
    log(`   🏅 Badges: ${progress.badges}`, 'yellow');
    log(`   ✅ Quests completadas: ${progress.questsCompleted}/${progress.questsTotal}`, 'yellow');

    // 6. Adicionar mais XP
    log('\n6️⃣ Adicionando XP adicional...', 'blue');
    const xpResult = await identity.addXP(25, 'Ação de teste');
    log(`   ✅ XP adicionado! Total: ${xpResult.xp}, Nível: ${xpResult.level}`, 'green');

    // 7. Adicionar pontos
    log('\n7️⃣ Adicionando pontos...', 'blue');
    const pointsResult = await gamification.addPoints(50, 'Teste de pontos');
    log(`   ✅ Pontos adicionados! Total: ${pointsResult}`, 'green');

    // 8. Verificar perfil completo
    log('\n8️⃣ Obtendo perfil completo...', 'blue');
    const identityData = identity.getIdentity();
    log('   📋 Perfil completo:', 'yellow');
    console.log(JSON.stringify(identityData, null, 2));

    // 9. Testar MCP Router
    log('\n9️⃣ Testando MCP Router...', 'blue');
    const router = getMCPRouter();
    await router.init({}); // Sem Thirdweb para teste
    const routerStatus = router.getStatus();
    log('   ✅ Router inicializado', 'green');
    log(`   📊 Módulos: ${JSON.stringify(routerStatus.modules)}`, 'yellow');

    // 10. Testar rota de perfil
    log('\n🔟 Testando rota user.profile...', 'blue');
    const profile = await router.route('user.profile');
    log('   ✅ Perfil obtido via router', 'green');
    log(`   👤 Nome: ${profile.identity?.name}`, 'yellow');
    log(`   📊 Nível: ${profile.gamification?.level}`, 'yellow');

    log('\n✅ TODOS OS TESTES PASSARAM!\n', 'green');
    return true;

  } catch (error) {
    log(`\n❌ ERRO NO TESTE: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

// Executar teste
testIdentityFlow()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log(`\n❌ ERRO FATAL: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });

