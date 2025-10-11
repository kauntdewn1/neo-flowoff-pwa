// 🚨 PROTEÇÃO CONTRA REMOÇÃO ACIDENTAL 🚨
// NÃO REMOVER OU MODIFICAR FUNCIONALIDADES EXISTENTES
// MANTENHA TODAS AS FUNÇÕES DO SERVICE WORKER INTACTAS
// APENAS ADICIONAR NOVAS FUNCIONALIDADES QUANDO SOLICITADO

const CACHE = 'neo-flowoff-v1.5.1-images';
const ASSETS = [
  './', './index.html', './styles.css', './app.js', './p5-background.js',
  './blog.html', './blog-styles.css', './blog.js', './data/blog-articles.json',
  './manifest.webmanifest', './public/icon-192.png', './public/icon-512.png', './public/maskable-512.png',
  './public/flowoff logo.png', './public/FLOWPAY.png', './public/neo_ico.png', './public/icon-512.png',
  './public/logos/POSTON.png', './public/logos/proia.png', './public/logos/card-logo.png',
  './public/icons/icon-48x48.webp', './public/icons/icon-72x72.webp', './public/icons/icon-96x96.webp',
  './public/icons/icon-128x128.webp', './public/icons/icon-144x144.webp', './public/icons/icon-152x152.webp',
  './public/icons/icon-192x192.webp', './public/icons/icon-256x256.webp', './public/icons/icon-384x384.webp',
  './public/icons/icon-512x512.webp'
];

self.addEventListener('install', e=>{
  console.log('SW: Installing new version...');
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return Promise.allSettled(
        ASSETS.map(asset => 
          cache.add(asset).catch(err => {
            console.warn(`SW: Failed to cache ${asset}:`, err);
            return null;
          })
        )
      );
    })
  );
  self.skipWaiting(); // Força atualização imediata
});

self.addEventListener('activate', e=>{
  console.log('SW: Activating new version...');
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim(); // Assume controle imediato de todas as abas
});

self.addEventListener('fetch', e=>{
  const req = e.request;
  const url = new URL(req.url);
  
  // Filtrar requisições problemáticas
  if (
    url.protocol === 'chrome-extension:' ||
    url.protocol === 'moz-extension:' ||
    url.protocol === 'safari-extension:' ||
    req.method === 'POST' ||
    req.method === 'PUT' ||
    req.method === 'DELETE' ||
    url.hostname.includes('metamask') ||
    url.hostname.includes('tronlink') ||
    url.hostname.includes('bybit') ||
    url.pathname.includes('taaft.com-image-generator') ||
    url.pathname.includes('.backup') ||
    url.pathname.includes('installHook.js') ||
    url.pathname.includes('lockdown-install.js')
  ) {
    // Não interceptar essas requisições
    return;
  }
  
  // Para CSS e JS, sempre buscar da rede primeiro
  if (req.url.includes('.css') || req.url.includes('.js')) {
    e.respondWith(
      fetch(req).then(res => {
        // Só cachear se for uma resposta válida
        if (res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(err => {
            console.warn('SW: Failed to cache response:', err);
          });
        }
        return res;
      }).catch(() => caches.match(req))
    );
  } else {
    // Para imagens, usar estratégia mais robusta
    e.respondWith(
      fetch(req, {
        // Configurações para evitar NS_BINDING_ABORTED
        signal: AbortSignal.timeout(10000), // Timeout de 10s
        cache: 'no-cache'
      }).then(res => {
        // Só cachear se for uma resposta válida
        if (res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c=>c.put(req, copy)).catch(err => {
            console.warn('SW: Failed to cache response:', err);
          });
        }
        return res;
      }).catch(err => {
        console.warn('SW: Fetch failed for', req.url, err);
        // Fallback para cache se a rede falhar
        return caches.match(req).then(cached => {
          if (cached) return cached;
          // Se não houver cache, retornar resposta básica
          return new Response('Resource not available', { status: 404 });
        });
      })
    );
  }
});
