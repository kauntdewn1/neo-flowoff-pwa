// invertexto-simple.js - Versão simplificada da integração
class SimpleValidator {
  constructor() {
    this.isAvailable = false;
    this.checkAvailability();
  }

  async checkAvailability() {
    try {
      const response = await fetch('/api/health');
      if (!response.ok) {
        this.isAvailable = false;
        return;
      }
      const data = await response.json();
      this.isAvailable = data.apis?.invertexto?.includes('✅');
      if (this.isAvailable) {
        window.Logger?.log('🔍 API Invertexto disponível:', this.isAvailable);
      }
    } catch (error) {
      // Silencioso em produção - API pode não estar disponível
      this.isAvailable = false;
      if (window.Logger) {
        window.Logger.log('⚠️ API Invertexto não disponível (modo offline)');
      }
    }
  }

  // Validação simples de CPF (algoritmo)
  validarCPF(cpf) {
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    if (cpfLimpo.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false; // Todos iguais
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.charAt(10))) return false;
    
    return true;
  }

  // Validação simples de email
  validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Validação simples de CEP
  validarCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8;
  }

  // Simular consulta de CEP (dados fictícios)
  async consultarCEP(cep) {
    if (!this.validarCEP(cep)) return null;
    
    // Dados fictícios para demonstração
    const cepsFicticios = {
      '74000000': {
        logradouro: 'Rua das Flores',
        bairro: 'Centro',
        cidade: 'Goiânia',
        uf: 'GO',
        cep: '74000-000'
      },
      '01310100': {
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: '01310-100'
      },
      '20040020': {
        logradouro: 'Rua da Carioca',
        bairro: 'Centro',
        cidade: 'Rio de Janeiro',
        uf: 'RJ',
        cep: '20040-020'
      }
    };

    const cepLimpo = cep.replace(/\D/g, '');
    return cepsFicticios[cepLimpo] || null;
  }

  // Simular consulta de CNPJ (dados fictícios)
  async consultarCNPJ(cnpj) {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length !== 14) return null;
    
    // Dados fictícios para demonstração
    const cnpjsFicticios = {
      '12345678000195': {
        nome: 'Empresa Exemplo Ltda',
        endereco: 'Rua das Empresas, 123',
        telefone: '(11) 99999-9999',
        email: 'contato@empresaexemplo.com',
        atividade_principal: 'Desenvolvimento de Software'
      }
    };

    return cnpjsFicticios[cnpjLimpo] || null;
  }
}

// Classe para validação de formulários
class SimpleFormValidator {
  constructor(validator) {
    this.validator = validator;
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
    // Verificar se campos já existem (evitar duplicação com form-validator.js)
    const existingCep = form.querySelector('input[name="cep"]');
    const existingCpf = form.querySelector('input[name="cpf"]');
    
    // Adicionar campo CPF apenas se não existir
    if (!existingCpf) {
      const cpfField = document.createElement('label');
      cpfField.innerHTML = `
        CPF (opcional)<input name="cpf" color="gray" placeholder="000.000.000-00" autocomplete="off">
        <small class="validation-message" id="cpf-validation"></small>
      `;
      
      // Inserir após o campo WhatsApp
      const whatsappField = form.querySelector('input[name="whats"]');
      if (whatsappField) {
        const whatsappLabel = whatsappField.parentElement;
        whatsappLabel.insertAdjacentElement('afterend', cpfField);
      }
    }

    // NÃO adicionar campo CEP aqui - já é gerenciado por form-validator.js
    // Isso evita duplicação
  }

  setupRealTimeValidation(form) {
    // Validação de CPF em tempo real
    const cpfInput = form.querySelector('input[name="cpf"]');
    if (cpfInput) {
      cpfInput.addEventListener('blur', () => {
        const cpf = cpfInput.value;
        if (cpf && cpf.replace(/\D/g, '').length === 11) {
          const isValid = this.validator.validarCPF(cpf);
          this.showValidation('cpf-validation', isValid, 
            isValid ? '✅ CPF válido' : '❌ CPF inválido');
        }
      });
    }

    // Validação de email em tempo real
    const emailInput = form.querySelector('input[name="email"]');
    if (emailInput) {
      emailInput.addEventListener('blur', () => {
        const email = emailInput.value;
        if (email && email.includes('@')) {
          const isValid = this.validator.validarEmail(email);
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
          const dadosCEP = await this.validator.consultarCEP(cep);
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
      window.Logger?.error('Erro ao processar formulário:', error);
      statusElement.textContent = '❌ Erro ao processar dados. Tente novamente.';
      statusElement.style.color = '#ef4444';
    }
  }

  async validateFormData(formData) {
    const results = { allValid: true, errors: [], data: {} };
    
    // Validar email
    const email = formData.get('email');
    if (email) {
      const emailValid = this.validator.validarEmail(email);
      if (!emailValid) {
        results.errors.push('Email inválido');
        results.allValid = false;
      }
      results.data.emailValid = emailValid;
    }

    // Validar CPF se fornecido
    const cpf = formData.get('cpf');
    if (cpf) {
      const cpfValid = this.validator.validarCPF(cpf);
      if (!cpfValid) {
        results.errors.push('CPF inválido');
        results.allValid = false;
      }
      results.data.cpfValid = cpfValid;
    }

    // Consultar CEP se fornecido
    const cep = formData.get('cep');
    if (cep) {
      const dadosCEP = await this.validator.consultarCEP(cep);
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

    // Redirecionar para WhatsApp
    const whatsappUrl = `https://wa.me/5562983231110?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, '_blank');
  }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  window.Logger?.log('🚀 Inicializando validação simplificada...');
  
  // Criar instância do validador
  const validator = new SimpleValidator();
  
  // Aguardar um pouco e inicializar
  setTimeout(() => {
    // Inicializar validador de formulário
    const formValidator = new SimpleFormValidator(validator);
    
    window.Logger?.log('✅ Validação simplificada inicializada!');
  }, 1000);
});

// Exportar para uso global
window.SimpleValidator = SimpleValidator;
window.SimpleFormValidator = SimpleFormValidator;
