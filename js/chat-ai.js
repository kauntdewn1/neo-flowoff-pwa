// Chat AI - Simulação de atendimento da ASI NEO
class ChatAI {
  constructor() {
    this.messages = [];
    this.isTyping = false;
    this.init();
  }

  init() {
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const quickActions = document.querySelectorAll('.quick-action-btn');

    if (chatInput && chatSend) {
      chatSend.addEventListener('click', () => this.sendMessage());
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    quickActions.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        this.handleQuickAction(action);
      });
    });
  }

  sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message || this.isTyping) return;

    // Adiciona mensagem do usuário
    this.addMessage(message, 'user');
    input.value = '';

    // Simula resposta da IA
    this.simulateAIResponse(message);
  }

  addMessage(text, type = 'agent') {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'message-content';

    if (type === 'agent') {
      const avatarWrapper = document.createElement('div');
      avatarWrapper.className = 'message-avatar';
      const avatarImg = document.createElement('img');
      avatarImg.src = 'public/neo_ico.png';
      avatarImg.alt = 'NEO';
      avatarImg.className = 'message-avatar-img';
      avatarWrapper.appendChild(avatarImg);
      messageDiv.appendChild(avatarWrapper);
    }

    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    contentWrapper.appendChild(paragraph);
    messageDiv.appendChild(contentWrapper);

    messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  simulateAIResponse(userMessage) {
    this.isTyping = true;
    this.showTypingIndicator();

    // Simula delay de processamento
    setTimeout(() => {
      this.hideTypingIndicator();
      this.fetchKnowledgeIfNeeded(userMessage)
        .then(knowledge => {
          const response = knowledge || this.generateResponse(userMessage.toLowerCase());
          this.addMessage(response, 'agent');
          this.isTyping = false;
        })
        .catch(() => {
          const response = this.generateResponse(userMessage.toLowerCase());
          this.addMessage(response, 'agent');
          this.isTyping = false;
        });
    }, 1000 + Math.random() * 1000);
  }

  async fetchKnowledgeIfNeeded(message) {
    const keywords = ['agência', 'agency', 'flowoff', 'neo', 'protocolo', 'serviço', 'servicos', 'projetos', 'marketing'];
    const normalized = message.toLowerCase();
    if (!keywords.some(keyword => normalized.includes(keyword))) {
      return null;
    }

    const fetchFn = window.fetch?.bind(window);
    if (!fetchFn) return null;

    try {
      const response = await fetchFn(`/api/google-knowledge?q=${encodeURIComponent(message)}`);
      if (!response.ok) return null;
      const data = await response.json();
      if (data?.success && data?.summary) {
        return data.summary;
      }
    } catch (error) {
      window.Logger?.warn('Google knowledge lookup failed', error);
    }
    return null;
  }

  generateResponse(message) {
    // Respostas inteligentes baseadas em palavras-chave
    if (message.includes('serviço') || message.includes('o que fazem') || message.includes('servicos')) {
      return 'Oferecemos desenvolvimento de Sites/WebApps, SAAS/BAAS, Tokenização de Ativos e Agentes IA. Qual área te interessa mais?';
    }

    if (message.includes('preço') || message.includes('quanto') || message.includes('custo')) {
      return 'Nossos projetos são personalizados. Para um orçamento preciso, que tal conversarmos? Posso conectar você com nossa equipe ou você prefere agendar uma reunião?';
    }

    if (message.includes('contato') || message.includes('falar') || message.includes('whatsapp')) {
      return 'Perfeito! Você pode falar diretamente com a equipe pelo WhatsApp: +55 62 98323-1110. Ou prefere que eu agende uma conversa?';
    }

    if (message.includes('portfolio') || message.includes('projetos') || message.includes('trabalhos')) {
      return 'Temos projetos incríveis! Você pode ver alguns na seção "Projetos" do menu. Quer que eu te mostre algo específico?';
    }

    if (message.includes('marketing') || message.includes('blockchain') || message.includes('ia') || message.includes('token')) {
      return 'Essa é nossa especialidade! Trabalhamos com marketing digital avançado, blockchain, IA e tokenização. Qual dessas áreas você quer explorar?';
    }

    if (message.includes('olá') || message.includes('oi') || message.includes('bom dia') || message.includes('boa tarde')) {
      return 'Olá! Fico feliz em ajudar. Como posso te auxiliar hoje?';
    }

    // Resposta padrão inteligente
    const defaultResponses = [
      'Interessante! Pode me contar mais sobre o que você precisa?',
      'Entendi. Deixa eu te ajudar melhor. Você está procurando algo específico ou quer conhecer nossos serviços?',
      'Ótima pergunta! Nossa equipe pode te ajudar com isso. Quer que eu conecte você com alguém especializado?',
      'Compreendo. Para te dar a melhor resposta, você poderia ser mais específico? Ou prefere que eu te mostre nossos serviços?'
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  handleQuickAction(action) {
    const actions = {
      servicos: 'Quais serviços vocês oferecem?',
      contato: 'Quero falar com um humano',
      portfolio: 'Mostre seu portfólio'
    };

    if (actions[action]) {
      this.addMessage(actions[action], 'user');
      setTimeout(() => this.simulateAIResponse(actions[action]), 300);
    }
  }

  showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message agent typing';
    typingDiv.id = 'typing-indicator';
    const avatarWrapper = document.createElement('div');
    avatarWrapper.className = 'message-avatar';
    const avatarImg = document.createElement('img');
    avatarImg.src = 'public/neo_ico.png';
    avatarImg.alt = 'NEO';
    avatarImg.className = 'message-avatar-img';
    avatarWrapper.appendChild(avatarImg);

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'message-content';
    const typingDots = document.createElement('div');
    typingDots.className = 'typing-dots';
    for (let i = 0; i < 3; i++) {
      typingDots.appendChild(document.createElement('span'));
    }

    contentWrapper.appendChild(typingDots);
    typingDiv.appendChild(avatarWrapper);
    typingDiv.appendChild(contentWrapper);

    messagesContainer.appendChild(typingDiv);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
}

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.chatAI = new ChatAI();
  });
} else {
  window.chatAI = new ChatAI();
}
