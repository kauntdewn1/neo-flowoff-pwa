const CACHE = 'neo-flowoff-v1.4.8-clean';
const ASSETS = [
  './', './index.html', './styles.css', './app.js', './p5-background.js',
  './blog.html', './blog-styles.css', './blog.js', './data/blog-articles.json',
  './manifest.webmanifest', './public/icon-192.png', './public/icon-512.png', './public/maskable-512.png',
  './public/flowoff logo.png', './public/FLOWPAY.png', './public/neo_ico.png', './public/icon-512.png',
  './public/poston.png', './public/logos/proia.png',
  './public/icons/icon-48x48.webp', './public/icons/icon-72x72.webp', './public/icons/icon-96x96.webp',
  './public/icons/icon-128x128.webp', './public/icons/icon-144x144.webp', './public/icons/icon-152x152.webp',
  './public/icons/icon-192x192.webp', './public/icons/icon-256x256.webp', './public/icons/icon-384x384.webp',
  './public/icons/icon-512x512.webp'
];

// Logger condicional para Service Worker (apenas em desenvolvimento)
const isDev = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';
const swLogger = {
  log: (...args) => isDev && console.log(...args),
  warn: (...args) => isDev && console.warn(...args),
  error: (...args) => console.error(...args) // Erros sempre logados
};

self.addEventListener('install', e=>{
  swLogger.log('SW: Installing new version...');
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return Promise.allSettled(
        ASSETS.map(asset => 
          cache.add(asset).catch(err => {
            swLogger.warn(`SW: Failed to cache ${asset}:`, err);
            return null;
          })
        )
      );
    })
  );
  self.skipWaiting(); // Força atualização imediata
});

self.addEventListener('activate', e=>{
  swLogger.log('SW: Activating new version...');
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
    url.pathname.includes('lockdown-install.js') ||
    url.pathname.includes('POSTON.png') // Filtro específico para POSTON.png
  ) {
    // Não interceptar essas requisições
    return;
  }
  
  // Para CSS e JS em desenvolvimento, sempre buscar da rede (bypass cache)
  if (isDev && (req.url.includes('.css') || req.url.includes('.js'))) {
    e.respondWith(fetch(req));
    return;
  }
  
  // Para CSS e JS em produção, sempre buscar da rede primeiro
  if (req.url.includes('.css') || req.url.includes('.js')) {
    e.respondWith(
      fetch(req).then(res => {
        // Só cachear se for uma resposta válida
        if (res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(err => {
            swLogger.warn('SW: Failed to cache response:', err);
          });
        }
        return res;
      }).catch(() => caches.match(req))
    );
  } else {
    e.respondWith(
      fetch(req).then(res => {
        // Só cachear se for uma resposta válida
        if (res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c=>c.put(req, copy)).catch(err => {
            swLogger.warn('SW: Failed to cache response:', err);
          });
        }
        return res;
      }).catch(() => {
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
