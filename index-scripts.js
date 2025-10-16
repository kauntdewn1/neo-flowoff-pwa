// index-scripts.js - Scripts específicos do index.html

// Detecção de Desktop
function detectDesktop() {
  if (window.innerWidth >= 1024) {
    const lastDesktopVisit = localStorage.getItem('last-desktop-visit');
    const now = Date.now();
    
    if (!lastDesktopVisit || (now - parseInt(lastDesktopVisit)) > 10000) { // 10 segundos
      localStorage.setItem('last-desktop-visit', now.toString());
      window.location.href = 'desktop.html';
      return true;
    } else {
      return false;
    }
  }
  return false;
}

// Executar detecção quando a página carregar
detectDesktop();

// Force CSS reload
const link = document.querySelector('link[href*="styles.css"]');
if (link) {
  link.href = link.href.split('?')[0] + '?v=' + Date.now();
}

// PWA Install Banner
var deferredPrompt;
var pwaBannerShown = false;
const pwaBanner = document.getElementById('pwa-install-banner');
const installBtn = document.getElementById('pwa-install-btn');
const dismissBtn = document.getElementById('pwa-dismiss');

// Verificar se já foi instalado ou dispensado
if (localStorage.getItem('pwa-dismissed') === 'true' || window.matchMedia('(display-mode: standalone)').matches) {
  pwaBanner.style.display = 'none';
}

// Escutar evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Mostrar banner apenas se não foi dispensado
  if (localStorage.getItem('pwa-dismissed') !== 'true') {
    pwaBanner.style.display = 'block';
    pwaBanner.classList.add('show');
    pwaBannerShown = true;
  }
});

// Fallback: Mostrar banner após 3 segundos se não foi dispensado (para teste)
setTimeout(() => {
  if (!pwaBannerShown && localStorage.getItem('pwa-dismissed') !== 'true' && !window.matchMedia('(display-mode: standalone)').matches) {
    pwaBanner.style.display = 'block';
    pwaBanner.classList.add('show');
    pwaBannerShown = true;
  }
}, 3000);

// Botão instalar
installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        pwaBanner.style.display = 'none';
        pwaBanner.classList.remove('show');
        pwaBannerShown = false;
      }
      deferredPrompt = null;
    } catch (error) {
      // Erro na instalação
    }
  }
});

// Botão dispensar
dismissBtn.addEventListener('click', () => {
  pwaBanner.style.display = 'none';
  pwaBanner.classList.remove('show');
  pwaBannerShown = false;
  localStorage.setItem('pwa-dismissed', 'true');
});

// Auto-hide após 15 segundos
setTimeout(() => {
  if (pwaBannerShown && pwaBanner.style.display !== 'none') {
    pwaBanner.style.opacity = '0';
    setTimeout(() => {
      pwaBanner.style.display = 'none';
      pwaBanner.classList.remove('show');
      pwaBannerShown = false;
    }, 300);
  }
}, 15000);

// Detectar se PWA foi instalado
window.addEventListener('appinstalled', () => {
  pwaBanner.style.display = 'none';
  pwaBanner.classList.remove('show');
  pwaBannerShown = false;
});

// Função para testar o banner manualmente (debug)
window.testPWAInstall = () => {
  if (pwaBanner) {
    pwaBanner.style.display = 'block';
    pwaBanner.classList.add('show');
    pwaBannerShown = true;
  }
};

// Função para limpar o estado do banner (debug)
window.clearPWAState = () => {
  localStorage.removeItem('pwa-dismissed');
};

// Efeito de blur no header durante scroll
const header = document.getElementById('main-header');
let lastScrollY = window.scrollY;
let ticking = false;

function updateHeader() {
  const scrollY = window.scrollY;
  
  if (scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  
  lastScrollY = scrollY;
  ticking = false;
}

function requestTick() {
  if (!ticking) {
    requestAnimationFrame(updateHeader);
    ticking = true;
  }
}

window.addEventListener('scroll', requestTick);

// === UPDATE DETECTION SYSTEM ===
const updateBanner = document.getElementById('update-banner');
const updateBtn = document.getElementById('update-btn');
const updateDismiss = document.getElementById('update-dismiss');

let updateAvailable = false;
let updateWorker = null;
let bannerShown = false;

// Verificar se já foi dispensado
if (localStorage.getItem('update-dismissed') === 'true') {
  updateBanner.style.display = 'none';
}

// Detectar atualizações do Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    showUpdateBanner();
  });

  // Verificar se há uma nova versão disponível
  navigator.serviceWorker.getRegistration().then(registration => {
    if (registration) {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner();
          }
        });
      });
    }
  });
}

// Função para mostrar banner de atualização
function showUpdateBanner() {
  if (bannerShown || localStorage.getItem('update-dismissed') === 'true') {
    return;
  }
  
  updateBanner.style.display = 'block';
  updateBanner.classList.add('show');
  bannerShown = true;
  
  // Vibração se disponível
  navigator.vibrate?.(100);
}

// Botão atualizar
updateBtn.addEventListener('click', () => {
  if (updateWorker) {
    updateWorker.postMessage({ action: 'skipWaiting' });
  }
  window.location.reload();
});

// Botão dispensar atualização
updateDismiss.addEventListener('click', () => {
  updateBanner.style.display = 'none';
  updateBanner.classList.remove('show');
  bannerShown = false;
  localStorage.setItem('update-dismissed', 'true');
});

// Auto-hide após 10 segundos
setTimeout(() => {
  if (bannerShown && updateBanner.style.display !== 'none') {
    updateBanner.style.opacity = '0';
    setTimeout(() => {
      updateBanner.style.display = 'none';
      updateBanner.classList.remove('show');
      bannerShown = false;
    }, 300);
  }
}, 10000);

// === PERFORMANCE MONITORING ===
if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        // LCP monitoring
      }
    }
  });
  
  observer.observe({ entryTypes: ['largest-contentful-paint'] });
}

// === ACCESSIBILITY ENHANCEMENTS ===
// Melhorar navegação por teclado
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-navigation');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-navigation');
});

// === ANALYTICS ===
// Função para enviar eventos de analytics
function trackEvent(category, action, label) {
  // Implementar tracking de eventos
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      event_category: category,
      event_label: label
    });
  }
}

// Track PWA install
window.addEventListener('appinstalled', () => {
  trackEvent('PWA', 'install', 'app_installed');
});

// Track banner interactions
installBtn.addEventListener('click', () => {
  trackEvent('PWA', 'banner_install_click', 'install_button');
});

dismissBtn.addEventListener('click', () => {
  trackEvent('PWA', 'banner_dismiss', 'dismiss_button');
});

// Exportar funções para uso global
window.detectDesktop = detectDesktop;
window.trackEvent = trackEvent;
