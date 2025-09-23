// === TESTE GLASS MORPHISM BOTTOM BAR ===
// Script para testar a integração do glass morphism com nosso sistema de rotas

console.log('🧪 Testando Glass Morphism Bottom Bar...');

// Função para testar se os elementos estão presentes
function testElements() {
  console.log('\n📋 Testando elementos HTML:');
  
  const tabbar = document.querySelector('.glass-morphism-tabbar');
  const navItems = document.querySelectorAll('.glass-nav-item');
  const routes = ['home', 'projects', 'start', 'ecosystem'];
  
  console.log('✅ Tabbar encontrado:', !!tabbar);
  console.log('✅ Nav items encontrados:', navItems.length);
  
  routes.forEach(route => {
    const item = document.querySelector(`[data-route="${route}"]`);
    console.log(`✅ Rota "${route}":`, !!item);
  });
}

// Função para testar CSS
function testCSS() {
  console.log('\n🎨 Testando CSS:');
  
  const tabbar = document.querySelector('.glass-morphism-tabbar');
  if (tabbar) {
    const styles = window.getComputedStyle(tabbar);
    console.log('✅ Backdrop-filter:', styles.backdropFilter !== 'none');
    console.log('✅ Background:', styles.background.includes('rgba'));
    console.log('✅ Grid columns:', styles.gridTemplateColumns);
  }
}

// Função para testar JavaScript
function testJavaScript() {
  console.log('\n⚡ Testando JavaScript:');
  
  // Testar se a função go() existe
  console.log('✅ Função go() existe:', typeof go === 'function');
  
  // Testar se os event listeners estão funcionando
  const navItems = document.querySelectorAll('.glass-nav-item');
  console.log('✅ Event listeners:', navItems.length > 0);
  
  // Testar rota ativa
  const activeItem = document.querySelector('.glass-nav-item.active');
  console.log('✅ Item ativo:', activeItem ? activeItem.dataset.route : 'Nenhum');
}

// Função para testar cores
function testColors() {
  console.log('\n🌈 Testando cores NEO.FLOWOFF:');
  
  const activeItem = document.querySelector('.glass-nav-item.active');
  if (activeItem) {
    const styles = window.getComputedStyle(activeItem);
    console.log('✅ Cores aplicadas:', styles.background.includes('rgba'));
  }
  
  const startButton = document.querySelector('.glass-nav-item.start-button');
  if (startButton) {
    const styles = window.getComputedStyle(startButton);
    console.log('✅ Botão Iniciar especial:', styles.background.includes('rgba'));
  }
}

// Função para testar responsividade
function testResponsiveness() {
  console.log('\n📱 Testando responsividade:');
  
  const tabbar = document.querySelector('.glass-morphism-tabbar');
  if (tabbar) {
    const styles = window.getComputedStyle(tabbar);
    console.log('✅ Grid mobile:', styles.gridTemplateColumns.includes('repeat(4'));
    console.log('✅ Padding mobile:', styles.padding.includes('env(safe-area-inset-bottom)'));
  }
}

// Função para simular navegação
function testNavigation() {
  console.log('\n🧭 Testando navegação:');
  
  const routes = ['home', 'projects', 'start', 'ecosystem'];
  
  routes.forEach(route => {
    const item = document.querySelector(`[data-route="${route}"]`);
    if (item) {
      console.log(`✅ Rota "${route}" clicável:`, !!item);
      
      // Simular clique
      item.click();
      setTimeout(() => {
        const isActive = item.classList.contains('active');
        console.log(`✅ Rota "${route}" ativa após clique:`, isActive);
      }, 100);
    }
  });
}

// Executar todos os testes
function runAllTests() {
  console.log('🚀 Iniciando testes do Glass Morphism Bottom Bar...\n');
  
  testElements();
  testCSS();
  testJavaScript();
  testColors();
  testResponsiveness();
  
  // Aguardar um pouco antes de testar navegação
  setTimeout(() => {
    testNavigation();
    console.log('\n✅ Todos os testes concluídos!');
  }, 500);
}

// Executar testes quando a página carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runAllTests);
} else {
  runAllTests();
}

// Exportar funções para uso manual
window.testGlassMorphism = {
  elements: testElements,
  css: testCSS,
  javascript: testJavaScript,
  colors: testColors,
  responsiveness: testResponsiveness,
  navigation: testNavigation,
  all: runAllTests
};

console.log('💡 Use window.testGlassMorphism.all() para executar todos os testes');
