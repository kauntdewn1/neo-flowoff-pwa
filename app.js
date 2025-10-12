// Registro do Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      console.log('✅ Service Worker registrado com sucesso:', registration.scope);
      
      // Verificar se há atualizações
      registration.addEventListener('updatefound', () => {
        console.log('🔄 Nova versão do Service Worker encontrada');
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('📱 Nova versão disponível! Recarregue para atualizar.');
          }
        });
      });
    } catch (error) {
      console.error('❌ Erro ao registrar Service Worker:', error);
    }
  });
} else {
  console.log('⚠️ Service Worker não suportado neste navegador');
}

// Router super simples (hashless) - Compatível com Glass Morphism Bottom Bar
const routes = ['home','projects','start','ecosystem'];
const buttons = document.querySelectorAll('.glass-nav-item');
const sections = [...document.querySelectorAll('.route')];

function go(route){
  console.log(`🔄 Navegando para rota: ${route}`);
  routes.forEach(r => {
    const element = document.getElementById(r);
    const isActive = r === route;
    element.classList.toggle('active', isActive);
    console.log(`  ${r}: ${isActive ? 'ATIVA' : 'inativa'}`);
  });
  buttons.forEach(b => b.classList.toggle('active', b.dataset.route===route));
  window.scrollTo({top:0, behavior:'smooth'});
}

// Tornar função go() disponível globalmente para testes
window.go = go;

// Função de debug para testar o menu hambúrguer
window.debugMenuHamburger = () => {
  console.log('🔍 Debug Menu Hambúrguer');
  
  const menuToggle = document.getElementById('menu-toggle');
  if (!menuToggle) {
    console.error('❌ menu-toggle não encontrado');
    return;
  }
  
  const styles = window.getComputedStyle(menuToggle);
  const rect = menuToggle.getBoundingClientRect();
  
  console.log('📊 Propriedades do menu-toggle:', {
    zIndex: styles.zIndex,
    position: styles.position,
    pointerEvents: styles.pointerEvents,
    display: styles.display,
    visibility: styles.visibility,
    opacity: styles.opacity,
    rect: `${rect.width}x${rect.height} at (${rect.left}, ${rect.top})`,
    clickable: rect.width > 0 && rect.height > 0
  });
  
  // Verificar elementos sobrepostos
  const elementsAtPoint = document.elementsFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
  console.log('🎯 Elementos no ponto do botão:', elementsAtPoint.map(el => ({
    tag: el.tagName,
    id: el.id,
    className: el.className,
    zIndex: window.getComputedStyle(el).zIndex
  })));
  
  // Verificar se banner PWA está interferindo
  const pwaBanner = document.getElementById('pwa-install-banner');
  if (pwaBanner) {
    const pwaStyles = window.getComputedStyle(pwaBanner);
    console.log('📱 Banner PWA:', {
      display: pwaStyles.display,
      visibility: pwaStyles.visibility,
      opacity: pwaStyles.opacity,
      transform: pwaStyles.transform,
      zIndex: pwaStyles.zIndex
    });
    
    if (pwaStyles.display !== 'none') {
      console.warn('⚠️ Banner PWA pode estar interferindo!');
    }
  }
  
  // Simular clique
  console.log('🖱️ Simulando clique...');
  menuToggle.click();
};

// Função para ocultar banner PWA temporariamente
window.hidePWABanner = () => {
  const pwaBanner = document.getElementById('pwa-install-banner');
  if (pwaBanner) {
    pwaBanner.style.display = 'none';
    pwaBanner.classList.remove('show');
    console.log('✅ Banner PWA ocultado temporariamente');
  }
};

// Função para mostrar banner PWA novamente
window.showPWABanner = () => {
  const pwaBanner = document.getElementById('pwa-install-banner');
  if (pwaBanner) {
    pwaBanner.style.display = 'block';
    pwaBanner.classList.add('show');
    console.log('✅ Banner PWA exibido novamente');
  }
};

// Menu hambúrguer
document.addEventListener('DOMContentLoaded', () => {
  console.log('🍔 Inicializando menu hambúrguer...');
  const menuToggle = document.getElementById('menu-toggle');
  const menuOverlay = document.getElementById('menu-overlay');
  const menuClose = document.getElementById('menu-close');
  const menuItems = document.querySelectorAll('.menu-item[data-route]');
  
  console.log('🍔 Elementos encontrados:', {
    menuToggle: !!menuToggle,
    menuOverlay: !!menuOverlay,
    menuClose: !!menuClose,
    menuItems: menuItems.length
  });

  // Debug: Verificar propriedades do menu-toggle
  if (menuToggle) {
    const styles = window.getComputedStyle(menuToggle);
    const rect = menuToggle.getBoundingClientRect();
    console.log('🍔 Menu-toggle debug:', {
      zIndex: styles.zIndex,
      position: styles.position,
      pointerEvents: styles.pointerEvents,
      display: styles.display,
      visibility: styles.visibility,
      opacity: styles.opacity,
      rect: `${rect.width}x${rect.height} at (${rect.left}, ${rect.top})`,
      clickable: rect.width > 0 && rect.height > 0
    });
    
    // Verificar elementos pais
    let parent = menuToggle.parentElement;
    while (parent && parent !== document.body) {
      const parentStyles = window.getComputedStyle(parent);
      if (parentStyles.pointerEvents === 'none') {
        console.warn('⚠️ Elemento pai tem pointer-events: none', parent);
      }
      parent = parent.parentElement;
    }
  }

  // Abrir menu
  if (menuToggle) {
    menuToggle.addEventListener('click', (e) => {
      console.log('🍔 Menu toggle clicado!', e);
      e.preventDefault();
      e.stopPropagation();
      menuToggle.classList.add('active');
      menuOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      console.log('🍔 Menu aberto');
    });
    
    // Adicionar listeners de debug
    menuToggle.addEventListener('mousedown', (e) => {
      console.log('🖱️ Mouse down no menu-toggle', e);
    });
    
    menuToggle.addEventListener('mouseup', (e) => {
      console.log('🖱️ Mouse up no menu-toggle', e);
    });
    
    menuToggle.addEventListener('touchstart', (e) => {
      console.log('👆 Touch start no menu-toggle', e);
    });
    
  } else {
    console.error('❌ menu-toggle não encontrado!');
  }

  // Fechar menu
  const closeMenu = () => {
    menuToggle.classList.remove('active');
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  menuClose.addEventListener('click', closeMenu);
  menuOverlay.addEventListener('click', (e) => {
    if (e.target === menuOverlay) closeMenu();
  });

  // Navegação do menu
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const route = item.dataset.route;
      if (route && typeof go === 'function') {
        go(route);
        closeMenu();
      }
    });
  });

  // Fechar menu com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOverlay.classList.contains('active')) {
      closeMenu();
    }
  });
});

buttons.forEach(b => b.addEventListener('click', () => go(b.dataset.route)));
console.log('🚀 Inicializando rota HOME...');
go('home');
console.log('✅ Rota HOME definida');

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

// Lead form - Redireciona para WhatsApp
const leadForm = document.getElementById('lead-form');
if (leadForm){
  leadForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(leadForm));
    const status = document.getElementById('lead-status');
    
    status.textContent = 'Redirecionando para WhatsApp...';
    
    try{
      // Formatar dados para WhatsApp
      const projectTypes = {
        'site': 'Site / WebApp',
        'saas': 'SAAS / BAAS', 
        'poston': 'POSTØN',
        'proia': 'PRO.IA'
      };
      
      const projectType = projectTypes[data.type] || data.type;
      
      // Mensagem formatada para WhatsApp
      const message = `🚀 *NOVO LEAD - FlowOFF*

👤 *Nome:* ${data.name}
📧 *Email:* ${data.email}
📱 *WhatsApp:* ${data.whats}
🎯 *Tipo de Projeto:* ${projectType}

💬 *Mensagem:* Olá MELLØ! Gostaria de iniciar um projeto com a FlowOFF.`

      // Codificar mensagem para URL
      const encodedMessage = encodeURIComponent(message);
      
      // Número do WhatsApp (substitua pelo seu número)
      const whatsappNumber = '5562983231110'; // Número do MELLØ
      
      // URL do WhatsApp
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      // Redirecionar para WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Feedback visual
      status.textContent = 'Redirecionado para WhatsApp!';
      leadForm.reset();
      navigator.vibrate?.(10);
      
    }catch(err){
      status.textContent = 'Erro ao redirecionar. Tente novamente.';
      console.error('Erro no formulário:', err);
    }
  });
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
      console.error('Erro ao comunicar com o agente NEO:', error);
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
      console.error('Erro ao buscar leads:', error);
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
      console.error('Erro ao verificar status do agente:', error);
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
    console.log('Resposta do agente:', response.response);
    console.log('Ações disponíveis:', response.actions);
    return response;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return null;
  }
};
*/

// Função para testar proxy Ollama local
window.testLocalOllama = async (message) => {
  try {
    const response = await fetch('/api/localMistral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: message })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Resposta Ollama local:', data.output);
    return data;
  } catch (error) {
    console.error('Erro ao conectar com Ollama local:', error);
    return null;
  }
};

// TEMPORARIAMENTE DESABILITADO - Verificação de status do agente
/*
window.addEventListener('load', async () => {
  try {
    const health = await window.neoAgent.checkHealth();
    console.log('Agente NEO FlowOff:', health.status);
  } catch (error) {
    console.warn('Agente NEO FlowOff não disponível:', error.message);
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
    console.error('Erro ao enviar mensagem:', error);
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
      console.error('Erro ao buscar leads:', error);
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
