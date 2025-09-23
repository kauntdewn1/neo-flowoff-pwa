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
    
    images.forEach(img => {
      const pngSrc = img.src;
      const webpSrc = pngSrc.replace('.png', '.webp');
      
      if (this.supportsWebP) {
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
