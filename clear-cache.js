// clear-cache.js - Script para limpar cache do PWA
// Execute no console do navegador (F12)

console.log('🧹 Iniciando limpeza de cache...');

// 1. Limpar todos os caches do Service Worker
caches.keys().then(cacheNames => {
  console.log('📦 Caches encontrados:', cacheNames);
  
  return Promise.all(
    cacheNames.map(cacheName => {
      console.log(`🗑️ Deletando cache: ${cacheName}`);
      return caches.delete(cacheName);
    })
  );
}).then(() => {
  console.log('✅ Todos os caches foram limpos');
  
  // 2. Limpar localStorage
  const localStorageKeys = Object.keys(localStorage);
  if (localStorageKeys.length > 0) {
    console.log('🗑️ Limpando localStorage:', localStorageKeys);
    localStorage.clear();
    console.log('✅ localStorage limpo');
  } else {
    console.log('ℹ️ localStorage já estava vazio');
  }
  
  // 3. Limpar sessionStorage
  const sessionStorageKeys = Object.keys(sessionStorage);
  if (sessionStorageKeys.length > 0) {
    console.log('🗑️ Limpando sessionStorage:', sessionStorageKeys);
    sessionStorage.clear();
    console.log('✅ sessionStorage limpo');
  } else {
    console.log('ℹ️ sessionStorage já estava vazio');
  }
  
  // 4. Unregister Service Worker se existir
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      if (registrations.length > 0) {
        console.log('🗑️ Unregistering Service Workers:', registrations.length);
        return Promise.all(
          registrations.map(registration => {
            console.log(`🗑️ Unregistering: ${registration.scope}`);
            return registration.unregister();
          })
        );
      } else {
        console.log('ℹ️ Nenhum Service Worker registrado');
        return Promise.resolve();
      }
    }).then(() => {
      console.log('✅ Service Workers unregistered');
      console.log('🔄 Recarregando página em 2 segundos...');
      
      setTimeout(() => {
        window.location.reload(true);
      }, 2000);
    });
  } else {
    console.log('ℹ️ Service Worker não suportado');
    console.log('🔄 Recarregando página em 2 segundos...');
    
    setTimeout(() => {
      window.location.reload(true);
    }, 2000);
  }
}).catch(error => {
  console.error('❌ Erro ao limpar cache:', error);
});

console.log('⏳ Aguarde a limpeza ser concluída...');
