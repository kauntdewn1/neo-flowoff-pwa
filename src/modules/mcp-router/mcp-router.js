/**
 * MCP Router v1.1
 * Central de comunicação entre módulos do Protocolo NΞØ
 * 
 * Funciona como sistema nervoso central conectando:
 * - Identity Graph (NEØ ID)
 * - NEOFLW Token
 * - GamificationController
 * - FlowPay
 * - Agentes (MCP)
 */

import { logger } from '../../utils/logger.js';
import { getIdentityGraph } from '../neo-id/identity-graph.js';
import { getNEOFLWClient } from '../neoflw-token/token-client.js';
import { getGamificationController } from '../gamification/gamification-controller.js';
import { getFlowPayClient } from '../flowpay/flowpay-client.js';

class MCPRouter {
  constructor() {
    this.modules = {
      identity: null,
      token: null,
      gamification: null,
      flowpay: null
    };
    
    this.routes = new Map();
    this.isInitialized = false;
  }

  /**
   * Inicializa o router e todos os módulos
   */
  async init(config = {}) {
    try {
      logger.log('MCP Router: Inicializando módulos...');

      // Inicializar Identity Graph primeiro (base de tudo)
      this.modules.identity = getIdentityGraph();
      await this.modules.identity.init();
      logger.log('MCP Router: ✅ Identity Graph inicializado');

      // Inicializar NEOFLW Token (se SDK fornecido)
      if (config.thirdwebSDK) {
        this.modules.token = getNEOFLWClient();
        await this.modules.token.init(config.thirdwebSDK);
        logger.log('MCP Router: ✅ NEOFLW Token inicializado');
      }

      // Inicializar Gamification
      this.modules.gamification = getGamificationController();
      await this.modules.gamification.init();
      logger.log('MCP Router: ✅ Gamification inicializado');

      // Inicializar FlowPay
      this.modules.flowpay = getFlowPayClient();
      await this.modules.flowpay.init();
      logger.log('MCP Router: ✅ FlowPay inicializado');

      // Registrar rotas
      this.registerRoutes();

      this.isInitialized = true;
      logger.log('MCP Router: ✅ Todos os módulos inicializados');
      return true;
    } catch (error) {
      logger.error('MCP Router: Erro ao inicializar', error);
      return false;
    }
  }

  /**
   * Registra rotas de comunicação
   */
  registerRoutes() {
    // Rota: obter perfil completo do usuário
    this.routes.set('user.profile', async () => {
      const identity = this.modules.identity.getIdentity();
      const tokenBalance = this.modules.token 
        ? await this.modules.token.getBalance(identity?.wallet).catch(() => null)
        : null;
      const progress = this.modules.gamification.getProgress();

      return {
        identity,
        token: {
          balance: tokenBalance,
          contract: this.modules.token?.contractAddress
        },
        gamification: progress
      };
    });

    // Rota: processar ação do usuário (com gamificação automática)
    this.routes.set('action.process', async (action) => {
      const { type, data } = action;
      
      let result = {};

      switch (type) {
        case 'lead_activation':
          result = await this.modules.gamification.activateLeadQuest(data);
          break;
        
        case 'wallet_connect':
          await this.modules.identity.updateAttribute('wallet', data.wallet);
          result = await this.modules.gamification.completeQuest('wallet_connect');
          break;
        
        case 'payment':
          const payment = await this.modules.flowpay.checkPaymentStatus(data.checkoutId);
          result = { payment, cashback: await this.modules.flowpay.processCashback(payment) };
          break;
        
        case 'staking':
          await this.modules.identity.updateStaking(data);
          result = await this.modules.gamification.completeQuest('first_stake');
          break;
      }

      return result;
    });

    // Rota: obter quests disponíveis
    this.routes.set('gamification.quests', async () => {
      return {
        available: this.modules.gamification.getAvailableQuests(),
        active: this.modules.gamification.getActiveMissions()
      };
    });
  }

  /**
   * Roteia requisição para módulo apropriado
   */
  async route(path, params = {}) {
    if (!this.isInitialized) {
      throw new Error('MCP Router: Não inicializado');
    }

    const handler = this.routes.get(path);
    if (!handler) {
      throw new Error(`MCP Router: Rota não encontrada: ${path}`);
    }

    try {
      return await handler(params);
    } catch (error) {
      logger.error(`MCP Router: Erro na rota ${path}`, error);
      throw error;
    }
  }

  /**
   * Obtém módulo específico
   */
  getModule(name) {
    return this.modules[name] || null;
  }

  /**
   * Verifica status de todos os módulos
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      modules: {
        identity: !!this.modules.identity,
        token: !!this.modules.token,
        gamification: !!this.modules.gamification,
        flowpay: !!this.modules.flowpay
      },
      routes: Array.from(this.routes.keys())
    };
  }
}

// Singleton
let mcpRouterInstance = null;

export function getMCPRouter() {
  if (!mcpRouterInstance) {
    mcpRouterInstance = new MCPRouter();
  }
  return mcpRouterInstance;
}

export default MCPRouter;

