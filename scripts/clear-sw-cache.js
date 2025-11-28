// Script para limpar cache do Service Worker
// Execute no console do navegador

console.log('🧹 Limpando cache do Service Worker...');

// Limpar todos os caches
caches.keys().then(cacheNames => {
  return Promise.all(
    cacheNames.map(cacheName => {
      console.log('🗑️ Removendo cache:', cacheName);
      return caches.delete(cacheName);
    })
  );
}).then(() => {
  console.log('✅ Todos os caches foram limpos!');
  
  // Desregistrar Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        console.log('🔄 Desregistrando Service Worker:', registration.scope);
        registration.unregister();
      });
    });
  }
  
  console.log('🔄 Recarregue a página para aplicar as mudanças');
});

// Limpar localStorage relacionado ao loop
localStorage.removeItem('last-desktop-visit');
localStorage.removeItem('last-index-visit');
console.log('🔄 Estado de prevenção de loops limpo');
