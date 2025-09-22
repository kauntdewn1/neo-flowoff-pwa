const CACHE = 'neo-flowoff-v1.4.3';
const ASSETS = [
  './', './index.html', './styles.css', './app.js', './p5-background.js',
  './blog.html', './blog-styles.css', './blog.js', './data/blog-articles.json',
  './manifest.webmanifest', './public/icon-192.png', './public/icon-512.png', './public/maskable-512.png',
  './public/flowoff logo.png', './public/FLOWPAY.png', './public/neo_ico.png', './public/icon-512x512.png',
  './public/poston.png', './public/logos/proia.png',
  './public/icons/icon-48x48.webp', './public/icons/icon-72x72.webp', './public/icons/icon-96x96.webp',
  './public/icons/icon-128x128.webp', './public/icons/icon-144x144.webp', './public/icons/icon-152x152.webp',
  './public/icons/icon-192x192.webp', './public/icons/icon-256x256.webp', './public/icons/icon-384x384.webp',
  './public/icons/icon-512x512.webp'
];

self.addEventListener('install', e=>{
  console.log('SW: Installing new version...');
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
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
  // Para CSS e JS, sempre buscar da rede primeiro
  if (req.url.includes('.css') || req.url.includes('.js')) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
  } else {
    e.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=>c.put(req, copy));
        return res;
      }).catch(()=> caches.match('./index.html')))
    );
  }
});
