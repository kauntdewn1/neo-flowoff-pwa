/**
 * UI Component para Protocolo NΞØ
 * Renderiza perfil, progresso, badges, quests e histórico
 */

import { logger } from './utils/logger.js';

class NEOPROTOCOLUI {
  constructor() {
    this.router = null;
    this.updateInterval = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa a UI do Protocolo NΞØ
   */
  async init() {
    try {
      logger.log('NEOPROTOCOL UI: Inicializando...');

      // Aguardar Protocolo NΞØ estar pronto
      if (!window.NEOPROTOCOL?.initialized) {
        await this.waitForProtocol();
      }

      this.router = window.NEOPROTOCOL.router;
      this.isInitialized = true;

      // Renderizar componentes
      await this.render();

      // Iniciar atualização automática
      this.startAutoUpdate();

      // Listener para eventos do Protocolo NΞØ
      this.setupEventListeners();

      logger.log('NEOPROTOCOL UI: ✅ Inicializada com sucesso');
    } catch (error) {
      logger.error('NEOPROTOCOL UI: Erro ao inicializar', error);
    }
  }

  /**
   * Aguarda Protocolo NΞØ estar inicializado
   */
  async waitForProtocol(maxAttempts = 50) {
    let attempts = 0;
    while (!window.NEOPROTOCOL?.initialized && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.NEOPROTOCOL?.initialized) {
      throw new Error('Protocolo NΞØ não inicializado');
    }
  }

  /**
   * Renderiza todos os componentes
   */
  async render() {
    if (!this.router) return;

    try {
      await Promise.all([
        this.renderProfile(),
        this.renderBadges(),
        this.renderQuests(),
        this.renderBalance(),
        this.renderHistory()
      ]);
    } catch (error) {
      logger.error('NEOPROTOCOL UI: Erro ao renderizar', error);
    }
  }

  /**
   * Renderiza card de perfil
   */
  async renderProfile() {
    const container = document.getElementById('neo-profile-card');
    if (!container) return;

    try {
      const identity = this.router.getModule('identity');
      const gamification = this.router.getModule('gamification');
      
      const user = identity.getIdentity();
      const progress = gamification.getProgress();

      if (!user) {
        container.innerHTML = `
          <div class="neo-empty-state">
            <div class="empty-icon">👤</div>
            <h3>Nenhuma identidade registrada</h3>
            <p>Complete ações no FlowOFF para começar a ganhar XP e badges!</p>
            <div class="neo-empty-actions">
              <button class="btn primary" onclick="window.neoUI?.createDemoIdentity()">
                🎮 Criar Identidade Demo
              </button>
              <button class="btn ghost" onclick="go('start')">
                📝 Preencher Formulário
              </button>
            </div>
          </div>
        `;
        return;
      }

      const xpPercent = progress.nextLevelXP > 0 
        ? Math.min(100, (progress.xp / progress.nextLevelXP) * 100)
        : 0;

      const hasWallet = user?.wallet;
      
      container.innerHTML = `
        <div class="neo-profile-header">
          <div class="neo-avatar">
            <div class="neo-avatar-circle">${user.name ? user.name.charAt(0).toUpperCase() : '👤'}</div>
            <div class="neo-level-badge">Nível ${progress.level}</div>
          </div>
          <div class="neo-profile-info">
            <h3>${user.name || 'Visitante'}</h3>
            <p>${user.email || 'Conecte-se para começar'}</p>
            ${hasWallet ? `
              <p class="neo-wallet-badge">
                <span class="neo-wallet-icon">🔗</span>
                ${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}
              </p>
            ` : ''}
          </div>
        </div>
        
        <div class="neo-xp-section">
          <div class="neo-xp-bar">
            <div class="neo-xp-fill" style="width: ${xpPercent}%"></div>
            <span class="neo-xp-text">${progress.xp} / ${progress.nextLevelXP} XP</span>
          </div>
          <div class="neo-level-info">
            <span>Nível ${progress.level}</span>
            <span>→ Nível ${progress.level + 1}</span>
          </div>
        </div>

        <div class="neo-stats">
          <div class="neo-stat-item">
            <div class="neo-stat-value">${progress.points || 0}</div>
            <div class="neo-stat-label">Pontos</div>
          </div>
          <div class="neo-stat-item">
            <div class="neo-stat-value">${progress.badges || 0}</div>
            <div class="neo-stat-label">Badges</div>
          </div>
          <div class="neo-stat-item">
            <div class="neo-stat-value">${progress.questsCompleted || 0}</div>
            <div class="neo-stat-label">Quests</div>
          </div>
        </div>
        
        ${!hasWallet ? `
          <div class="neo-profile-actions">
            <button class="btn primary small" onclick="window.neoUI?.connectWallet()">
              🔗 Conectar Wallet
            </button>
          </div>
        ` : ''}
      `;
    } catch (error) {
      logger.error('NEOPROTOCOL UI: Erro ao renderizar perfil', error);
      container.innerHTML = `<p class="neo-error">Erro ao carregar perfil</p>`;
    }
  }

  /**
   * Renderiza card de badges
   */
  async renderBadges() {
    const container = document.getElementById('neo-badges-card');
    if (!container) return;

    try {
      const identity = this.router.getModule('identity');
      const gamification = this.router.getModule('gamification');
      
      const user = identity.getIdentity();
      const badges = user?.badges || [];

      if (badges.length === 0) {
        container.innerHTML = `
          <h4>🏅 Badges Ganhos</h4>
          <div class="neo-empty-state">
            <div class="empty-icon">🏅</div>
            <p>Nenhum badge ainda. Complete quests para desbloquear!</p>
            <div class="neo-empty-actions">
              <button class="btn ghost small" onclick="window.neoUI?.viewQuests()">
                Ver Quests Disponíveis
              </button>
            </div>
          </div>
        `;
        return;
      }

      let badgesHTML = badges.map(badge => {
        const icon = gamification.getBadgeIcon(badge.id) || badge.icon || '🏅';
        return `
          <div class="neo-badge-item" title="${badge.name}">
            <div class="neo-badge-icon">${icon}</div>
            <div class="neo-badge-name">${badge.name}</div>
            ${badge.earnedAt ? `<div class="neo-badge-date">${new Date(badge.earnedAt).toLocaleDateString('pt-BR')}</div>` : ''}
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <h4>🏅 Badges Ganhos (${badges.length})</h4>
        <div class="neo-badges-grid">
          ${badgesHTML}
        </div>
      `;
    } catch (error) {
      logger.error('NEOPROTOCOL UI: Erro ao renderizar badges', error);
    }
  }

  /**
   * Renderiza card de quests
   */
  async renderQuests() {
    const container = document.getElementById('neo-quests-card');
    if (!container) return;

    try {
      const gamification = this.router.getModule('gamification');
      const quests = gamification.getAvailableQuests();
      const allQuests = gamification.quests || [];

      if (allQuests.length === 0) {
        container.innerHTML = `
          <h4>🎯 Quests Disponíveis</h4>
          <div class="neo-empty-state">
            <div class="empty-icon">🎯</div>
            <p>Nenhuma quest disponível no momento.</p>
            <div class="neo-empty-actions">
              <button class="btn ghost small" onclick="go('start')">
                📝 Preencher Formulário para Ativar
              </button>
            </div>
          </div>
        `;
        return;
      }

      let questsHTML = allQuests.map(quest => {
        const isCompleted = quest.completed || false;
        const icon = isCompleted ? '✅' : '⏳';
        const statusClass = isCompleted ? 'neo-quest-completed' : 'neo-quest-active';

        let rewardsHTML = '';
        if (quest.reward) {
          const rewards = [];
          if (quest.reward.xp > 0) rewards.push(`⭐ ${quest.reward.xp} XP`);
          if (quest.reward.points > 0) rewards.push(`💰 ${quest.reward.points} pontos`);
          if (quest.reward.badge) {
            const badgeIcon = gamification.getBadgeIcon(quest.reward.badge);
            rewards.push(`${badgeIcon} Badge`);
          }
          rewardsHTML = `<div class="neo-quest-rewards">${rewards.join(' • ')}</div>`;
        }

        return `
          <div class="neo-quest-item ${statusClass}" data-quest-id="${quest.id}">
            <div class="neo-quest-icon">${icon}</div>
            <div class="neo-quest-info">
              <h5>${quest.name}</h5>
              <p>${quest.description || ''}</p>
              ${rewardsHTML}
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <h4>🎯 Quests Disponíveis</h4>
        <div class="neo-quests-list">
          ${questsHTML}
        </div>
      `;
    } catch (error) {
      logger.error('NEOPROTOCOL UI: Erro ao renderizar quests', error);
    }
  }

  /**
   * Renderiza card de saldo NEOFLW
   */
  async renderBalance() {
    const container = document.getElementById('neo-token-card');
    if (!container) return;

    try {
      const identity = this.router.getModule('identity');
      const token = this.router.getModule('token');
      const gamification = this.router.getModule('gamification');
      
      const user = identity.getIdentity();
      const progress = gamification.getProgress();
      const hasWallet = user?.wallet;

      let balanceHTML = '';
      if (hasWallet && token) {
        try {
          const balance = await token.getBalance(user.wallet);
          balanceHTML = `
            <div class="neo-token-balance">
              <div class="neo-balance-amount">${balance || '0'} NEOFLW</div>
              <div class="neo-balance-label">Saldo na wallet</div>
            </div>
          `;
        } catch (error) {
          logger.warn('NEOPROTOCOL UI: Erro ao buscar saldo', error);
        }
      }

      const points = progress.points || 0;
      const canConvert = points >= 1000; // Taxa de conversão

      container.innerHTML = `
        <h4>💰 NEOFLW Token</h4>
        ${balanceHTML || `
          <div class="neo-empty-state">
            <div class="empty-icon">💼</div>
            <p>Conecte sua wallet para ver seu saldo NEOFLW</p>
          </div>
        `}
        <div class="neo-token-actions">
          ${hasWallet ? `
            <div class="neo-points-info">
              <p>Você tem <strong>${points} pontos</strong></p>
              ${canConvert ? `
                <button class="btn primary small" onclick="window.neoUI?.convertPoints()">
                  Converter ${points} pontos → NEOFLW
                </button>
              ` : `
                <p class="neo-muted">Precisa de 1000 pontos para converter</p>
              `}
            </div>
          ` : `
            <div class="neo-wallet-prompt">
              <button class="btn primary block" onclick="window.neoUI?.connectWallet()">
                🔗 Conectar Wallet
              </button>
              <p class="neo-muted small">Conecte para ver saldo e converter pontos</p>
            </div>
          `}
        </div>
      `;
    } catch (error) {
      logger.error('NEOPROTOCOL UI: Erro ao renderizar saldo', error);
    }
  }

  /**
   * Renderiza histórico de ações
   */
  async renderHistory() {
    const container = document.getElementById('neo-history-card');
    if (!container) return;

    try {
      const identity = this.router.getModule('identity');
      const user = identity.getIdentity();
      const history = user?.history || [];

      if (history.length === 0) {
        container.innerHTML = `
          <h4>📜 Histórico de Ações</h4>
          <div class="neo-empty-state">
            <div class="empty-icon">📜</div>
            <p>Nenhuma ação registrada ainda.</p>
            <div class="neo-empty-actions">
              <button class="btn ghost small" onclick="go('start')">
                🚀 Começar Agora
              </button>
            </div>
          </div>
        `;
        return;
      }

      // Ordenar por data (mais recente primeiro)
      const sortedHistory = [...history].sort((a, b) => {
        const dateA = new Date(a.timestamp || a.date || 0);
        const dateB = new Date(b.timestamp || b.date || 0);
        return dateB - dateA;
      }).slice(0, 10); // Últimas 10 ações

      let historyHTML = sortedHistory.map(action => {
        const icon = this.getActionIcon(action.type);
        const date = action.timestamp || action.date;
        const dateStr = date ? new Date(date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) : '';

        return `
          <div class="neo-history-item">
            <div class="neo-history-icon">${icon}</div>
            <div class="neo-history-content">
              <div class="neo-history-action">${action.description || action.type}</div>
              <div class="neo-history-meta">
                ${action.xp > 0 ? `<span class="neo-xp-gain">+${action.xp} XP</span>` : ''}
                ${dateStr ? `<span class="neo-history-date">${dateStr}</span>` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <h4>📜 Histórico de Ações</h4>
        <div class="neo-history-timeline">
          ${historyHTML}
        </div>
      `;
    } catch (error) {
      logger.error('NEOPROTOCOL UI: Erro ao renderizar histórico', error);
    }
  }

  /**
   * Obtém ícone para tipo de ação
   */
  getActionIcon(type) {
    const icons = {
      'lead_activation': '🎯',
      'wallet_connect': '🔗',
      'xp_gained': '⭐',
      'badge_earned': '🏅',
      'quest_completed': '✅',
      'points_converted': '💰',
      'staking': '🔒',
      'payment': '💳'
    };
    return icons[type] || '📝';
  }

  /**
   * Configura listeners de eventos
   */
  setupEventListeners() {
    // Listener para eventos do Protocolo NΞØ
    window.addEventListener('neoprotocol:action', (event) => {
      const { type, data } = event.detail;
      this.handleProtocolEvent(type, data);
    });

    // Listener para quando a rota protocol for acessada
    const protocolSection = document.getElementById('protocol');
    if (protocolSection) {
      const observer = new MutationObserver(() => {
        if (protocolSection.classList.contains('active')) {
          this.render();
        }
      });
      observer.observe(protocolSection, { attributes: true, attributeFilter: ['class'] });
    }
  }

  /**
   * Trata eventos do Protocolo NΞØ
   */
  handleProtocolEvent(type, data) {
    switch (type) {
      case 'xp_gained':
        this.renderProfile();
        this.showNotification(`+${data.xp} XP ganho!`, 'success');
        break;
      case 'badge_earned':
        this.renderBadges();
        this.showNotification(`Badge ganho: ${data.badge.name} ${data.badge.icon}`, 'success');
        break;
      case 'quest_completed':
        this.renderQuests();
        this.renderProfile();
        break;
      case 'points_converted':
        this.renderBalance();
        this.renderProfile();
        this.showNotification('Pontos convertidos para NEOFLW!', 'success');
        break;
      case 'wallet_connected':
        this.renderBalance();
        this.renderProfile();
        this.showNotification('Wallet conectada!', 'success');
        break;
    }
  }

  /**
   * Mostra notificação
   */
  showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `neo-notification neo-notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remover após 3 segundos
    setTimeout(() => {
      notification.classList.add('neo-notification-hide');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Inicia atualização automática
   */
  startAutoUpdate() {
    // Atualizar a cada 30 segundos
    this.updateInterval = setInterval(() => {
      if (document.getElementById('protocol')?.classList.contains('active')) {
        this.render();
      }
    }, 30000);
  }

  /**
   * Para atualização automática
   */
  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Conecta wallet usando Thirdweb ConnectEmbed
   */
  async connectWallet() {
    try {
      if (!this.router) {
        this.showNotification('Protocolo NΞØ não inicializado', 'error');
        return;
      }

      // Verificar se Thirdweb está disponível
      const thirdweb = window.NEOPROTOCOL?.thirdweb;
      if (!thirdweb) {
        // Criar modal de conexão
        this.showConnectModal();
        return;
      }

      // Se já tem wallet conectada, mostrar informações
      const identity = this.router.getModule('identity');
      const user = identity.getIdentity();
      
      if (user?.wallet) {
        this.showWalletInfo(user.wallet);
        return;
      }

      // Mostrar modal de conexão
      this.showConnectModal();
    } catch (error) {
      logger.error('NEOPROTOCOL UI: Erro ao conectar wallet', error);
      this.showNotification('Erro ao conectar wallet', 'error');
    }
  }

  /**
   * Mostra modal de conexão de wallet
   */
  showConnectModal() {
    // Criar modal (iOS sheet style)
    const modal = document.createElement('dialog');
    modal.id = 'neo-connect-modal';
    modal.className = 'neo-connect-modal neo-sheet';
    
    const clientId = window.NEOPROTOCOL?.config?.thirdweb?.clientId || 
                     process.env.THIRDWEB_CLIENT_ID || 
                     'a70d3d6d2ec826511ff9e31b0db2d0fc';

    modal.innerHTML = `
      <div class="neo-connect-content">
        <div class="neo-sheet-handle"></div>
        <div class="neo-connect-header">
          <h3>Conectar Wallet</h3>
          <button class="neo-close-btn" onclick="this.closest('dialog').close()">×</button>
        </div>
        <div class="neo-connect-body">
          <p>Escolha uma forma de conectar sua wallet:</p>
          <div id="thirdweb-connect-embed"></div>
        </div>
      </div>
    `;

    // Garantir que modal fique acima de tudo (header z-index: 1002, bottom bar: 101)
    // Usar z-index máximo possível para garantir que fique acima de qualquer elemento
    modal.style.zIndex = '2147483647'; // Máximo z-index em JavaScript
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.right = '0';
    modal.style.bottom = '0';
    modal.style.isolation = 'isolate'; // Novo contexto de empilhamento
    
    // Anexar diretamente ao body (não dentro de outros elementos)
    document.body.appendChild(modal);
    
    modal.showModal();
    
    // Forçar z-index máximo após modal ser exibido (garantir que fique acima do header)
    requestAnimationFrame(() => {
      modal.style.zIndex = '2147483647';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.right = '0';
      modal.style.bottom = '0';
      modal.style.isolation = 'isolate';
      
      // Garantir que backdrop também fique acima
      const style = document.createElement('style');
      style.id = 'neo-modal-z-index-fix';
      style.textContent = `
        .neo-connect-modal { 
          z-index: 2147483647 !important; 
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          isolation: isolate !important;
        }
        .neo-connect-modal::backdrop { 
          z-index: 2147483646 !important; 
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
        }
      `;
      // Remover estilo anterior se existir
      const existingStyle = document.getElementById('neo-modal-z-index-fix');
      if (existingStyle) existingStyle.remove();
      document.head.appendChild(style);
    });

    // Carregar Thirdweb ConnectEmbed
    this.loadConnectEmbed(modal, clientId);

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.close();
        modal.remove();
      }
    });
  }

  /**
   * Carrega Thirdweb ConnectEmbed (Vanilla JS - Mobile iOS-like)
   */
  async loadConnectEmbed(modal, clientId) {
    try {
      const { createThirdwebClient } = await import('thirdweb');
      const { connect } = await import('thirdweb/wallets');
      const { inAppWallet } = await import('thirdweb/wallets');
      const { polygon } = await import('thirdweb/chains');

      const client = createThirdwebClient({ clientId });
      const container = modal.querySelector('#thirdweb-connect-embed');

      // Opções de conexão mobile-friendly
      container.innerHTML = `
        <div class="neo-connect-options">
          <button class="neo-connect-option" onclick="window.neoUI?.connectWithEmail('${clientId}')">
            <div class="neo-option-icon">📧</div>
            <div class="neo-option-content">
              <div class="neo-option-title">Email / SMS</div>
              <div class="neo-option-desc">Login sem senha, link mágico</div>
            </div>
            <div class="neo-option-arrow">→</div>
          </button>
          
          <button class="neo-connect-option" onclick="window.neoUI?.connectWithSocial('google', '${clientId}')">
            <div class="neo-option-icon">🔵</div>
            <div class="neo-option-content">
              <div class="neo-option-title">Google</div>
              <div class="neo-option-desc">Continuar com Google</div>
            </div>
            <div class="neo-option-arrow">→</div>
          </button>
          
          <button class="neo-connect-option" onclick="window.neoUI?.connectWithSocial('apple', '${clientId}')">
            <div class="neo-option-icon">🍎</div>
            <div class="neo-option-content">
              <div class="neo-option-title">Apple</div>
              <div class="neo-option-desc">Continuar com Apple</div>
            </div>
            <div class="neo-option-arrow">→</div>
          </button>
          
          <button class="neo-connect-option" onclick="window.neoUI?.connectWithMetaMask('${clientId}')">
            <div class="neo-option-icon">🦊</div>
            <div class="neo-option-content">
              <div class="neo-option-title">MetaMask</div>
              <div class="neo-option-desc">Conectar carteira MetaMask</div>
            </div>
            <div class="neo-option-arrow">→</div>
          </button>
        </div>
      `;
    } catch (error) {
      logger.error('NEOPROTOCOL UI: Erro ao carregar opções de conexão', error);
      const container = modal.querySelector('#thirdweb-connect-embed');
      container.innerHTML = `
        <div class="neo-connect-error">
          <p>❌ Erro ao carregar opções</p>
          <p class="neo-muted">Client ID: ${clientId.slice(0, 8)}...</p>
          <button class="btn ghost" onclick="this.closest('dialog').close()">Fechar</button>
        </div>
      `;
    }
  }

  /**
   * Conecta com email (via Thirdweb In-App Wallet)
   */
  async connectWithEmail(clientId) {
    try {
      this.showNotification('Abrindo autenticação por email...', 'info');
      
      // Fechar modal anterior
      const prevModal = document.getElementById('neo-connect-modal');
      if (prevModal) prevModal.close();
      
      // Criar modal de email
      const modal = document.createElement('dialog');
      modal.id = 'neo-email-modal';
      modal.className = 'neo-connect-modal neo-sheet';
      
      modal.innerHTML = `
        <div class="neo-connect-content">
          <div class="neo-sheet-handle"></div>
          <div class="neo-connect-header">
            <h3>📧 Conectar com Email</h3>
          </div>
          <div class="neo-connect-body">
            <p>Digite seu email para receber um link de autenticação:</p>
            <input type="email" id="neo-email-input" placeholder="seu@email.com" class="neo-input" autocomplete="email">
            <button class="btn primary block" onclick="window.neoUI?.sendAuthEmail('${clientId}')">
              Enviar Link Mágico
            </button>
            <p class="neo-muted small">Você receberá um link por email para conectar sua wallet</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      modal.showModal();
      
      // Focar no input
      setTimeout(() => {
        const input = modal.querySelector('#neo-email-input');
        if (input) input.focus();
      }, 100);
      
      // Fechar ao clicar fora
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.close();
          modal.remove();
        }
      });
    } catch (error) {
      logger.error('NEOPROTOCOL UI: Erro ao conectar com email', error);
      this.showNotification('Erro ao conectar com email', 'error');
    }
  }

  /**
   * Conecta com rede social
   */
  async connectWithSocial(provider, clientId) {
    try {
      this.showNotification(`Conectando com ${provider}...`, 'info');
      // TODO: Implementar via Thirdweb In-App Wallet
      this.showNotification('Funcionalidade em desenvolvimento', 'info');
    } catch (error) {
      logger.error(`NEOPROTOCOL UI: Erro ao conectar com ${provider}`, error);
      this.showNotification(`Erro ao conectar com ${provider}`, 'error');
    }
  }

  /**
   * Conecta com MetaMask
   */
  async connectWithMetaMask(clientId) {
    try {
      if (typeof window.ethereum === 'undefined') {
        this.showNotification('MetaMask não encontrado. Instale a extensão.', 'error');
        return;
      }
      
      this.showNotification('Conectando com MetaMask...', 'info');
      
      // Conectar MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      // Salvar no Identity Graph
      if (this.router) {
        const identity = this.router.getModule('identity');
        await identity.updateAttribute('wallet', address);
        
        // Processar ação de conexão
        await this.router.route('action.process', {
          type: 'wallet_connect',
          data: { wallet: address }
        });
      }
      
      this.showNotification('✅ Wallet conectada!', 'success');
      
      // Fechar modal
      const modal = document.getElementById('neo-connect-modal');
      if (modal) {
        modal.close();
        modal.remove();
      }
      
      // Atualizar UI
      await this.render();
    } catch (error) {
      logger.error('NEOPROTOCOL UI: Erro ao conectar MetaMask', error);
      this.showNotification('Erro ao conectar MetaMask', 'error');
    }
  }

  /**
   * Envia email de autenticação via Thirdweb
   */
  async sendAuthEmail(clientId) {
    const emailInput = document.getElementById('neo-email-input');
    const email = emailInput?.value?.trim();
    
    if (!email || !email.includes('@')) {
      this.showNotification('Digite um email válido', 'error');
      emailInput?.focus();
      return;
    }

    try {
      this.showNotification('Enviando link mágico...', 'info');
      
      // Usar Thirdweb In-App Wallet para autenticação por email
      const { createThirdwebClient } = await import('thirdweb');
      const { inAppWallet } = await import('thirdweb/wallets');
      const { connect } = await import('thirdweb/wallets');
      const { polygon } = await import('thirdweb/chains');
      
      const client = createThirdwebClient({ clientId });
      
      // Criar wallet in-app
      const wallet = inAppWallet({
        client,
        chain: polygon
      });
      
      // Iniciar autenticação por email
      await connect({
        client,
        strategy: 'email',
        email: email
      });
      
      // Se chegou aqui, autenticação iniciada
      this.showNotification('✅ Link enviado! Verifique seu email.', 'success');
      
      // Fechar modal de email
      const emailModal = document.getElementById('neo-email-modal');
      if (emailModal) {
        emailModal.close();
        emailModal.remove();
      }
      
      // Mostrar instruções
      this.showNotification('Abra o link no email para completar a conexão', 'info');
      
    } catch (error) {
      logger.error('NEOPROTOCOL UI: Erro ao enviar email', error);
      
      // Se for erro de autenticação, pode ser que precise de mais configuração
      if (error.message?.includes('email') || error.message?.includes('auth')) {
        this.showNotification('Verifique se o email está correto e tente novamente', 'error');
      } else {
        this.showNotification('Erro ao enviar email. Tente novamente.', 'error');
      }
    }
  }

  /**
   * Mostra informações da wallet conectada
   */
  showWalletInfo(address) {
    const modal = document.createElement('dialog');
    modal.className = 'neo-connect-modal';
    modal.innerHTML = `
      <div class="neo-connect-content">
        <div class="neo-connect-header">
          <h3>🔗 Wallet Conectada</h3>
          <button class="neo-close-btn" onclick="this.closest('dialog').close()">×</button>
        </div>
        <div class="neo-connect-body">
          <div class="neo-wallet-address">
            <p><strong>Endereço:</strong></p>
            <code>${address}</code>
            <button class="btn ghost small" onclick="navigator.clipboard.writeText('${address}')">
              📋 Copiar
            </button>
          </div>
          <div class="neo-wallet-actions">
            <button class="btn primary" onclick="window.neoUI?.refresh()">
              🔄 Atualizar Saldo
            </button>
            <button class="btn ghost" onclick="window.neoUI?.disconnectWallet()">
              Desconectar
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.showModal();
  }

  /**
   * Desconecta wallet
   */
  async disconnectWallet() {
    try {
      const identity = this.router.getModule('identity');
      await identity.updateAttribute('wallet', null);
      this.showNotification('Wallet desconectada', 'info');
      await this.render();
    } catch (error) {
      logger.error('NEOPROTOCOL UI: Erro ao desconectar wallet', error);
    }
  }

  /**
   * Converte pontos em NEOFLW
   */
  async convertPoints() {
    try {
      const gamification = this.router.getModule('gamification');
      await gamification.convertPointsToNEOFLW();
      this.showNotification('Conversão iniciada!', 'success');
      this.render();
    } catch (error) {
      logger.error('NEOPROTOCOL UI: Erro ao converter pontos', error);
      this.showNotification('Erro ao converter pontos', 'error');
    }
  }

  /**
   * Cria identidade demo para teste
   */
  async createDemoIdentity() {
    try {
      if (!this.router) {
        this.showNotification('Protocolo NΞØ não inicializado', 'error');
        return;
      }

      const identity = this.router.getModule('identity');
      
      // Criar identidade demo
      await identity.setIdentity({
        name: 'Usuário Demo',
        email: 'demo@flowoff.xyz',
        whatsapp: '+5511999999999',
        leadOrigin: 'demo',
        agent: 'demo_ui'
      });

      // Ativar quest demo
      const actionResult = await this.router.route('action.process', {
        type: 'lead_activation',
        data: {
          origin: 'demo',
          name: 'Usuário Demo',
          email: 'demo@flowoff.xyz',
          whatsapp: '+5511999999999',
          serviceType: 'demo'
        }
      });

      this.showNotification('✅ Identidade demo criada!', 'success');
      await this.render();
    } catch (error) {
      logger.error('NEOPROTOCOL UI: Erro ao criar identidade demo', error);
      this.showNotification('Erro ao criar identidade demo', 'error');
    }
  }

  /**
   * Rola para quests
   */
  viewQuests() {
    const questsCard = document.getElementById('neo-quests-card');
    if (questsCard) {
      questsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      questsCard.style.animation = 'pulse 0.5s ease';
      setTimeout(() => {
        questsCard.style.animation = '';
      }, 500);
    }
  }

  /**
   * Atualiza manualmente todos os componentes
   */
  async refresh() {
    this.showNotification('🔄 Atualizando...', 'info');
    await this.render();
    this.showNotification('✅ Atualizado!', 'success');
  }
}

// Exportar instância global
let neoUIInstance = null;

export function initNEOPROTOCOLUI() {
  if (!neoUIInstance) {
    neoUIInstance = new NEOPROTOCOLUI();
    window.neoUI = neoUIInstance; // Para acesso global
  }
  return neoUIInstance;
}

// Auto-inicializar quando a rota protocol for acessada
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const protocolSection = document.getElementById('protocol');
    if (protocolSection) {
      // Aguardar Protocolo NΞØ estar pronto
      const checkProtocol = setInterval(() => {
        if (window.NEOPROTOCOL?.initialized) {
          clearInterval(checkProtocol);
          initNEOPROTOCOLUI().init();
        }
      }, 100);

      // Timeout após 5 segundos
      setTimeout(() => clearInterval(checkProtocol), 5000);
    }
  });
} else {
  const protocolSection = document.getElementById('protocol');
  if (protocolSection) {
    if (window.NEOPROTOCOL?.initialized) {
      initNEOPROTOCOLUI().init();
    } else {
      window.addEventListener('neoprotocol:ready', () => {
        initNEOPROTOCOLUI().init();
      }, { once: true });
    }
  }
}

export default NEOPROTOCOLUI;

