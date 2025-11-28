// Logger utilitário (condiciona logs apenas em desenvolvimento)
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const logger = {
  log: (...args) => isDev && console.log(...args),
  warn: (...args) => isDev && console.warn(...args),
  error: (...args) => console.error(...args) // Erros sempre logados
};

// Inicializar Protocolo NΞØ
import('./neo-protocol-init.js').then(module => {
  logger.log('🧬 Protocolo NΞØ carregado');
}).catch(err => {
  logger.warn('Protocolo NΞØ: Erro ao carregar', err);
});

// Registro do Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      
      // Verificar se há atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nova versão disponível
          }
        });
      });
    } catch (error) {
      // Erro ao registrar Service Worker
    }
  });
}

// Router super simples (hashless) - Compatível com Glass Morphism Bottom Bar
const routes = ['home','projects','start','protocol','ecosystem'];
const buttons = document.querySelectorAll('.glass-nav-item');
const sections = [...document.querySelectorAll('.route')];

function go(route){
  routes.forEach(r => {
    const element = document.getElementById(r);
    const isActive = r === route;
    element.classList.toggle('active', isActive);
  });
  buttons.forEach(b => b.classList.toggle('active', b.dataset.route===route));
  window.scrollTo({top:0, behavior:'smooth'});
}

// Tornar função go() disponível globalmente para testes
window.go = go;


buttons.forEach(b => b.addEventListener('click', () => go(b.dataset.route)));
go('home');

// Sheet modal
document.querySelectorAll('[data-open]').forEach(el=>{
  el.addEventListener('click', ()=> document.getElementById(el.dataset.open).showModal());
});

// Offline UI
function setOffline(flag){
  const el = document.getElementById('offline');
  el.style.display = flag ? 'block' : 'none';
}
window.addEventListener('online', ()=>setOffline(false));
window.addEventListener('offline', ()=>setOffline(true));
setOffline(!navigator.onLine);

// Lead form - Integrado com Protocolo NΞØ
// Aguardar DOM e Protocolo NΞØ estarem prontos
function setupLeadForm() {
  const leadForm = document.getElementById('lead-form');
  if (!leadForm) {
    // Tentar novamente se o DOM ainda não estiver pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupLeadForm);
      return;
    }
    return;
  }

  leadForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(leadForm));
    const status = document.getElementById('lead-status');
    
    status.textContent = '⏳ Processando com Protocolo NΞØ...';
    status.style.color = '#3b82f6';
    
    try{
      // Verificar se Protocolo NΞØ está inicializado
      if (!window.NEOPROTOCOL?.initialized) {
        status.textContent = '⏳ Inicializando Protocolo NΞØ...';
        // Aguardar inicialização (máximo 3 segundos)
        let attempts = 0;
        while (!window.NEOPROTOCOL?.initialized && attempts < 30) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!window.NEOPROTOCOL?.initialized) {
          throw new Error('Protocolo NΞØ não inicializado');
        }
      }

      const router = window.NEOPROTOCOL.router;
      
      // 1. Criar/Atualizar identidade no Identity Graph
      status.textContent = '📝 Registrando identidade...';
      const identity = router.getModule('identity');
      await identity.setIdentity({
        name: data.name,
        email: data.email,
        whatsapp: data.whats,
        leadOrigin: 'website_form',
        agent: 'flowoff_website'
      });
      
      // 2. Processar ação via MCP Router (ativa gamificação automaticamente)
      status.textContent = '🎮 Processando ação...';
      const actionResult = await router.route('action.process', {
        type: 'lead_activation',
        data: {
          origin: 'website_form',
          name: data.name,
          email: data.email,
          whatsapp: data.whats,
          serviceType: data.type
        }
      });
      
      // 3. Obter progresso atualizado
      const gamification = router.getModule('gamification');
      const progress = gamification.getProgress();
      const identityData = identity.getIdentity();
      
      // 4. Formatar dados para WhatsApp (incluindo progresso)
      const projectTypes = {
        'site': 'Site / WebApp',
        'saas': 'SAAS / BAAS', 
        'poston': 'POSTØN',
        'proia': 'PRO.IA',
        'cripto': 'Tokenização / Cripto'
      };
      
      const projectType = projectTypes[data.type] || data.type;
      
      // Mensagem formatada para WhatsApp (com dados do Protocolo NΞØ)
      let message = `🚀 *NOVO LEAD - FlowOFF*

👤 *Nome:* ${data.name}
📧 *Email:* ${data.email}
📱 *WhatsApp:* ${data.whats}
🎯 *Tipo de Projeto:* ${projectType}

💬 *Mensagem:* Olá MELLØ! Gostaria de iniciar um projeto com a FlowOFF.`;

      // Adicionar dados do Protocolo NΞØ se disponível
      if (identityData) {
        message += `\n\n🧬 *Protocolo NΞØ:*
📊 Nível: ${identityData.level}
⭐ XP: ${identityData.xp}
🏅 Badges: ${identityData.badges.length}
💰 Pontos: ${progress.points || 0}`;
        
        if (identityData.badges.length > 0) {
          const badgesList = identityData.badges.map(b => b.icon + ' ' + b.name).join(', ');
          message += `\n🎯 Badges: ${badgesList}`;
        }
      }

      // Codificar mensagem para URL
      const encodedMessage = encodeURIComponent(message);
      
      // Número do WhatsApp
      const whatsappNumber = '5562983231110'; // Número do MELLØ
      
      // URL do WhatsApp
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      // Feedback sobre recompensas ganhas
      let rewardMessage = '✅ Lead registrado!';
      if (actionResult?.reward) {
        const rewards = actionResult.reward;
        if (rewards.xp > 0 || rewards.points > 0 || rewards.badge) {
          rewardMessage = '🎁 Recompensas ganhas: ';
          const rewardsList = [];
          if (rewards.xp > 0) rewardsList.push(`${rewards.xp} XP`);
          if (rewards.points > 0) rewardsList.push(`${rewards.points} pontos`);
          if (rewards.badge) {
            const badgeIcon = gamification.getBadgeIcon(rewards.badge);
            rewardsList.push(`Badge ${badgeIcon}`);
          }
          rewardMessage += rewardsList.join(', ');
        }
      } else if (actionResult) {
        // Se a quest já foi completada antes, mostrar progresso atual
        rewardMessage = '✅ Lead registrado!';
      }
      
      status.textContent = rewardMessage + ' Redirecionando para WhatsApp...';
      status.style.color = '#4ade80';
      
      // Redirecionar para WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Feedback visual final
      setTimeout(() => {
        status.textContent = '✅ Redirecionado para WhatsApp!';
        leadForm.reset();
        navigator.vibrate?.(10);
      }, 500);
      
    }catch(err){
      logger.error('Erro no formulário:', err);
      
      // Fallback: tentar redirecionar mesmo sem Protocolo NΞØ
      try {
        const projectTypes = {
          'site': 'Site / WebApp',
          'saas': 'SAAS / BAAS', 
          'poston': 'POSTØN',
          'proia': 'PRO.IA',
          'cripto': 'Tokenização / Cripto'
        };
        
        const projectType = projectTypes[data.type] || data.type;
        const message = `🚀 *NOVO LEAD - FlowOFF*\n\n👤 *Nome:* ${data.name}\n📧 *Email:* ${data.email}\n📱 *WhatsApp:* ${data.whats}\n🎯 *Tipo de Projeto:* ${projectType}\n\n💬 *Mensagem:* Olá MELLØ! Gostaria de iniciar um projeto com a FlowOFF.`;
        const whatsappUrl = `https://wa.me/5562983231110?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        status.textContent = '⚠️ Protocolo NΞØ indisponível, mas redirecionado para WhatsApp!';
        status.style.color = '#f59e0b';
        leadForm.reset();
      } catch (fallbackErr) {
        status.textContent = '❌ Erro ao processar. Tente novamente.';
        status.style.color = '#ef4444';
        logger.error('Erro no fallback:', fallbackErr);
      }
    }
  });
}

// Inicializar quando DOM e Protocolo NΞØ estiverem prontos
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Aguardar Protocolo NΞØ estar pronto
    if (window.NEOPROTOCOL?.initialized) {
      setupLeadForm();
    } else {
      window.addEventListener('neoprotocol:ready', setupLeadForm, { once: true });
      // Fallback: tentar após 2 segundos mesmo sem evento
      setTimeout(setupLeadForm, 2000);
    }
  });
} else {
  // DOM já carregado
  if (window.NEOPROTOCOL?.initialized) {
    setupLeadForm();
  } else {
    window.addEventListener('neoprotocol:ready', setupLeadForm, { once: true });
    setTimeout(setupLeadForm, 2000);
  }
}

// NEO Agent API Client
// TEMPORARIAMENTE DESABILITADO - Agente NEO
/*
class NEOAgentClient {
  constructor() {
    this.baseUrl = 'https://agent-neo-flowoff.vercel.app/api';
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return 'neo-session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  async sendMessage(message) {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          sessionId: this.sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Erro ao comunicar com o agente NEO:', error);
      throw error;
    }
  }

  async getLeads() {
    try {
      const response = await fetch(`${this.baseUrl}/leads`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      logger.error('Erro ao buscar leads:', error);
      throw error;
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      logger.error('Erro ao verificar status do agente:', error);
      throw error;
    }
  }
}
*/

// TEMPORARIAMENTE DESABILITADO - Inicialização do agente
/*
// Inicializar cliente do agente
window.neoAgent = new NEOAgentClient();

// Exemplo de uso da API (pode ser chamado de qualquer lugar)
window.sendToAgent = async (message) => {
  try {
    const response = await window.neoAgent.sendMessage(message);
    logger.log('Resposta do agente:', response.response);
    logger.log('Ações disponíveis:', response.actions);
    return response;
  } catch (error) {
    logger.error('Erro ao enviar mensagem:', error);
    return null;
  }
};
*/

// TEMPORARIAMENTE DESABILITADO - Verificação de status do agente
/*
window.addEventListener('load', async () => {
  try {
    const health = await window.neoAgent.checkHealth();
    logger.log('Agente NEO FlowOff:', health.status);
  } catch (error) {
    logger.warn('Agente NEO FlowOff não disponível:', error.message);
  }
});
*/


// TEMPORARIAMENTE DESABILITADO - Funcionalidade do modal do agente
/*
const agentModal = document.getElementById('agent-modal');
const agentInput = document.getElementById('agent-input');
const agentSend = document.getElementById('agent-send');
const agentMessages = document.getElementById('agent-messages');
const agentClear = document.getElementById('agent-clear');
const agentLeads = document.getElementById('agent-leads');
const agentClose = document.querySelector('.agent-close');
*/

// TEMPORARIAMENTE DESABILITADO - Funções do agente
/*
// Função para adicionar mensagem no chat
function addMessage(content, type = 'agent') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `agent-message ${type}`;
  messageDiv.textContent = content;
  agentMessages.appendChild(messageDiv);
  agentMessages.scrollTop = agentMessages.scrollHeight;
}

// Função para enviar mensagem
async function sendMessage() {
  const message = agentInput.value.trim();
  if (!message) return;
  
  // Adicionar mensagem do usuário
  addMessage(message, 'user');
  agentInput.value = '';
  
  // Mostrar indicador de digitação
  const typingDiv = document.createElement('div');
  typingDiv.className = 'agent-message agent';
  typingDiv.innerHTML = '<span style="opacity: 0.7;">🤖 Agente está digitando...</span>';
  agentMessages.appendChild(typingDiv);
  agentMessages.scrollTop = agentMessages.scrollHeight;
  
  try {
    // Enviar para o agente
    const response = await window.neoAgent.sendMessage(message);
    
    // Remover indicador de digitação
    agentMessages.removeChild(typingDiv);
    
    // Adicionar resposta do agente
    addMessage(response.response, 'agent');
    
    // Mostrar ações se disponíveis
    if (response.actions && response.actions.length > 0) {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'agent-message system';
      actionsDiv.innerHTML = `Ações disponíveis: ${response.actions.join(', ')}`;
      agentMessages.appendChild(actionsDiv);
      agentMessages.scrollTop = agentMessages.scrollHeight;
    }
    
  } catch (error) {
    // Remover indicador de digitação
    agentMessages.removeChild(typingDiv);
    
    // Mostrar erro
    addMessage('❌ Erro ao conectar com o agente. Tente novamente.', 'system');
    logger.error('Erro ao enviar mensagem:', error);
  }
}

// Event listeners
if (agentSend) {
  agentSend.addEventListener('click', sendMessage);
}

if (agentInput) {
  agentInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

if (agentClear) {
  agentClear.addEventListener('click', () => {
    agentMessages.innerHTML = '';
    addMessage('💬 Chat limpo. Como posso ajudar?', 'system');
  });
}

if (agentLeads) {
  agentLeads.addEventListener('click', async () => {
    try {
      const leads = await window.neoAgent.getLeads();
      addMessage(`📊 Leads capturados: ${leads.length}`, 'system');
      if (leads.length > 0) {
        leads.forEach((lead, index) => {
          addMessage(`${index + 1}. ${lead.name || 'Nome não informado'} - ${lead.email || 'Email não informado'}`, 'system');
        });
      }
    } catch (error) {
      addMessage('❌ Erro ao buscar leads.', 'system');
      logger.error('Erro ao buscar leads:', error);
    }
  });
}

if (agentClose) {
  agentClose.addEventListener('click', () => {
    agentModal.close();
  });
}
*/

// TEMPORARIAMENTE DESABILITADO - Resto do código do agente
/*
// Fechar modal clicando fora
if (agentModal) {
  agentModal.addEventListener('click', (e) => {
    if (e.target === agentModal) {
      agentModal.close();
    }
  });
}

// Mensagem inicial
if (agentMessages) {
  addMessage('👋 Olá! Sou o Agente NEO FlowOff. Como posso ajudar você hoje?', 'system');
}

// Widget de Atendimento Flutuante
const agentWidget = document.getElementById('agent-widget');
const agentWidgetToggle = document.getElementById('agent-widget-toggle');
const agentWidgetPopup = document.getElementById('agent-widget-popup');
const agentWidgetClose = document.getElementById('agent-widget-close');

let isWidgetOpen = false;

// Função para abrir/fechar o widget
function toggleWidget() {
  isWidgetOpen = !isWidgetOpen;
  
  if (isWidgetOpen) {
    agentWidgetPopup.classList.add('active');
    agentWidgetToggle.style.transform = 'translateY(-2px)';
    agentWidgetToggle.style.boxShadow = '0 12px 35px rgba(255,47,179,.5)';
    
    // Vibração se disponível
    navigator.vibrate?.(30);
  } else {
    agentWidgetPopup.classList.remove('active');
    agentWidgetToggle.style.transform = '';
    agentWidgetToggle.style.boxShadow = '';
  }
}

// Event listeners para o widget
if (agentWidgetToggle) {
  agentWidgetToggle.addEventListener('click', toggleWidget);
}

if (agentWidgetClose) {
  agentWidgetClose.addEventListener('click', () => {
    isWidgetOpen = false;
    agentWidgetPopup.classList.remove('active');
    agentWidgetToggle.style.transform = '';
    agentWidgetToggle.style.boxShadow = '';
  });
}

// Fechar widget clicando fora
document.addEventListener('click', (e) => {
  if (isWidgetOpen && !agentWidget.contains(e.target)) {
    isWidgetOpen = false;
    agentWidgetPopup.classList.remove('active');
    agentWidgetToggle.style.transform = '';
    agentWidgetToggle.style.boxShadow = '';
  }
});

// Fechar widget com ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isWidgetOpen) {
    isWidgetOpen = false;
    agentWidgetPopup.classList.remove('active');
    agentWidgetToggle.style.transform = '';
    agentWidgetToggle.style.boxShadow = '';
  }
});

// Auto-abrir widget após 3 segundos (opcional)
setTimeout(() => {
  if (!isWidgetOpen) {
    // Mostrar notificação sutil
    agentWidgetToggle.style.animation = 'pulse 1s ease-in-out 3';
  }
}, 3000);

// Adicionar animação de pulse para destacar seções
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); box-shadow: 0 0 20px rgba(255,47,179,0.3); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);
*/
