// index-scripts.js - Scripts específicos do index.html

// === DETECÇÃO DE DESKTOP COM PREVENÇÃO DE LOOPS ===
function detectDesktop() {
  // Verificar se usuário forçou modo desktop
  const forceDesktop = localStorage.getItem('force-desktop');
  if (forceDesktop === 'true') {
    return false; // Não redirecionar
  }

  // Verificar se é desktop baseado em várias características
  const isDesktop = window.innerWidth >= 1024 && 
                   window.innerHeight >= 768 && 
                   !navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i) &&
                   !('ontouchstart' in window) &&
                   window.matchMedia('(pointer: fine)').matches;
  
  if (isDesktop) {
    // Verificar se já está na página desktop
    if (!window.location.pathname.includes('desktop.html')) {
      // Prevenir loop: verificar se não veio do desktop.html recentemente
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

// Fallback: Mostrar banner após 3 segundos se não foi dispensado
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
      window.Logger?.error('Erro ao instalar PWA:', error);
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

// === MENU HAMBÚRGUER ===
const menuToggle = document.getElementById('menu-toggle');
const headerMenu = document.getElementById('header-menu');
const menuOverlay = document.createElement('div');
menuOverlay.className = 'menu-overlay';
document.body.appendChild(menuOverlay);

if (menuToggle && headerMenu) {
  // Toggle menu
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    menuToggle.classList.toggle('active');
    headerMenu.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    document.body.style.overflow = headerMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Fechar ao clicar no overlay
  menuOverlay.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    headerMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
  });

  // Fechar ao clicar em um link
  const menuLinks = headerMenu.querySelectorAll('.menu-link');
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Se estiver na home, fazer scroll suave
      const currentRoute = document.querySelector('.route.active');
      if (currentRoute && currentRoute.id === 'home') {
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          e.preventDefault();
          const headerHeight = document.querySelector('.topbar').offsetHeight;
          const targetPosition = targetElement.offsetTop - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
      
      // Fechar menu após um pequeno delay
      setTimeout(() => {
        menuToggle.classList.remove('active');
        headerMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }, 300);
    });
  });

  // Fechar ao pressionar ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && headerMenu.classList.contains('active')) {
      menuToggle.classList.remove('active');
      headerMenu.classList.remove('active');
      menuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

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

window.addEventListener('scroll', requestTick, { passive: true });

// === GLASS MORPHISM OVERLAY CONTROL ===
const glassOverlay = document.getElementById('glass-overlay');
let overlayTicking = false;

function updateGlassOverlay() {
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  
  // Calcular se deve mostrar o overlay
  const shouldShowOverlay = scrollY > 100 && (scrollY + windowHeight) < (documentHeight - 50);
  
  if (shouldShowOverlay) {
    glassOverlay.classList.add('active');
  } else {
    glassOverlay.classList.remove('active');
  }
  
  overlayTicking = false;
}

function requestOverlayTick() {
  if (!overlayTicking) {
    requestAnimationFrame(updateGlassOverlay);
    overlayTicking = true;
  }
}

window.addEventListener('scroll', requestOverlayTick, { passive: true });

// Atualizar na carga inicial
updateGlassOverlay();

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
  // Recarregar a página para aplicar atualizações
  window.location.reload();
});

// Botão dispensar
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
      pwaBannerShown = false;
    }, 300);
  }
}, 10000);

// Função para testar o banner manualmente (debug)
window.testUpdateBanner = () => {
  if (updateBanner) {
    updateBanner.style.display = 'block';
    updateBanner.classList.add('show');
    pwaBannerShown = true;
  }
};

// Função para limpar o estado do banner (debug)
window.clearUpdateState = () => {
  localStorage.removeItem('update-dismissed');
};

// Verificar atualizações periodicamente (a cada 5 minutos)
setInterval(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration) {
        registration.update();
      }
    });
  }
}, 5 * 60 * 1000); // 5 minutos

// === MODAIS DOS PROJETOS ===
document.addEventListener('DOMContentLoaded', function() {
  // Event listeners para abrir modais
  document.querySelectorAll('[data-modal]').forEach(item => {
    item.addEventListener('click', function() {
      const modalId = this.getAttribute('data-modal');
      const modal = document.getElementById(`modal-${modalId}`);
      if (modal) {
        modal.showModal();
        document.body.style.overflow = 'hidden'; // Previne scroll do body
        document.body.classList.add('modal-open'); // Adiciona classe para escurecer fundo
      }
    });
  });

  // Event listeners para fechar modais
  document.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', function() {
      const modalId = this.getAttribute('data-close');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.close();
        document.body.style.overflow = ''; // Restaura scroll do body
        document.body.classList.remove('modal-open'); // Remove classe para restaurar fundo
      }
    });
  });

  // Fechar modal clicando fora dele
  document.querySelectorAll('.project-modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.close();
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open'); // Remove classe para restaurar fundo
      }
    });
  });

  // Garantir que todos os modais estejam fechados ao carregar
  document.addEventListener('DOMContentLoaded', function() {
    const modals = document.querySelectorAll('.project-modal');
    modals.forEach(modal => {
      if (modal.open) {
        modal.close();
      }
    });
    document.body.style.overflow = '';
  });

  // Fechar modal com ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const openModal = document.querySelector('.project-modal[open]');
      if (openModal) {
        openModal.close();
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open'); // Remove classe para restaurar fundo
      }
    }
  });
});