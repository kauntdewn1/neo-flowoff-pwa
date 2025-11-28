// Script para forçar limpeza completa do cache
// Execute no console do navegador

console.log('🧹 Forçando limpeza completa do cache...');

// 1. Limpar todos os caches
caches.keys().then(cacheNames => {
  console.log('🗑️ Caches encontrados:', cacheNames);
  return Promise.all(
    cacheNames.map(cacheName => {
      console.log('🗑️ Removendo cache:', cacheName);
      return caches.delete(cacheName);
    })
  );
}).then(() => {
  console.log('✅ Todos os caches foram limpos!');
  
  // 2. Desregistrar Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        console.log('🔄 Desregistrando Service Worker:', registration.scope);
        registration.unregister();
      });
    });
  }
  
  // 3. Limpar localStorage
  localStorage.clear();
  console.log('✅ localStorage limpo!');
  
  // 4. Limpar sessionStorage
  sessionStorage.clear();
  console.log('✅ sessionStorage limpo!');
  
  console.log('🔄 Recarregue a página para aplicar as mudanças');
  console.log('💡 Pressione Ctrl+F5 (ou Cmd+Shift+R) para recarregar sem cache');
});

// 5. Função para testar se os arquivos de teste foram removidos
window.testCleanCache = () => {
  fetch('/test-glass-morphism.js')
    .then(response => {
      if (response.status === 404) {
        console.log('✅ Arquivo test-glass-morphism.js removido do servidor');
      } else {
        console.log('❌ Arquivo test-glass-morphism.js ainda acessível');
      }
    })
    .catch(error => {
      console.log('✅ Arquivo test-glass-morphism.js não encontrado');
    });
  
  fetch('/test-update-system.js')
    .then(response => {
      if (response.status === 404) {
        console.log('✅ Arquivo test-update-system.js removido do servidor');
      } else {
        console.log('❌ Arquivo test-update-system.js ainda acessível');
      }
    })
    .catch(error => {
      console.log('✅ Arquivo test-update-system.js não encontrado');
    });
};

console.log('💡 Use window.testCleanCache() para verificar se os arquivos foram removidos');
