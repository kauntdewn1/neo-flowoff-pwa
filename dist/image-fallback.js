// image-fallback.js - Sistema de fallback para imagens quebradas
class ImageFallback {
  constructor() {
    this.init();
  }

  // Função para sanitizar HTML
  sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Função para renderizar HTML de forma segura
  setSafeHTML(element, html) {
    element.innerHTML = html;
  }

  init() {
    // Aguardar DOM estar carregado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupImageFallbacks());
    } else {
      this.setupImageFallbacks();
    }
  }

  setupImageFallbacks() {
    // Detectar imagens quebradas nos cards
    this.handleCardImages();
    
    // Detectar imagens quebradas em geral
    this.handleAllImages();
  }

  handleCardImages() {
    const cardImages = document.querySelectorAll('.card-image');
    
    cardImages.forEach(img => {
      // Verificar se a imagem tem src válido
      if (!img.src || img.src.includes('undefined') || img.src.includes('null') || img.src === '') {
        this.replaceWithPlaceholder(img);
        return;
      }

      // Adicionar listeners para detectar falhas no carregamento
      img.addEventListener('error', () => {
        console.warn(`Imagem falhou ao carregar: ${img.src}`);
        this.replaceWithPlaceholder(img);
      });

      img.addEventListener('load', () => {
        // Remover classe de erro se a imagem carregou com sucesso
        img.classList.remove('image-error');
      });
    });
  }

  handleAllImages() {
    const allImages = document.querySelectorAll('img');
    
    allImages.forEach(img => {
      // Verificar se a imagem tem src válido
      if (!img.src || img.src.includes('undefined') || img.src.includes('null') || img.src === '') {
        this.replaceWithPlaceholder(img);
        return;
      }

      // Adicionar listener para detectar falhas no carregamento
      img.addEventListener('error', () => {
        console.warn(`Imagem falhou ao carregar: ${img.src}`);
        this.replaceWithPlaceholder(img);
      });
    });
  }

  replaceWithPlaceholder(img) {
    // Criar placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    
    // Determinar texto baseado no contexto
    const altText = img.alt || 'Imagem';
    const placeholderText = this.getPlaceholderText(altText);
    
    this.setSafeHTML(placeholder, `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <div style="font-size: 24px; opacity: 0.6;">🖼️</div>
        <div style="font-size: 12px; opacity: 0.8;">${this.sanitizeHTML(placeholderText)}</div>
      </div>
    `);
    
    // Substituir imagem pelo placeholder
    img.parentNode.replaceChild(placeholder, img);
    
    // Adicionar classe para identificar que foi substituída
    placeholder.classList.add('image-replaced');
  }

  getPlaceholderText(altText) {
    const textMap = {
      'WebApp': 'WebApp',
      'Dashboards Gamificados': 'Dashboard',
      'NEØ.FLOWOFF': 'NEØ.FLOWOFF',
      'Entre em contato': 'Contato',
      'MELLØ': 'MELLØ',
      'FlowOff': 'FlowOff',
      'POSTØN': 'POSTØN'
    };
    
    return textMap[altText] || altText || 'Imagem';
  }

  // Método para verificar se uma imagem existe
  async checkImageExists(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  // Método para tentar carregar imagem com fallbacks
  async loadImageWithFallbacks(img, fallbackSrcs = []) {
    // Tentar src original primeiro
    if (await this.checkImageExists(img.src)) {
      return true;
    }

    // Tentar fallbacks
    for (const fallbackSrc of fallbackSrcs) {
      if (await this.checkImageExists(fallbackSrc)) {
        img.src = fallbackSrc;
        return true;
      }
    }

    return false;
  }
}

// Inicializar sistema de fallback
const imageFallback = new ImageFallback();

// Exportar para uso global se necessário
if (typeof window !== 'undefined') {
  window.ImageFallback = ImageFallback;
  window.imageFallback = imageFallback;
}
