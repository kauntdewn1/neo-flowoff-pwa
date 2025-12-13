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

    // Salvar no histórico
    this.messages.push({ type, text });

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

  async simulateAIResponse(userMessage) {
    this.isTyping = true;
    this.showTypingIndicator();

    try {
      // Tentar API de IA primeiro
      const aiResponse = await this.fetchAIResponse(userMessage);
      
      if (aiResponse && aiResponse.trim()) {
        this.hideTypingIndicator();
        this.addMessage(aiResponse, 'agent');
        this.isTyping = false;
        return;
      }
      
      // Se API retornou vazio/null, logar para debug
      console.warn('⚠️ AI API retornou resposta vazia. Verificando configuração...');
    } catch (error) {
      console.error('❌ Erro ao chamar API de IA:', error);
      window.Logger?.warn('AI API failed, using fallback:', error);
    }

    // Fallback: conhecimento + respostas pré-definidas
    // Mas avisar que não é IA real
    setTimeout(() => {
      this.hideTypingIndicator();
      this.fetchKnowledgeIfNeeded(userMessage)
        .then(knowledge => {
          if (knowledge) {
            this.addMessage(knowledge, 'agent');
          } else {
            // Resposta honesta quando não há IA disponível
            const response = this.generateHonestResponse(userMessage.toLowerCase());
            this.addMessage(response, 'agent');
          }
          this.isTyping = false;
        })
        .catch(() => {
          const response = this.generateHonestResponse(userMessage.toLowerCase());
          this.addMessage(response, 'agent');
          this.isTyping = false;
        });
    }, 500);
  }

  async fetchAIResponse(message) {
    try {
      // Construir histórico de mensagens
      const history = this.messages
        .slice(-10) // Últimas 10 mensagens
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      // Sistema de prompt para o agente
      const systemPrompt = `Você é NEO, o assistente IA da FlowOFF. A FlowOFF é uma agência especializada em:
- Marketing digital avançado e estratégia
- Blockchain e Web3
- Desenvolvimento de sistemas, WebApps e PWAs
- Tokenização de ativos
- Agentes IA personalizados
- Arquitetura de ecossistemas digitais

Você deve:
- Responder de forma direta, útil e profissional
- Ser proativo em ajudar, não apenas direcionar para humanos
- Usar conhecimento real sobre os serviços da FlowOFF
- Manter tom conversacional mas técnico quando necessário
- Se não souber algo específico, seja honesto mas ofereça alternativas

NÃO direcione imediatamente para humanos. Tente resolver primeiro com sua inteligência.`;

      // Tentar chamada direta às APIs (client-side) primeiro
      // Isso elimina a dependência de Netlify Functions
      const directResponse = await this.fetchDirectAI(message, history, systemPrompt);
      if (directResponse) {
        return directResponse;
      }

      // Fallback: tentar Netlify Function (se ainda disponível)
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: message,
            history: history
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.response && data.response.trim()) {
            console.log('✅ Resposta IA recebida via Netlify Function (modelo:', data.model || 'desconhecido', ')');
            return data.response;
          }
        }
      } catch (netlifyError) {
        console.warn('⚠️ Netlify Function não disponível, usando apenas client-side');
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar resposta IA:', error);
      window.Logger?.warn('AI response fetch failed:', error);
      return null;
    }
  }

  async fetchDirectAI(message, history, systemPrompt) {
    // Obter API keys do window.config ou variáveis de ambiente do build
    // As keys podem ser injetadas no build via script ou configuradas no index.html
    const config = window.APP_CONFIG || {};
    const OPENAI_API_KEY = config.OPENAI_API_KEY || '';
    const GOOGLE_API_KEY = config.GOOGLE_API_KEY || '';
    const OPENAI_MODEL = config.OPENAI_MODEL || config.LLM_MODEL || 'gpt-4o-mini';
    const GEMINI_MODEL = config.GEMINI_MODEL || config.LLM_MODEL_FALLBACK || 'gemini-2.0-flash-exp';

    // Se não houver keys configuradas, retornar null
    if (!OPENAI_API_KEY && !GOOGLE_API_KEY) {
      console.warn('⚠️ Nenhuma API key configurada. Configure OPENAI_API_KEY ou GOOGLE_API_KEY em window.APP_CONFIG');
      return null;
    }

    // Tentar OpenAI primeiro
    if (OPENAI_API_KEY) {
      try {
        const messages = [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: message }
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            messages: messages,
            temperature: 0.7,
            max_tokens: 500
          })
        });

        if (response.ok) {
          const data = await response.json();
          const aiResponse = data.choices?.[0]?.message?.content?.trim();
          if (aiResponse) {
            console.log('✅ Resposta OpenAI recebida (client-side, modelo:', OPENAI_MODEL, ')');
            return aiResponse;
          }
        } else if (response.status === 401) {
          console.warn('⚠️ OpenAI API key inválida ou expirada');
        }
      } catch (error) {
        console.warn('❌ Erro ao chamar OpenAI:', error.message);
      }
    }

    // Fallback para Gemini se OpenAI falhar
    if (GOOGLE_API_KEY) {
      try {
        const promptText = `${systemPrompt}\n\nHistórico:\n${history.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUsuário: ${message}\n\nNEO:`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: promptText
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (aiResponse) {
            console.log('✅ Resposta Gemini recebida (client-side, modelo:', GEMINI_MODEL.replace('-exp', ''), ')');
            return aiResponse;
          }
        } else if (response.status === 401 || response.status === 403) {
          console.warn('⚠️ Google API key inválida ou expirada');
        }
      } catch (error) {
        console.warn('❌ Erro ao chamar Gemini:', error.message);
      }
    }

    return null;
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

  generateHonestResponse(message) {
    // Respostas honestas quando IA não está disponível
    // Não fingir ser IA quando não é
    
    if (message.includes('serviço') || message.includes('o que fazem') || message.includes('servicos')) {
      return 'A FlowOFF oferece desenvolvimento de Sites/WebApps, SAAS/BAAS, Tokenização de Ativos e Agentes IA. Para informações detalhadas, entre em contato: +55 62 98323-1110';
    }

    if (message.includes('preço') || message.includes('quanto') || message.includes('custo')) {
      return 'Nossos projetos são personalizados. Para um orçamento preciso, entre em contato pelo WhatsApp: +55 62 98323-1110';
    }

    if (message.includes('contato') || message.includes('falar') || message.includes('whatsapp')) {
      return 'Entre em contato direto pelo WhatsApp: +55 62 98323-1110 ou visite flowoff.xyz';
    }

    if (message.includes('portfolio') || message.includes('projetos') || message.includes('trabalhos')) {
      return 'Veja nossos projetos na seção "Projetos" do menu ou visite flowoff.xyz';
    }

    if (message.includes('marketing') || message.includes('blockchain') || message.includes('ia') || message.includes('token')) {
      return 'A FlowOFF trabalha com marketing digital avançado, blockchain, IA e tokenização. Para mais informações: +55 62 98323-1110';
    }

    if (message.includes('olá') || message.includes('oi') || message.includes('bom dia') || message.includes('boa tarde')) {
      return 'Olá! Para informações sobre nossos serviços, entre em contato: +55 62 98323-1110 ou visite flowoff.xyz';
    }

    // Resposta padrão honesta
    return 'Para informações detalhadas sobre nossos serviços, entre em contato pelo WhatsApp: +55 62 98323-1110 ou visite flowoff.xyz';
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
