// webp-support.js - Suporte automático para WebP com fallback
class WebPSupport {
  constructor() {
    this.supportsWebP = false;
    this.checkWebPSupport();
  }

  // Verificar suporte a WebP
  checkWebPSupport() {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      this.supportsWebP = (webP.height === 2);
      this.updateImages();
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  }

  // Atualizar todas as imagens para usar WebP quando suportado
  updateImages() {
    const images = document.querySelectorAll('img[src*=".png"]');
    
    // Lista de arquivos que têm versão WebP disponível
    const webpAvailable = [
      'public/card.png',
      'public/flowoff logo.png',
      'public/icon-512.png',
      'public/poston.png',
      'public/poston_home.png',
      'public/logos/card-logo.png',
      'public/logos/flowoff logo.png',
      'public/logos/proia.png',
      'public/logos/NEO_LAST.png',
      'public/logos/POSTON.png',
      'public/logos/geometrico.png',
      'public/logos/holografic.png',
      'public/logos/metalica.png',
      'public/logos/pink_metalic.png',
      'public/icons/icon-48x48.png',
      'public/icons/icon-72x72.png',
      'public/icons/icon-96x96.png',
      'public/icons/icon-128x128.png',
      'public/icons/icon-144x144.png',
      'public/icons/icon-152x152.png',
      'public/icons/icon-192x192.png',
      'public/icons/icon-256x256.png',
      'public/icons/icon-384x384.png',
      'public/icons/icon-512x512.png'
    ];
    
    images.forEach(img => {
      const pngSrc = img.src;
      const webpSrc = pngSrc.replace('.png', '.webp');
      
      // Só tentar converter se o arquivo WebP existe
      const hasWebP = webpAvailable.some(file => pngSrc.includes(file));
      
      if (this.supportsWebP && hasWebP) {
        // Criar nova imagem WebP
        const webpImg = new Image();
        webpImg.onload = () => {
          img.src = webpSrc;
          img.classList.add('webp-loaded');
        };
        webpImg.onerror = () => {
          // Fallback para PNG se WebP falhar
          img.classList.add('webp-fallback');
        };
        webpImg.src = webpSrc;
      } else {
        // Usar PNG original
        img.classList.add('webp-not-supported');
      }
    });
  }

  // Função para substituir src de imagem específica
  replaceImageSrc(selector, webpSrc, pngSrc) {
    const img = document.querySelector(selector);
    if (img) {
      if (this.supportsWebP) {
        img.src = webpSrc;
        img.classList.add('webp-loaded');
      } else {
        img.src = pngSrc;
        img.classList.add('webp-not-supported');
      }
    }
  }
}

// Inicializar quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  window.webpSupport = new WebPSupport();
});

// Exportar para uso global
window.WebPSupport = WebPSupport;
