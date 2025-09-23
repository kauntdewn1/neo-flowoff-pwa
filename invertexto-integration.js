// invertexto-integration.js - Integração da API Invertexto com o site NEO.FLOWOFF
class InvertextoAPI {
  constructor() {
    this.baseUrl = 'https://neo-flowoff.netlify.app/api/invertexto';
    this.isAvailable = false;
    this.checkAvailability();
  }

  // Verificar se a API está disponível
  async checkAvailability() {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api/invertexto', '/api/health')}`);
      const data = await response.json();
      this.isAvailable = data.apis?.invertexto?.includes('✅');
      console.log('🔍 API Invertexto disponível:', this.isAvailable);
    } catch (error) {
      console.log('⚠️ API Invertexto não disponível:', error.message);
      this.isAvailable = false;
    }
  }

  // Fazer requisição para a API
  async makeRequest(endpoint, params = {}) {
    if (!this.isAvailable) {
      console.log('⚠️ API Invertexto não disponível');
      return { success: false, error: 'API não disponível' };
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint, params })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Erro na API Invertexto:', error);
      return { success: false, error: error.message };
    }
  }

  // Validar CPF
  async validarCPF(cpf) {
    const cpfLimpo = cpf.replace(/\D/g, '');
    const result = await this.makeRequest('validator', { type: 'cpf', value: cpfLimpo });
    return result.success && result.data?.valid;
  }

  // Validar email
  async validarEmail(email) {
    const result = await this.makeRequest('email-validator', { email });
    return result.success && result.data?.valid;
  }

  // Consultar CEP
  async consultarCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    const result = await this.makeRequest('cep', { cep: cepLimpo });
    return result.success ? result.data : null;
  }

  // Consultar CNPJ
  async consultarCNPJ(cnpj) {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    const result = await this.makeRequest('cnpj', { cnpj: cnpjLimpo });
    return result.success ? result.data : null;
  }

  // Gerar QR Code
  async gerarQRCode(texto, tamanho = 200) {
    const result = await this.makeRequest('qrcode', { 
      text: texto, 
      size: tamanho, 
      format: 'png' 
    });
    return result.success ? result.data.qr_code_url : null;
  }

  // Gerar dados falsos para demonstração
  async gerarDadosFalsos(tipo = 'name') {
    const result = await this.makeRequest('faker', { 
      locale: 'pt_BR', 
      type: tipo 
    });
    return result.success ? result.data : null;
  }
}

// Classe para validação de formulários
class FormValidator {
  constructor(api) {
    this.api = api;
    this.setupFormValidation();
  }

  setupFormValidation() {
    const form = document.getElementById('lead-form');
    if (!form) return;

    // Adicionar campos de validação
    this.addValidationFields(form);
    
    // Interceptar envio do formulário
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit(e);
    });

    // Validação em tempo real
    this.setupRealTimeValidation(form);
  }

  addValidationFields(form) {
    // Adicionar campo CPF (opcional)
    const cpfField = document.createElement('label');
    cpfField.innerHTML = `
      CPF (opcional)<input name="cpf" color="gray" placeholder="000.000.000-00" autocomplete="off">
      <small class="validation-message" id="cpf-validation"></small>
    `;
    
    // Inserir após o campo WhatsApp
    const whatsappField = form.querySelector('input[name="whats"]').parentElement;
    whatsappField.insertAdjacentElement('afterend', cpfField);

    // Adicionar campo CEP (opcional)
    const cepField = document.createElement('label');
    cepField.innerHTML = `
      CEP (opcional)<input name="cep" color="gray" placeholder="00000-000" autocomplete="off">
      <small class="validation-message" id="cep-validation"></small>
    `;
    
    // Inserir após o campo CPF
    cpfField.insertAdjacentElement('afterend', cepField);
  }

  setupRealTimeValidation(form) {
    // Validação de CPF em tempo real
    const cpfInput = form.querySelector('input[name="cpf"]');
    if (cpfInput) {
      cpfInput.addEventListener('blur', async () => {
        const cpf = cpfInput.value;
        if (cpf && cpf.replace(/\D/g, '').length === 11) {
          const isValid = await this.api.validarCPF(cpf);
          this.showValidation('cpf-validation', isValid, 
            isValid ? '✅ CPF válido' : '❌ CPF inválido');
        }
      });
    }

    // Validação de email em tempo real
    const emailInput = form.querySelector('input[name="email"]');
    if (emailInput) {
      emailInput.addEventListener('blur', async () => {
        const email = emailInput.value;
        if (email && email.includes('@')) {
          const isValid = await this.api.validarEmail(email);
          this.showValidation('email-validation', isValid,
            isValid ? '✅ Email válido' : '❌ Email inválido');
        }
      });
    }

    // Consulta de CEP em tempo real
    const cepInput = form.querySelector('input[name="cep"]');
    if (cepInput) {
      cepInput.addEventListener('blur', async () => {
        const cep = cepInput.value;
        if (cep && cep.replace(/\D/g, '').length === 8) {
          const dadosCEP = await this.api.consultarCEP(cep);
          if (dadosCEP) {
            this.showValidation('cep-validation', true, 
              `📍 ${dadosCEP.logradouro}, ${dadosCEP.bairro}, ${dadosCEP.cidade}/${dadosCEP.uf}`);
          } else {
            this.showValidation('cep-validation', false, '❌ CEP não encontrado');
          }
        }
      });
    }
  }

  showValidation(elementId, isValid, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.style.color = isValid ? '#4ade80' : '#ef4444';
      element.style.fontSize = '0.875rem';
      element.style.marginTop = '0.25rem';
      element.style.display = 'block';
    }
  }

  async handleFormSubmit(event) {
    const form = event.target;
    const formData = new FormData(form);
    const statusElement = document.getElementById('lead-status');
    
    // Mostrar loading
    statusElement.textContent = '⏳ Validando dados...';
    statusElement.style.color = '#3b82f6';

    try {
      // Validar dados
      const validationResults = await this.validateFormData(formData);
      
      if (validationResults.allValid) {
        // Enviar para WhatsApp com dados validados
        await this.sendToWhatsApp(formData, validationResults);
        statusElement.textContent = '✅ Dados validados! Redirecionando para WhatsApp...';
        statusElement.style.color = '#4ade80';
      } else {
        // Mostrar erros
        statusElement.textContent = '❌ ' + validationResults.errors.join(', ');
        statusElement.style.color = '#ef4444';
      }
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
      statusElement.textContent = '❌ Erro ao processar dados. Tente novamente.';
      statusElement.style.color = '#ef4444';
    }
  }

  async validateFormData(formData) {
    const results = { allValid: true, errors: [], data: {} };
    
    // Validar email
    const email = formData.get('email');
    if (email) {
      const emailValid = await this.api.validarEmail(email);
      if (!emailValid) {
        results.errors.push('Email inválido');
        results.allValid = false;
      }
      results.data.emailValid = emailValid;
    }

    // Validar CPF se fornecido
    const cpf = formData.get('cpf');
    if (cpf) {
      const cpfValid = await this.api.validarCPF(cpf);
      if (!cpfValid) {
        results.errors.push('CPF inválido');
        results.allValid = false;
      }
      results.data.cpfValid = cpfValid;
    }

    // Consultar CEP se fornecido
    const cep = formData.get('cep');
    if (cep) {
      const dadosCEP = await this.api.consultarCEP(cep);
      results.data.cepData = dadosCEP;
    }

    return results;
  }

  async sendToWhatsApp(formData, validationResults) {
    const nome = formData.get('name');
    const email = formData.get('email');
    const whatsapp = formData.get('whats');
    const servico = formData.get('type');
    const cpf = formData.get('cpf');
    const cep = formData.get('cep');

    // Construir mensagem personalizada
    let mensagem = `Olá! Vim pelo site NEO.FLOWOFF e quero saber mais sobre os serviços.\n\n`;
    mensagem += `📋 *Dados do Lead:*\n`;
    mensagem += `👤 Nome: ${nome}\n`;
    mensagem += `📧 Email: ${email}\n`;
    mensagem += `📱 WhatsApp: ${whatsapp}\n`;
    mensagem += `🎯 Serviço: ${servico}\n`;

    if (cpf) {
      mensagem += `🆔 CPF: ${cpf} ${validationResults.data.cpfValid ? '✅' : '❌'}\n`;
    }

    if (cep && validationResults.data.cepData) {
      const cepData = validationResults.data.cepData;
      mensagem += `📍 Endereço: ${cepData.logradouro}, ${cepData.bairro}, ${cepData.cidade}/${cepData.uf}\n`;
    }

    mensagem += `\n🚀 *Validação Automática:*\n`;
    mensagem += `✅ Email: ${validationResults.data.emailValid ? 'Válido' : 'Inválido'}\n`;
    if (cpf) {
      mensagem += `✅ CPF: ${validationResults.data.cpfValid ? 'Válido' : 'Inválido'}\n`;
    }
    if (cep) {
      mensagem += `✅ CEP: ${validationResults.data.cepData ? 'Encontrado' : 'Não encontrado'}\n`;
    }

    // Gerar QR Code se possível
    if (this.api.isAvailable) {
      try {
        const qrCodeUrl = await this.api.gerarQRCode(mensagem, 150);
        if (qrCodeUrl) {
          mensagem += `\n📱 QR Code gerado automaticamente!`;
        }
      } catch (error) {
        console.log('Não foi possível gerar QR Code:', error);
      }
    }

    // Redirecionar para WhatsApp
    const whatsappUrl = `https://wa.me/5562983231110?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, '_blank');
  }
}

// Classe para funcionalidades extras
class InvertextoFeatures {
  constructor(api) {
    this.api = api;
    this.setupExtraFeatures();
  }

  setupExtraFeatures() {
    // Adicionar botão de teste na página
    this.addTestButton();
    
    // Adicionar funcionalidade de consulta rápida
    this.addQuickConsultation();
  }

  addTestButton() {
    // Criar botão de teste (apenas em desenvolvimento)
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('netlify')) {
      const testButton = document.createElement('button');
      testButton.textContent = '🧪 Testar API Invertexto';
      testButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        background: #3b82f6;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      `;
      
      testButton.addEventListener('click', () => this.runTests());
      document.body.appendChild(testButton);
    }
  }

  addQuickConsultation() {
    // Adicionar funcionalidade de consulta rápida no chat
    this.setupQuickConsultation();
  }

  setupQuickConsultation() {
    // Interceptar mensagens que contenham CPF, CEP ou CNPJ
    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        const text = e.target.value;
        this.detectAndValidate(text, e.target);
      }
    });
  }

  async detectAndValidate(text, element) {
    // Detectar CPF
    const cpfMatch = text.match(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/);
    if (cpfMatch) {
      const cpf = cpfMatch[0];
      const isValid = await this.api.validarCPF(cpf);
      this.showInlineValidation(element, `CPF ${isValid ? 'válido' : 'inválido'}`, isValid);
    }

    // Detectar CEP
    const cepMatch = text.match(/\d{5}-?\d{3}/);
    if (cepMatch) {
      const cep = cepMatch[0];
      const dadosCEP = await this.api.consultarCEP(cep);
      if (dadosCEP) {
        this.showInlineValidation(element, `CEP: ${dadosCEP.cidade}/${dadosCEP.uf}`, true);
      }
    }

    // Detectar CNPJ
    const cnpjMatch = text.match(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/);
    if (cnpjMatch) {
      const cnpj = cnpjMatch[0];
      const dadosCNPJ = await this.api.consultarCNPJ(cnpj);
      if (dadosCNPJ) {
        this.showInlineValidation(element, `Empresa: ${dadosCNPJ.nome}`, true);
      }
    }
  }

  showInlineValidation(element, message, isValid) {
    // Remover validação anterior
    const existingValidation = element.parentElement.querySelector('.inline-validation');
    if (existingValidation) {
      existingValidation.remove();
    }

    // Criar nova validação
    const validation = document.createElement('div');
    validation.className = 'inline-validation';
    validation.textContent = message;
    validation.style.cssText = `
      position: absolute;
      top: -25px;
      left: 0;
      background: ${isValid ? '#4ade80' : '#ef4444'};
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 1000;
      pointer-events: none;
    `;

    element.parentElement.style.position = 'relative';
    element.parentElement.appendChild(validation);

    // Remover após 3 segundos
    setTimeout(() => {
      if (validation.parentElement) {
        validation.remove();
      }
    }, 3000);
  }

  async runTests() {
    console.log('🧪 Executando testes da API Invertexto...');
    
    const tests = [
      { name: 'Validação CPF', test: () => this.api.validarCPF('12345678901') },
      { name: 'Validação Email', test: () => this.api.validarEmail('teste@exemplo.com') },
      { name: 'Consulta CEP', test: () => this.api.consultarCEP('74000000') },
      { name: 'Gerar QR Code', test: () => this.api.gerarQRCode('Teste NEO.FLOWOFF') }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        console.log(`✅ ${test.name}:`, result);
      } catch (error) {
        console.log(`❌ ${test.name}:`, error.message);
      }
    }
  }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando integração com API Invertexto...');
  
  // Criar instância da API
  const api = new InvertextoAPI();
  
  // Aguardar API estar disponível
  setTimeout(() => {
    // Inicializar validador de formulário
    const validator = new FormValidator(api);
    
    // Inicializar funcionalidades extras
    const features = new InvertextoFeatures(api);
    
    console.log('✅ Integração com API Invertexto inicializada!');
  }, 2000);
});

// Exportar para uso global
window.InvertextoAPI = InvertextoAPI;
window.FormValidator = FormValidator;
window.InvertextoFeatures = InvertextoFeatures;
