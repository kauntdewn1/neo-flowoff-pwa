/**
 * Integração Thirdweb SDK
 * Conecta o Protocolo NΞØ com a blockchain via Thirdweb
 */

import { createThirdwebClient, getContract } from 'thirdweb';
import { sepolia, polygon } from 'thirdweb/chains';
import { logger } from '../../utils/logger.js';
import { NEO_PROTOCOL_CONFIG } from '../../../config/neo-protocol.config.js';

class ThirdwebIntegration {
  constructor() {
    this.client = null;
    this.chain = null;
    this.contract = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa o cliente Thirdweb
   */
  async init(config = {}) {
    try {
      const thirdwebConfig = config.thirdweb || NEO_PROTOCOL_CONFIG.thirdweb;
      const blockchainConfig = NEO_PROTOCOL_CONFIG.blockchain;

      // Criar cliente Thirdweb
      if (thirdwebConfig.clientId) {
        this.client = createThirdwebClient({
          clientId: thirdwebConfig.clientId
        });
      } else {
        // Modo desenvolvimento sem clientId (funciona para leitura)
        logger.warn('Thirdweb: ClientId não configurado. Modo leitura apenas.');
        this.client = createThirdwebClient({
          clientId: 'demo' // Placeholder
        });
      }

      // Selecionar chain (Polygon Mainnet como padrão)
      const defaultChain = config.chain || thirdwebConfig.defaultChain || 'polygon';
      this.chain = defaultChain === 'polygon' ? polygon : sepolia;

      // Obter contrato
      const contractAddress = blockchainConfig[defaultChain]?.contractAddress;
      if (contractAddress) {
        this.contract = getContract({
          client: this.client,
          chain: this.chain,
          address: contractAddress
        });
        
        logger.log('Thirdweb: Contrato conectado', {
          chain: defaultChain,
          address: contractAddress
        });
      } else {
        logger.warn('Thirdweb: Endereço do contrato não configurado');
      }

      this.isInitialized = true;
      return this.client;
    } catch (error) {
      logger.error('Thirdweb: Erro ao inicializar', error);
      throw error;
    }
  }

  /**
   * Obtém o cliente Thirdweb
   */
  getClient() {
    if (!this.isInitialized) {
      throw new Error('Thirdweb não inicializado. Chame init() primeiro.');
    }
    return this.client;
  }

  /**
   * Obtém o contrato
   */
  getContract() {
    if (!this.contract) {
      throw new Error('Contrato não disponível. Verifique a configuração.');
    }
    return this.contract;
  }

  /**
   * Obtém a chain atual
   */
  getChain() {
    return this.chain;
  }

  /**
   * Verifica se está inicializado
   */
  isReady() {
    return this.isInitialized && this.client !== null;
  }
}

// Singleton
let thirdwebInstance = null;

export function getThirdwebIntegration() {
  if (!thirdwebInstance) {
    thirdwebInstance = new ThirdwebIntegration();
  }
  return thirdwebInstance;
}

export default ThirdwebIntegration;

