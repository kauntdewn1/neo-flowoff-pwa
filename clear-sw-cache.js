// Script para limpar cache do Service Worker
// Execute no console do navegador

// Limpar todos os caches
caches.keys().then(cacheNames => {
  return Promise.all(
    cacheNames.map(cacheName => {
      return caches.delete(cacheName);
    })
  );
}).then(() => {
  
  // Desregistrar Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister());
    });
  }
  
  // Recarregue a página para aplicar as mudanças
});

// Limpar localStorage relacionado ao loop
localStorage.removeItem('last-desktop-visit');
localStorage.removeItem('last-index-visit');
