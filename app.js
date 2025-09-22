// Registro do SW
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}

// Router super simples (hashless)
const routes = ['home','projects','start','ecosystem','blog'];
const buttons = document.querySelectorAll('.tabbar button');
const sections = [...document.querySelectorAll('.route')];

function go(route){
  routes.forEach(r => document.getElementById(r).classList.toggle('active', r===route));
  buttons.forEach(b => b.classList.toggle('active', b.dataset.route===route));
  window.scrollTo({top:0, behavior:'smooth'});
}

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

// Lead form (mock; substitua pelo seu endpoint)
const leadForm = document.getElementById('lead-form');
if (leadForm){
  leadForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(leadForm));
    const status = document.getElementById('lead-status');
    status.textContent = 'Enviando...';
    try{
      // fetch('https://seu-endpoint/lead', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)})
      await new Promise(r=>setTimeout(r,800)); // demo
      status.textContent = 'Recebido. Te chamo no Whats.';
      leadForm.reset();
      navigator.vibrate?.(10);
    }catch(err){
      status.textContent = 'Falha ao enviar. Tente novamente.';
    }
  });
}

// NEO Agent API Client
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

// Verificar status do agente ao carregar a página
window.addEventListener('load', async () => {
  try {
    const health = await window.neoAgent.checkHealth();
    console.log('Agente NEO FlowOff:', health.status);
  } catch (error) {
    console.warn('Agente NEO FlowOff não disponível:', error.message);
  }
});


// Funcionalidade do modal do agente
const agentModal = document.getElementById('agent-modal');
const agentInput = document.getElementById('agent-input');
const agentSend = document.getElementById('agent-send');
const agentMessages = document.getElementById('agent-messages');
const agentClear = document.getElementById('agent-clear');
const agentLeads = document.getElementById('agent-leads');
const agentClose = document.querySelector('.agent-close');

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
