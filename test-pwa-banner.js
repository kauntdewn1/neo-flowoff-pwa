// test-pwa-banner.js - Script para testar o banner PWA
// Execute no console do navegador (F12)

console.log('🧪 Testando banner PWA...');

// 1. Verificar se o elemento existe
const pwaBanner = document.getElementById('pwa-install-banner');
if (!pwaBanner) {
  console.error('❌ Elemento pwa-install-banner não encontrado!');
} else {
  console.log('✅ Elemento pwa-install-banner encontrado');
  
  // 2. Verificar estilos atuais
  const computedStyle = window.getComputedStyle(pwaBanner);
  console.log('📊 Estilos atuais:');
  console.log('- display:', computedStyle.display);
  console.log('- opacity:', computedStyle.opacity);
  console.log('- transform:', computedStyle.transform);
  console.log('- z-index:', computedStyle.zIndex);
  
  // 3. Verificar localStorage
  const dismissed = localStorage.getItem('pwa-dismissed');
  console.log('💾 localStorage pwa-dismissed:', dismissed);
  
  // 4. Verificar se está em modo standalone
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  console.log('📱 Modo standalone:', isStandalone);
  
  // 5. Verificar se beforeinstallprompt foi disparado
  console.log('🔍 Verificando se beforeinstallprompt está disponível...');
  
  // 6. Forçar exibição do banner para teste
  console.log('🎯 Forçando exibição do banner...');
  pwaBanner.style.display = 'block';
  pwaBanner.classList.add('show');
  
  setTimeout(() => {
    console.log('✅ Banner deve estar visível agora');
    
    // 7. Verificar se os botões existem
    const installBtn = document.getElementById('pwa-install-btn');
    const dismissBtn = document.getElementById('pwa-dismiss');
    
    if (installBtn) {
      console.log('✅ Botão instalar encontrado');
    } else {
      console.error('❌ Botão instalar não encontrado');
    }
    
    if (dismissBtn) {
      console.log('✅ Botão dispensar encontrado');
    } else {
      console.error('❌ Botão dispensar não encontrado');
    }
    
    // 8. Testar funcionalidade do botão dispensar
    if (dismissBtn) {
      console.log('🧪 Testando botão dispensar...');
      dismissBtn.click();
      setTimeout(() => {
        console.log('✅ Banner deve ter sido dispensado');
        console.log('💾 localStorage pwa-dismissed:', localStorage.getItem('pwa-dismissed'));
      }, 100);
    }
    
  }, 1000);
}

// 9. Verificar Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistration().then(registration => {
    if (registration) {
      console.log('✅ Service Worker registrado:', registration.scope);
    } else {
      console.log('❌ Service Worker não registrado');
    }
  });
} else {
  console.log('❌ Service Worker não suportado');
}

// 10. Verificar manifest
const manifestLink = document.querySelector('link[rel="manifest"]');
if (manifestLink) {
  console.log('✅ Manifest encontrado:', manifestLink.href);
} else {
  console.log('❌ Manifest não encontrado');
}

console.log('🏁 Teste concluído. Verifique os resultados acima.');
