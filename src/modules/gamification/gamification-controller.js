/**
 * GamificationController (NEOFLW)
 * Sistema de gamificação integrado com NEOFLW Token
 * 
 * Funcionalidades:
 * - Níveis e progressão
 * - Missões e quests
 * - Pontos convertidos em NEOFLW
 * - Quests para ativação de leads
 */

import { logger } from '../../utils/logger.js';
import { getIdentityGraph } from '../neo-id/identity-graph.js';
import { getNEOFLWClient } from '../neoflw-token/token-client.js';

class GamificationController {
  constructor() {
    this.quests = [];
    this.missions = [];
    this.isInitialized = false;
    
    // Configuração de conversão: pontos → NEOFLW
    this.conversionRate = {
      points: 100, // 100 pontos = 1 NEOFLW
      decimals: 18
    };
  }

  /**
   * Inicializa o controller
   */
  async init() {
    try {
      // Carregar quests e missões
      await this.loadQuests();
      await this.loadMissions();
      
      this.isInitialized = true;
      logger.log('Gamification: Controller inicializado');
      return true;
    } catch (error) {
      logger.error('Gamification: Erro ao inicializar', error);
      return false;
    }
  }

  /**
   * Carrega quests disponíveis
   */
  async loadQuests() {
    // Quests padrão
    this.quests = [
      {
        id: 'lead_activation_1',
        name: 'Primeiro Lead',
        description: 'Ative seu primeiro lead',
        type: 'lead_activation',
        reward: {
          xp: 50,
          points: 100,
          badge: 'first_lead'
        },
        completed: false
      },
      {
        id: 'wallet_connect',
        name: 'Conecte sua Wallet',
        description: 'Conecte sua wallet pela primeira vez',
        type: 'wallet',
        reward: {
          xp: 25,
          points: 50,
          badge: 'wallet_connected'
        },
        completed: false
      },
      {
        id: 'first_stake',
        name: 'Primeiro Staking',
        description: 'Faça seu primeiro staking de NEOFLW',
        type: 'staking',
        reward: {
          xp: 100,
          points: 200,
          badge: 'staker'
        },
        completed: false
      },
      {
        id: 'social_share',
        name: 'Compartilhe FlowOFF',
        description: 'Compartilhe o FlowOFF nas redes sociais',
        type: 'social',
        reward: {
          xp: 15,
          points: 30
        },
        completed: false
      }
    ];
  }

  /**
   * Carrega missões disponíveis
   */
  async loadMissions() {
    this.missions = [
      {
        id: 'daily_login',
        name: 'Login Diário',
        description: 'Faça login 7 dias consecutivos',
        type: 'streak',
        target: 7,
        current: 0,
        reward: {
          xp: 200,
          points: 500,
          badge: 'dedicated'
        }
      },
      {
        id: 'referral_chain',
        name: 'Cadeia de Indicações',
        description: 'Indique 5 pessoas que se cadastrem',
        type: 'referral',
        target: 5,
        current: 0,
        reward: {
          xp: 500,
          points: 1000,
          badge: 'influencer'
        }
      }
    ];
  }

  /**
   * Completa uma quest
   */
  async completeQuest(questId) {
    if (!this.isInitialized) await this.init();

    const quest = this.quests.find(q => q.id === questId);
    if (!quest) {
      throw new Error(`Quest não encontrada: ${questId}`);
    }

    if (quest.completed) {
      logger.warn('Gamification: Quest já completada', questId);
      return quest;
    }

    const identity = getIdentityGraph();
    
    // Aplicar recompensas
    if (quest.reward.xp) {
      await identity.addXP(quest.reward.xp, `Quest: ${quest.name}`);
    }

    if (quest.reward.points) {
      await this.addPoints(quest.reward.points);
    }

    if (quest.reward.badge) {
      await identity.addBadge({
        id: quest.reward.badge,
        name: quest.name,
        icon: this.getBadgeIcon(quest.reward.badge)
      });
    }

    quest.completed = true;
    quest.completedAt = new Date().toISOString();

    logger.log('Gamification: Quest completada', quest);
    return quest;
  }

  /**
   * Adiciona pontos
   */
  async addPoints(amount, reason = '') {
    const identity = getIdentityGraph();
    const currentPoints = identity.getIdentity()?.points || 0;
    const newPoints = currentPoints + amount;

    await identity.updateAttribute('points', newPoints);

    // Verificar se pode converter em NEOFLW
    if (newPoints >= this.conversionRate.points) {
      await this.convertPointsToNEOFLW();
    }

    logger.log('Gamification: Pontos adicionados', { amount, total: newPoints, reason });
    return newPoints;
  }

  /**
   * Converte pontos em NEOFLW
   */
  async convertPointsToNEOFLW() {
    const identity = getIdentityGraph();
    const user = identity.getIdentity();
    const points = user.points || 0;

    if (points < this.conversionRate.points) {
      return { converted: 0, remaining: points };
    }

    const tokensToMint = Math.floor(points / this.conversionRate.points);
    const remainingPoints = points % this.conversionRate.points;

    // Atualizar pontos restantes
    await identity.updateAttribute('points', remainingPoints);

    // Aqui você chamaria o contrato para mintar tokens
    // Por enquanto, apenas registramos a conversão
    logger.log('Gamification: Conversão de pontos', {
      points,
      tokens: tokensToMint,
      remaining: remainingPoints
    });

    // TODO: Integrar com contrato de mint quando disponível
    // await getNEOFLWClient().mint(user.wallet, tokensToMint);

    return {
      converted: tokensToMint,
      remaining: remainingPoints
    };
  }

  /**
   * Ativa quest de lead
   */
  async activateLeadQuest(leadData) {
    const quest = this.quests.find(q => q.id === 'lead_activation_1' && !q.completed);
    if (quest) {
      await this.completeQuest('lead_activation_1');
      
      // Registrar lead no Identity Graph
      const identity = getIdentityGraph();
      await identity.updateAttribute('leadOrigin', leadData.origin || 'unknown');
      
      return quest;
    }
  }

  /**
   * Obtém progresso do usuário
   */
  getProgress() {
    const identity = getIdentityGraph();
    const user = identity.getIdentity();
    
    if (!user) {
      return null;
    }

    return {
      level: user.level || 1,
      xp: user.xp || 0,
      points: user.points || 0,
      badges: user.badges?.length || 0,
      questsCompleted: this.quests.filter(q => q.completed).length,
      questsTotal: this.quests.length,
      nextLevelXP: (user.level || 1) * 100
    };
  }

  /**
   * Obtém ícone do badge
   */
  getBadgeIcon(badgeId) {
    const icons = {
      'first_lead': '🎯',
      'wallet_connected': '🔗',
      'staker': '💰',
      'dedicated': '🔥',
      'influencer': '⭐'
    };
    return icons[badgeId] || '🏅';
  }

  /**
   * Lista quests disponíveis
   */
  getAvailableQuests() {
    return this.quests.filter(q => !q.completed);
  }

  /**
   * Lista missões ativas
   */
  getActiveMissions() {
    return this.missions;
  }
}

// Singleton
let gamificationInstance = null;

export function getGamificationController() {
  if (!gamificationInstance) {
    gamificationInstance = new GamificationController();
  }
  return gamificationInstance;
}

export default GamificationController;

