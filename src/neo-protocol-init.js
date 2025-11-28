/**
 * Inicialização do Protocolo NΞØ
 * Integração modular no PWA FlowOFF
 */

import { getMCPRouter } from './modules/index.js';
import { logger } from './utils/logger.js';

// Variável global para acesso aos módulos
window.NEOPROTOCOL = {
  router: null,
  initialized: false
};

/**
 * Inicializa o Protocolo NΞØ
 */
export async function initNEOPROTOCOL(config = {}) {
  try {
    logger.log('🧬 Inicializando Protocolo NΞØ...');

    const router = getMCPRouter();
    
    // Configuração padrão
    const initConfig = {
      thirdwebSDK: config.thirdwebSDK || null,
      ...config
    };

    // Inicializar router (que inicializa todos os módulos)
    const success = await router.init(initConfig);
    
    if (success) {
      window.NEOPROTOCOL.router = router;
      window.NEOPROTOCOL.initialized = true;
      
      logger.log('✅ Protocolo NΞØ inicializado com sucesso');
      
      // Disparar evento customizado
      window.dispatchEvent(new CustomEvent('neoprotocol:ready', {
        detail: { router, status: router.getStatus() }
      }));
      
      return router;
    } else {
      throw new Error('Falha ao inicializar módulos');
    }
  } catch (error) {
    logger.error('❌ Erro ao inicializar Protocolo NΞØ', error);
    window.NEOPROTOCOL.initialized = false;
    throw error;
  }
}

/**
 * Helper para obter router
 */
export function getRouter() {
  if (!window.NEOPROTOCOL.initialized) {
    throw new Error('Protocolo NΞØ não inicializado. Chame initNEOPROTOCOL() primeiro.');
  }
  return window.NEOPROTOCOL.router;
}

/**
 * Helper para verificar se está inicializado
 */
export function isInitialized() {
  return window.NEOPROTOCOL.initialized;
}

// Auto-inicialização quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sem Thirdweb SDK (será adicionado depois)
    initNEOPROTOCOL().catch(err => {
      logger.warn('Protocolo NΞØ: Inicialização automática falhou', err);
    });
  });
} else {
  // DOM já carregado
  initNEOPROTOCOL().catch(err => {
    logger.warn('Protocolo NΞØ: Inicialização automática falhou', err);
  });
}

export default {
  init: initNEOPROTOCOL,
  getRouter,
  isInitialized
};

