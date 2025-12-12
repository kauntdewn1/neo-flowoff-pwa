// Sistema de validação robusto de formulários com tratamento de erros
class FormValidator {
  constructor() {
    this.validator = null;
    this.errors = {};
    this.isValidating = false;
  }

  async init() {
    // Aguardar validador estar disponível
    if (window.SimpleValidator) {
      this.validator = new window.SimpleValidator();
      await this.validator.checkAvailability();
    }
    this.setupForm();
    this.setupCEPValidation();
  }

  setupCEPValidation() {
    const form = document.getElementById('lead-form');
    if (!form) return;

    // Verificar se campo CEP já existe (evitar duplicação)
    let cepInput = form.querySelector('input[name="cep"]');
    
    // Adicionar campo CEP apenas se não existir
    if (!cepInput) {
      const whatsappField = form.querySelector('input[name="whats"]');
      if (!whatsappField) return;
      
      const whatsappLabel = whatsappField.parentElement;
      const cepLabel = document.createElement('label');
      cepLabel.innerHTML = `
        CEP (opcional)<input name="cep" type="text" color="gray" placeholder="Digite apenas números (ex: 74230130)" autocomplete="postal-code" maxlength="8" inputmode="numeric" pattern="[0-9]{8}">
        <small class="validation-message" id="cep-validation"></small>
        <small style="display: block; margin-top: 4px; font-size: 0.75rem; color: rgba(255,255,255,0.5);">Digite apenas os 8 dígitos do CEP (sem hífen ou ponto)</small>
      `;
      whatsappLabel.insertAdjacentElement('afterend', cepLabel);
      cepInput = form.querySelector('input[name="cep"]');
    }

    if (cepInput) {
      // Formatação automática - aceita apenas números
      cepInput.addEventListener('input', (e) => {
        // Remove tudo que não é número
        let value = e.target.value.replace(/\D/g, '');
        
        // Limita a 8 dígitos
        if (value.length > 8) {
          value = value.slice(0, 8);
        }
        
        // Atualiza o valor (sem formatação visual, apenas números)
        e.target.value = value;
        this.clearError('cep');
        
        // Atualiza placeholder dinamicamente
        if (value.length === 0) {
          e.target.placeholder = 'Digite apenas números (ex: 74230130)';
        } else if (value.length < 8) {
          e.target.placeholder = `${value.length}/8 dígitos`;
        } else {
          e.target.placeholder = 'CEP completo!';
        }
      });

      // Prevenir entrada de caracteres não numéricos
      cepInput.addEventListener('keypress', (e) => {
        const char = String.fromCharCode(e.which);
        if (!/[0-9]/.test(char)) {
          e.preventDefault();
        }
      });

      // Formatação visual ao perder foco (apenas para exibição)
      cepInput.addEventListener('blur', async () => {
        const value = cepInput.value.replace(/\D/g, '');
        if (value.length === 8) {
          // Formata visualmente: 74230-130
          cepInput.value = value.slice(0, 5) + '-' + value.slice(5, 8);
        }
        await this.validateCEP(value); // Sempre enviar apenas números para validação
      });

      // Remover formatação ao focar (voltar para apenas números)
      cepInput.addEventListener('focus', () => {
        const value = cepInput.value.replace(/\D/g, '');
        cepInput.value = value;
        cepInput.placeholder = 'Digite apenas números (ex: 74230130)';
      });
    }
  }

  async validateCEP(cep) {
    if (!cep) return true;

    // Garantir que recebemos apenas números
    const cepLimpo = String(cep).replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      const statusEl = document.getElementById('cep-validation');
      if (statusEl) {
        statusEl.textContent = '⚠ CEP deve ter exatamente 8 dígitos';
        statusEl.style.color = '#f59e0b';
      }
      return true; // Não bloqueia o envio, apenas avisa
    }

    const statusEl = document.getElementById('cep-validation');
    if (statusEl) {
      statusEl.textContent = '• Consultando CEP...';
      statusEl.style.color = '#3b82f6';
    }

    try {
      const cepResponse = await this.fetchCepWithFallback(cepLimpo);
      const data = cepResponse?.body;

      if (!cepResponse?.ok || !data) {
        if (statusEl) {
          statusEl.textContent = '⚠ Erro ao consultar CEP. Você pode continuar mesmo assim.';
          statusEl.style.color = '#f59e0b';
        }
        this.clearError('cep');
        return true;
      }

      if (data.success && data.data) {
        const endereco = data.data;
        const logradouro = endereco.logradouro || endereco.address || endereco.street || '';
        const cidade = endereco.cidade || endereco.city || '';
        const uf = endereco.uf || endereco.state || '';
        const bairro = endereco.bairro || endereco.district || '';
        
        if (statusEl) {
          let enderecoCompleto = '';
          if (logradouro) enderecoCompleto += logradouro;
          if (bairro) enderecoCompleto += (enderecoCompleto ? ', ' : '') + bairro;
          if (cidade && uf) enderecoCompleto += (enderecoCompleto ? ', ' : '') + `${cidade}/${uf}`;
          
          statusEl.textContent = enderecoCompleto ? `✓ ${enderecoCompleto}` : '✓ CEP válido';
          statusEl.style.color = '#4ade80';
        }
        this.clearError('cep');
        return true;
      } else {
        const fallbackMessage = data?.message || data?.error || 'CEP não encontrado. Você pode continuar mesmo assim.';
        if (statusEl) {
          statusEl.textContent = `⚠ ${fallbackMessage}`;
          statusEl.style.color = '#f59e0b';
        }
        this.clearError('cep');
        return true; // Não bloqueia o envio
      }
    } catch (error) {
      window.Logger?.error('Erro ao consultar CEP:', error);
      if (statusEl) {
        statusEl.textContent = '⚠ Erro ao consultar CEP. Você pode continuar mesmo assim.';
        statusEl.style.color = '#f59e0b';
      }
      this.clearError('cep');
      return true; // Não bloqueia o envio
    }
  }

  async fetchCepWithFallback(cep) {
    try {
      return await this.fetchCepViaInvertexto(cep);
    } catch (error) {
      if (error?.message === 'FALLBACK_TO_LEGACY') {
        return await this.fetchCepViaLegacy(cep);
      }
      throw error;
    }
  }

  async fetchCepViaInvertexto(cep) {
    const response = await fetch('/api/invertexto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: 'cep',
        params: { cep }
      })
    });

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('application/json')) {
      throw new Error('FALLBACK_TO_LEGACY');
    }

    const body = await response.json();
    return { ok: response.ok, body };
  }

  async fetchCepViaLegacy(cep) {
    const response = await fetch(`/api/cep/${cep}`);
    if (!response.ok) {
      return { ok: false, body: null };
    }

    try {
      const body = await response.json();
      return { ok: true, body };
    } catch (parseError) {
      return { ok: false, body: null };
    }
  }

  setupForm() {
    const form = document.getElementById('lead-form');
    if (!form) return;

    // Interceptar submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit(e);
    });

    // Validação em tempo real
    this.setupRealTimeValidation(form);
  }

  setupRealTimeValidation(form) {
    // Nome
    const nameInput = form.querySelector('input[name="name"]');
    if (nameInput) {
      nameInput.addEventListener('blur', () => this.validateName(nameInput.value));
      nameInput.addEventListener('input', () => this.clearError('name'));
    }

    // Email
    const emailInput = form.querySelector('input[name="email"]');
    if (emailInput) {
      emailInput.addEventListener('blur', () => this.validateEmail(emailInput.value));
      emailInput.addEventListener('input', () => this.clearError('email'));
    }

    // WhatsApp
    const whatsInput = form.querySelector('input[name="whats"]');
    if (whatsInput) {
      whatsInput.addEventListener('input', (e) => {
        this.formatPhone(e.target);
        this.clearError('whats');
      });
      whatsInput.addEventListener('blur', () => this.validatePhone(whatsInput.value));
    }

    // Serviço
    const serviceSelect = form.querySelector('select[name="type"]');
    if (serviceSelect) {
      serviceSelect.addEventListener('change', () => this.clearError('type'));
    }
  }

  formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 0) {
      if (value.length <= 2) {
        value = `+${value}`;
      } else if (value.length <= 4) {
        value = `+${value.slice(0, 2)} (${value.slice(2)}`;
      } else if (value.length <= 9) {
        value = `+${value.slice(0, 2)} (${value.slice(2, 4)}) ${value.slice(4)}`;
      } else {
        value = `+${value.slice(0, 2)} (${value.slice(2, 4)}) ${value.slice(4, 9)}-${value.slice(9, 13)}`;
      }
    }
    
    input.value = value;
  }

  validateName(name) {
    const trimmed = name.trim();
    if (!trimmed) {
      this.setError('name', 'Nome é obrigatório');
      return false;
    }
    if (trimmed.length < 2) {
      this.setError('name', 'Nome deve ter pelo menos 2 caracteres');
      return false;
    }
    if (trimmed.length > 100) {
      this.setError('name', 'Nome muito longo');
      return false;
    }
    this.clearError('name');
    return true;
  }

  validateEmail(email) {
    if (!email) {
      this.setError('email', 'Email é obrigatório');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.setError('email', 'Email inválido');
      return false;
    }

    // Validação adicional de domínio
    const domain = email.split('@')[1];
    if (!domain || domain.length < 4) {
      this.setError('email', 'Email inválido');
      return false;
    }

    this.clearError('email');
    return true;
  }

  validatePhone(phone) {
    if (!phone) {
      this.setError('whats', 'WhatsApp é obrigatório');
      return false;
    }

    const cleaned = phone.replace(/\D/g, '');
    
    // Deve ter pelo menos 10 dígitos (código do país + número)
    if (cleaned.length < 10) {
      this.setError('whats', 'Número de WhatsApp inválido');
      return false;
    }

    // Se começar com 55 (Brasil), deve ter 13 dígitos
    if (cleaned.startsWith('55') && cleaned.length !== 13) {
      this.setError('whats', 'Número brasileiro deve ter 13 dígitos (+55 DDD 9XXXX-XXXX)');
      return false;
    }

    this.clearError('whats');
    return true;
  }

  validateService(service) {
    if (!service) {
      this.setError('type', 'Selecione um serviço');
      return false;
    }
    this.clearError('type');
    return true;
  }

  setError(field, message) {
    this.errors[field] = message;
    const input = document.querySelector(`[name="${field}"]`);
    if (input) {
      input.style.borderColor = '#ef4444';
      const statusEl = document.getElementById('lead-status');
      if (statusEl) {
        statusEl.textContent = `✗ ${message}`;
        statusEl.style.color = '#ef4444';
      }
    }
  }

  clearError(field) {
    delete this.errors[field];
    const input = document.querySelector(`[name="${field}"]`);
    if (input) {
      input.style.borderColor = '';
    }
  }

  async handleSubmit(e) {
    if (this.isValidating) return;
    
    this.isValidating = true;
    const form = e.target;
    const formData = new FormData(form);
    const statusEl = document.getElementById('lead-status');
    
    // Limpar erros anteriores
    this.errors = {};
    statusEl.textContent = '⏳ Validando dados...';
    statusEl.style.color = '#3b82f6';

    try {
      // Validações básicas
      const name = formData.get('name');
      const email = formData.get('email');
      const whats = formData.get('whats');
      const type = formData.get('type');

      let isValid = true;

      if (!this.validateName(name)) isValid = false;
      if (!this.validateEmail(email)) isValid = false;
      if (!this.validatePhone(whats)) isValid = false;
      if (!this.validateService(type)) isValid = false;

      if (!isValid) {
        const firstError = Object.values(this.errors)[0];
        statusEl.textContent = `✗ ${firstError}`;
        statusEl.style.color = '#ef4444';
        this.isValidating = false;
        return;
      }

      // Validações adicionais se validador disponível
      if (this.validator && this.validator.isAvailable) {
        statusEl.textContent = '• Validando com API...';
        
        // Validar email com API se disponível
        const emailValid = this.validator.validarEmail(email);
        if (!emailValid) {
          statusEl.textContent = '✗ Email inválido';
          statusEl.style.color = '#ef4444';
          this.isValidating = false;
          return;
        }

        // Validar CEP se fornecido (não bloqueia se falhar)
        const cep = formData.get('cep');
        if (cep) {
          await this.validateCEP(cep);
        }
      }

      // Se chegou aqui, tudo válido
      await this.sendToWhatsApp(formData);
      
    } catch (error) {
      window.Logger?.error('Erro ao processar formulário:', error);
      statusEl.textContent = '✗ Erro ao processar. Tente novamente ou entre em contato diretamente.';
      statusEl.style.color = '#ef4444';
    } finally {
      this.isValidating = false;
    }
  }

  async sendToWhatsApp(formData) {
    const statusEl = document.getElementById('lead-status');
    const isOnline = navigator.onLine;

    const projectTypes = {
      'site': 'Site / WebApp',
      'saas': 'SAAS / BAAS',
      'cripto': 'Tokenização / Cripto',
      'poston': 'POSTØN',
      'proia': 'PRO.IA'
    };

    const name = formData.get('name');
    const email = formData.get('email');
    const whats = formData.get('whats');
    const type = formData.get('type');
    const cep = formData.get('cep');
    const projectType = projectTypes[type] || type;

    const message = `→ *NOVO LEAD - FlowOFF*

👤 *Nome:* ${name}
📧 *Email:* ${email}
↓ *WhatsApp:* ${whats}
◉ *Tipo de Projeto:* ${projectType}${cep ? `\n📍 *CEP:* ${cep}` : ''}

💬 *Mensagem:* Olá MELLØ! Gostaria de iniciar um projeto com a FlowOFF.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '5562983231110';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Preparar dados para envio/armazenamento
    const leadData = {
      name,
      email,
      whats,
      type: projectType,
      cep: cep || null,
      message,
      timestamp: Date.now()
    };

    // Se offline, usar Background Sync
    if (!isOnline) {
      await this.queueForOfflineSync(leadData);
      statusEl.textContent = '📦 Formulário salvo! Será enviado quando a conexão for restaurada.';
      statusEl.style.color = '#f59e0b';
      
      // Ainda abrir WhatsApp (pode funcionar se o app estiver instalado)
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        document.getElementById('lead-form').reset();
      }, 500);
      
      return;
    }

    // Tentar enviar para API se disponível (opcional)
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if ('sync' in registration) {
          // Registrar Background Sync para garantir sincronização
          await registration.sync.register('form-submission').catch(() => {});
        }
      }
    } catch (syncError) {
      window.Logger?.log('Background Sync não disponível:', syncError);
    }

    // Enviar para API de leads (se existir)
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Form-Submission': 'true'
        },
        body: JSON.stringify(leadData)
      });

      if (response.ok) {
        statusEl.textContent = '✓ Dados enviados! Redirecionando...';
      } else if (response.status === 202) {
        // Enfileirado
        const data = await response.json();
        statusEl.textContent = data.message || '📦 Formulário enfileirado!';
        statusEl.style.color = '#f59e0b';
      }
    } catch (error) {
      // Se falhar, enfileirar localmente
      await this.queueForOfflineSync(leadData);
      window.Logger?.log('Erro ao enviar lead, enfileirado:', error);
    }

    // Sempre abrir WhatsApp
    statusEl.textContent = '✓ Dados válidos! Redirecionando...';
    statusEl.style.color = '#4ade80';
    
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      document.getElementById('lead-form').reset();
      statusEl.textContent = '✓ Redirecionado para WhatsApp!';
      navigator.vibrate?.(10);
    }, 500);
  }

  async queueForOfflineSync(leadData) {
    // Salvar no IndexedDB para sincronização posterior
    if (!window.OfflineQueue) {
      // Carregar offline-queue.js se não estiver disponível
      await this.loadOfflineQueue();
    }

    try {
      const queue = new window.OfflineQueue();
      await queue.init();
      await queue.addRequest({
        url: '/api/lead',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Form-Submission': 'true'
        },
        body: leadData
      });

      // Registrar Background Sync se disponível
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if ('sync' in registration) {
          await registration.sync.register('form-submission');
        }
      }
    } catch (error) {
      window.Logger?.error('Erro ao enfileirar formulário:', error);
    }
  }

  async loadOfflineQueue() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'js/offline-queue.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const validator = new FormValidator();
    validator.init();
    window.FormValidator = validator;
  });
} else {
  const validator = new FormValidator();
  validator.init();
  window.FormValidator = validator;
}
