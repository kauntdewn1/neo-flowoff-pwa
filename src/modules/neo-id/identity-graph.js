/**
 * NEØ ID - Identity Graph
 * Sistema nervoso central do Protocolo NΞØ
 * 
 * Consolida identidade do usuário:
 * - nome, wallet, email, telegram, whatsapp
 * - histórico, staking, compras
 * - nível, progressão, badges
 * - agente responsável, origem do lead
 */

import { logger } from '../../utils/logger.js';

class IdentityGraph {
  constructor() {
    this.storage = {
      // Layer quente (localStorage para MVP)
      local: window.localStorage,
      // Layer blockchain (atributos verificáveis)
      blockchain: null,
      // Layer IPFS (metadados imutáveis)
      ipfs: null
    };
    
    this.currentUser = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa o Identity Graph
   */
  async init() {
    try {
      // Carregar identidade existente
      const stored = this.storage.local.getItem('neo_id');
      if (stored) {
        this.currentUser = JSON.parse(stored);
        logger.log('NEØ ID: Identidade carregada', this.currentUser);
      }
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      logger.error('NEØ ID: Erro ao inicializar', error);
      return false;
    }
  }

  /**
   * Cria ou atualiza identidade do usuário
   */
  async setIdentity(data) {
    if (!this.isInitialized) await this.init();

    const identity = {
      // Identificadores
      id: data.id || this.generateId(),
      name: data.name || null,
      email: data.email || null,
      wallet: data.wallet || null,
      telegram: data.telegram || null,
      whatsapp: data.whatsapp || null,
      
      // Progressão
      level: data.level || 1,
      xp: data.xp || 0,
      badges: data.badges || [],
      
      // Economia
      staking: data.staking || {
        total: 0,
        active: 0,
        rewards: 0
      },
      purchases: data.purchases || [],
      
      // Rastreamento
      agent: data.agent || null,
      leadOrigin: data.leadOrigin || null,
      history: data.history || [],
      
      // Metadados
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    // Atualizar histórico
    identity.history.push({
      action: data.id ? 'update' : 'create',
      timestamp: new Date().toISOString(),
      data: Object.keys(data)
    });

    this.currentUser = identity;
    this.persist();
    
    logger.log('NEØ ID: Identidade atualizada', identity);
    return identity;
  }

  /**
   * Obtém identidade atual
   */
  getIdentity() {
    return this.currentUser;
  }

  /**
   * Atualiza atributo específico
   */
  async updateAttribute(key, value) {
    if (!this.currentUser) {
      await this.setIdentity({});
    }

    this.currentUser[key] = value;
    this.currentUser.updatedAt = new Date().toISOString();
    this.currentUser.history.push({
      action: 'update_attribute',
      key,
      timestamp: new Date().toISOString()
    });

    this.persist();
    return this.currentUser;
  }

  /**
   * Adiciona badge
   */
  async addBadge(badge) {
    if (!this.currentUser) await this.setIdentity({});
    
    if (!this.currentUser.badges.find(b => b.id === badge.id)) {
      this.currentUser.badges.push({
        ...badge,
        earnedAt: new Date().toISOString()
      });
      
      await this.updateAttribute('badges', this.currentUser.badges);
      logger.log('NEØ ID: Badge adicionado', badge);
    }
    
    return this.currentUser;
  }

  /**
   * Adiciona XP e atualiza nível
   */
  async addXP(amount, reason = '') {
    if (!this.currentUser) await this.setIdentity({});
    
    this.currentUser.xp += amount;
    
    // Calcular novo nível (exemplo: 100 XP por nível)
    const newLevel = Math.floor(this.currentUser.xp / 100) + 1;
    if (newLevel > this.currentUser.level) {
      this.currentUser.level = newLevel;
      logger.log(`NEØ ID: Level up! Nível ${newLevel}`);
    }
    
    this.currentUser.history.push({
      action: 'xp_gained',
      amount,
      reason,
      timestamp: new Date().toISOString()
    });
    
    await this.updateAttribute('xp', this.currentUser.xp);
    await this.updateAttribute('level', this.currentUser.level);
    
    return { xp: this.currentUser.xp, level: this.currentUser.level };
  }

  /**
   * Registra compra
   */
  async recordPurchase(purchase) {
    if (!this.currentUser) await this.setIdentity({});
    
    const purchaseRecord = {
      id: this.generateId(),
      ...purchase,
      timestamp: new Date().toISOString()
    };
    
    this.currentUser.purchases.push(purchaseRecord);
    await this.updateAttribute('purchases', this.currentUser.purchases);
    
    return purchaseRecord;
  }

  /**
   * Atualiza staking
   */
  async updateStaking(stakingData) {
    if (!this.currentUser) await this.setIdentity({});
    
    this.currentUser.staking = {
      ...this.currentUser.staking,
      ...stakingData,
      updatedAt: new Date().toISOString()
    };
    
    await this.updateAttribute('staking', this.currentUser.staking);
    return this.currentUser.staking;
  }

  /**
   * Persiste identidade (localStorage para MVP)
   */
  persist() {
    try {
      this.storage.local.setItem('neo_id', JSON.stringify(this.currentUser));
    } catch (error) {
      logger.error('NEØ ID: Erro ao persistir', error);
    }
  }

  /**
   * Gera ID único
   */
  generateId() {
    return 'neo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Exporta identidade (para backup/IPFS)
   */
  export() {
    return JSON.stringify(this.currentUser, null, 2);
  }

  /**
   * Limpa identidade (logout)
   */
  clear() {
    this.currentUser = null;
    this.storage.local.removeItem('neo_id');
    logger.log('NEØ ID: Identidade limpa');
  }
}

// Singleton
let identityGraphInstance = null;

export function getIdentityGraph() {
  if (!identityGraphInstance) {
    identityGraphInstance = new IdentityGraph();
  }
  return identityGraphInstance;
}

export default IdentityGraph;

