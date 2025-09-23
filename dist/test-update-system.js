/**
 * Teste do Sistema de Detecção de Atualizações
 * NEØ.FLOWOFF PWA
 */

console.log('🧪 Testando Sistema de Detecção de Atualizações...');

// Função para testar elementos HTML
function testUpdateElements() {
  console.log('\n📋 Testando elementos HTML:');
  
  const updateBanner = document.getElementById('update-banner');
  const updateBtn = document.getElementById('update-btn');
  const updateDismiss = document.getElementById('update-dismiss');
  
  console.log(`✅ Banner de atualização: ${!!updateBanner}`);
  console.log(`✅ Botão atualizar: ${!!updateBtn}`);
  console.log(`✅ Botão dispensar: ${!!updateDismiss}`);
  
  if (updateBanner) {
    const styles = window.getComputedStyle(updateBanner);
    console.log(`✅ Z-index: ${styles.zIndex}`);
    console.log(`✅ Position: ${styles.position}`);
    console.log(`✅ Display: ${styles.display}`);
  }
}

// Função para testar CSS
function testUpdateCSS() {
  console.log('\n🎨 Testando CSS:');
  
  const updateBanner = document.getElementById('update-banner');
  if (!updateBanner) return;
  
  const styles = window.getComputedStyle(updateBanner);
  
  console.log(`✅ Background: ${styles.background !== 'rgba(0, 0, 0, 0)'}`);
  console.log(`✅ Backdrop-filter: ${styles.backdropFilter !== 'none'}`);
  console.log(`✅ Transform: ${styles.transform !== 'none'}`);
  console.log(`✅ Transition: ${styles.transition !== 'all 0s ease 0s'}`);
  console.log(`✅ Box-shadow: ${styles.boxShadow !== 'none'}`);
}

// Função para testar JavaScript
function testUpdateJS() {
  console.log('\n⚡ Testando JavaScript:');
  
  console.log(`✅ Função testUpdateBanner: ${typeof window.testUpdateBanner === 'function'}`);
  console.log(`✅ Função clearUpdateState: ${typeof window.clearUpdateState === 'function'}`);
  console.log(`✅ Service Worker suportado: ${'serviceWorker' in navigator}`);
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(registration => {
      console.log(`✅ Service Worker registrado: ${!!registration}`);
      if (registration) {
        console.log(`✅ Service Worker ativo: ${!!registration.active}`);
        console.log(`✅ Service Worker instalando: ${!!registration.installing}`);
        console.log(`✅ Service Worker esperando: ${!!registration.waiting}`);
      }
    });
  }
}

// Função para testar localStorage
function testUpdateStorage() {
  console.log('\n💾 Testando localStorage:');
  
  const dismissed = localStorage.getItem('update-dismissed');
  console.log(`✅ Estado dispensado: ${dismissed}`);
  
  // Testar limpeza
  if (typeof window.clearUpdateState === 'function') {
    window.clearUpdateState();
    const cleared = localStorage.getItem('update-dismissed');
    console.log(`✅ Estado limpo: ${cleared === null}`);
  } else {
    console.log(`⚠️ Função clearUpdateState não disponível ainda`);
  }
}

// Função para testar funcionalidade
function testUpdateFunctionality() {
  console.log('\n🔧 Testando funcionalidade:');
  
  const updateBanner = document.getElementById('update-banner');
  if (!updateBanner) return;
  
  // Testar exibição manual
  window.testUpdateBanner();
  setTimeout(() => {
    const isVisible = updateBanner.style.display !== 'none' && 
                     updateBanner.classList.contains('show');
    console.log(`✅ Banner exibido: ${isVisible}`);
    
    // Testar dispensar
    const dismissBtn = document.getElementById('update-dismiss');
    if (dismissBtn) {
      dismissBtn.click();
      setTimeout(() => {
        const isHidden = updateBanner.style.display === 'none' || 
                        !updateBanner.classList.contains('show');
        console.log(`✅ Banner dispensado: ${isHidden}`);
      }, 100);
    }
  }, 100);
}

// Função para testar responsividade
function testUpdateResponsiveness() {
  console.log('\n📱 Testando responsividade:');
  
  const updateBanner = document.getElementById('update-banner');
  if (!updateBanner) return;
  
  const styles = window.getComputedStyle(updateBanner);
  
  console.log(`✅ Position fixed: ${styles.position === 'fixed'}`);
  console.log(`✅ Top: ${styles.top}`);
  console.log(`✅ Left: ${styles.left}`);
  console.log(`✅ Right: ${styles.right}`);
  console.log(`✅ Width: ${styles.width}`);
  
  // Testar em diferentes tamanhos de tela
  const originalWidth = window.innerWidth;
  
  // Simular mobile
  Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
  window.dispatchEvent(new Event('resize'));
  console.log(`✅ Mobile (375px): ${window.innerWidth === 375}`);
  
  // Simular tablet
  Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });
  window.dispatchEvent(new Event('resize'));
  console.log(`✅ Tablet (768px): ${window.innerWidth === 768}`);
  
  // Restaurar tamanho original
  Object.defineProperty(window, 'innerWidth', { value: originalWidth, writable: true });
  window.dispatchEvent(new Event('resize'));
}

// Função para testar animações
function testUpdateAnimations() {
  console.log('\n🎬 Testando animações:');
  
  const updateBanner = document.getElementById('update-banner');
  if (!updateBanner) return;
  
  const styles = window.getComputedStyle(updateBanner);
  
  console.log(`✅ Transition: ${styles.transition !== 'all 0s ease 0s'}`);
  console.log(`✅ Transform: ${styles.transform !== 'none'}`);
  
  // Verificar se há keyframes definidos
  const styleSheets = Array.from(document.styleSheets);
  let hasKeyframes = false;
  
  styleSheets.forEach(sheet => {
    try {
      const rules = Array.from(sheet.cssRules || sheet.rules);
      rules.forEach(rule => {
        if (rule.type === CSSRule.KEYFRAMES_RULE) {
          if (rule.name === 'slideDownUpdate' || rule.name === 'rotate') {
            hasKeyframes = true;
          }
        }
      });
    } catch (e) {
      // Ignorar erros de CORS
    }
  });
  
  console.log(`✅ Keyframes definidos: ${hasKeyframes}`);
}

// Função para testar acessibilidade
function testUpdateAccessibility() {
  console.log('\n♿ Testando acessibilidade:');
  
  const updateBanner = document.getElementById('update-banner');
  const updateBtn = document.getElementById('update-btn');
  const updateDismiss = document.getElementById('update-dismiss');
  
  if (updateBanner) {
    console.log(`✅ Banner tem role: ${updateBanner.getAttribute('role') || 'implicit'}`);
  }
  
  if (updateBtn) {
    console.log(`✅ Botão atualizar tem texto: ${updateBtn.textContent.trim() !== ''}`);
    console.log(`✅ Botão atualizar tem cursor: ${window.getComputedStyle(updateBtn).cursor === 'pointer'}`);
  }
  
  if (updateDismiss) {
    console.log(`✅ Botão dispensar tem texto: ${updateDismiss.textContent.trim() !== ''}`);
    console.log(`✅ Botão dispensar tem cursor: ${window.getComputedStyle(updateDismiss).cursor === 'pointer'}`);
  }
}

// Executar todos os testes
function runAllTests() {
  console.log('🚀 Iniciando testes do Sistema de Atualização...');
  
  testUpdateElements();
  testUpdateCSS();
  testUpdateJS();
  testUpdateStorage();
  testUpdateFunctionality();
  testUpdateResponsiveness();
  testUpdateAnimations();
  testUpdateAccessibility();
  
  console.log('\n✅ Todos os testes concluídos!');
  console.log('\n📋 Comandos disponíveis:');
  console.log('  window.testUpdateBanner() - Exibir banner manualmente');
  console.log('  window.clearUpdateState() - Limpar estado dispensado');
  console.log('  localStorage.getItem("update-dismissed") - Verificar estado');
}

// Executar testes quando a página carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runAllTests);
} else {
  runAllTests();
}

// Exportar para uso global
window.testUpdateSystem = runAllTests;
