# 🚀 API Invertexto - Integração Completa NEO.FLOWOFF

## 📋 **Visão Geral**

Esta documentação apresenta a integração completa da API Invertexto com o sistema NEO.FLOWOFF, incluindo todos os 10 endpoints disponíveis, exemplos de uso e configurações.

## 🔧 **Configuração**

### 1. **Obter Token da API**

1. Acesse: <https://invertexto.com/api>
2. Crie sua conta e obtenha seu token
3. Configure no arquivo `.env`:

```bash
# .env
INVERTEXTO_API_TOKEN=seu_token_real_aqui
PORT=3000
NODE_ENV=development
```

### 2. **Instalar Dependências**

```bash
npm install dotenv axios
```

## 🌐 **Endpoints Disponíveis**

### **1. 📊 Barcode - Códigos de Barras**

```javascript
// Gerar código de barras
const response = await fetch('/api/invertexto', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: 'barcode',
    params: {
      text: '123456789012',
      format: 'png', // png, svg, html
      width: 300,
      height: 100
    }
  })
});

const result = await response.json();
console.log('Código de barras:', result.data);
```

### **2. 📱 QR Code - QR Codes**

```javascript
// Gerar QR Code
const response = await fetch('/api/invertexto', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: 'qrcode',
    params: {
      text: 'https://neo.flowoff.com',
      size: 200,
      format: 'png' // png, svg, html
    }
  })
});

const result = await response.json();
console.log('QR Code:', result.data);
```

### **3. 🌍 GeoIP - Localização por IP**

```javascript
// Consultar localização por IP
const response = await fetch('/api/invertexto', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: 'geoip',
    params: {
      ip: '8.8.8.8' // IP para consultar
    }
  })
});

const result = await response.json();
console.log('Localização:', result.data);
```

### **4. 💱 Currency - Conversão de Moedas**

```javascript
// Converter moedas
const response = await fetch('/api/invertexto', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: 'currency',
    params: {
      from: 'USD',
      to: 'BRL',
      amount: 100
    }
  })
});

const result = await response.json();
console.log('Conversão:', result.data);
```

### **5. 🎭 Faker - Dados Falsos**
```javascript
// Gerar dados falsos
const response = await fetch('/api/invertexto', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: 'faker',
    params: {
      locale: 'pt_BR',
      type: 'name' // name, email, phone, address, etc.
    }
  })
});

const result = await response.json();
console.log('Dados falsos:', result.data);
```

### **6. ✅ Validator - Validação**
```javascript
// Validar CPF
const response = await fetch('/api/invertexto', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: 'validator',
    params: {
      type: 'cpf',
      value: '12345678901'
    }
  })
});

const result = await response.json();
console.log('Validação CPF:', result.data);

// Validar CNPJ
const response2 = await fetch('/api/invertexto', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: 'validator',
    params: {
      type: 'cnpj',
      value: '12345678000195'
    }
  })
});
```

### **7. 📮 CEP - Consulta de CEP**
```javascript
// Consultar CEP
const response = await fetch('/api/invertexto', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: 'cep',
    params: {
      cep: '74000000'
    }
  })
});

const result = await response.json();
console.log('Dados do CEP:', result.data);
```

### **8. 🏢 CNPJ - Consulta de CNPJ**

```javascript
// Consultar CNPJ
const response = await fetch('/api/invertexto', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: 'cnpj',
    params: {
      cnpj: '12345678000195'
    }
  })
});

const result = await response.json();
console.log('Dados do CNPJ:', result.data);
```

### **9. 🔢 Number-to-words - Números por Extenso**

```javascript
// Converter número para extenso
const response = await fetch('/api/invertexto', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: 'number-to-words',
    params: {
      number: 1234,
      locale: 'pt_BR'
    }
  })
});

const result = await response.json();
console.log('Número por extenso:', result.data);
```

### **10. 📧 Email-validator - Validação de Email**
```javascript
// Validar email
const response = await fetch('/api/invertexto', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: 'email-validator',
    params: {
      email: 'usuario@exemplo.com'
    }
  })
});

const result = await response.json();
console.log('Validação de email:', result.data);
```

## 🎯 **Exemplos Práticos para NEO.FLOWOFF**

### **1. Validação de Lead**
```javascript
async function validarLead(dadosLead) {
  const validacoes = [];
  
  // Validar CPF
  if (dadosLead.cpf) {
    const cpfResponse = await fetch('/api/invertexto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: 'validator',
        params: { type: 'cpf', value: dadosLead.cpf }
      })
    });
    const cpfResult = await cpfResponse.json();
    validacoes.push({ campo: 'cpf', valido: cpfResult.success });
  }
  
  // Validar email
  if (dadosLead.email) {
    const emailResponse = await fetch('/api/invertexto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: 'email-validator',
        params: { email: dadosLead.email }
      })
    });
    const emailResult = await emailResponse.json();
    validacoes.push({ campo: 'email', valido: emailResult.success });
  }
  
  return validacoes;
}
```

### **2. Gerar QR Code para WhatsApp**
```javascript
async function gerarQRWhatsApp(numero, mensagem) {
  const linkWhatsApp = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  
  const response = await fetch('/api/invertexto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: 'qrcode',
      params: {
        text: linkWhatsApp,
        size: 200,
        format: 'png'
      }
    })
  });
  
  const result = await response.json();
  return result.data.qr_code_url;
}
```

### **3. Consultar Dados de Empresa**
```javascript
async function consultarEmpresa(cnpj) {
  const response = await fetch('/api/invertexto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: 'cnpj',
      params: { cnpj }
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    return {
      nome: result.data.nome,
      endereco: result.data.endereco,
      telefone: result.data.telefone,
      email: result.data.email,
      atividade: result.data.atividade_principal
    };
  }
  
  return null;
}
```

### **4. Gerar Dados de Teste**
```javascript
async function gerarDadosTeste() {
  const tipos = ['name', 'email', 'phone', 'address'];
  const dados = {};
  
  for (const tipo of tipos) {
    const response = await fetch('/api/invertexto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: 'faker',
        params: {
          locale: 'pt_BR',
          type: tipo
        }
      })
    });
    
    const result = await response.json();
    dados[tipo] = result.data;
  }
  
  return dados;
}
```

## 📊 **Planos e Limites**

### **Plano Gratuito**
- ✅ 100 requisições/dia
- ✅ Todos os endpoints disponíveis
- ✅ Suporte básico

### **Plano Pro**
- ✅ 1.000 requisições/dia
- ✅ Prioridade nas requisições
- ✅ Suporte prioritário
- ✅ Logs detalhados

### **Plano Enterprise**
- ✅ Requisições ilimitadas
- ✅ SLA garantido
- ✅ Suporte dedicado
- ✅ Integração personalizada

## 🔒 **Segurança**

### **Autenticação**
- Token obrigatório em todas as requisições
- Token enviado automaticamente pelo proxy
- Validação de token em cada requisição

### **Rate Limiting**
- Limite por token/IP
- Headers de rate limit nas respostas
- Bloqueio temporário em caso de excesso

### **Validação de Entrada**
- Validação de todos os parâmetros
- Sanitização de dados
- Prevenção de injection

## 🚀 **Como Usar**

### **1. Iniciar Servidor**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

### **2. Testar Integração**
```bash
# Teste básico
curl -X POST http://localhost:3000/api/invertexto \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"cep","params":{"cep":"74000000"}}'

# Teste com validação
curl -X POST http://localhost:3000/api/invertexto \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"validator","params":{"type":"cpf","value":"12345678901"}}'
```

### **3. Monitorar Logs**
```bash
# Logs do servidor
tail -f logs/server.log

# Logs da API
tail -f logs/api.log
```

## 📈 **Métricas e Monitoramento**

### **Health Check**
```bash
curl http://localhost:3000/api/health
```

Resposta:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "NEO FlowOff Local Server",
  "apis": {
    "invertexto": "✅ Configurado"
  }
}
```

### **Métricas Disponíveis**
- ✅ Requisições por minuto
- ✅ Taxa de sucesso/erro
- ✅ Tempo de resposta médio
- ✅ Endpoints mais utilizados
- ✅ Uso de tokens

## 🛠️ **Troubleshooting**

### **Erro: Token não configurado**
```bash
# Verificar arquivo .env
cat .env | grep INVERTEXTO_API_TOKEN

# Configurar token
echo "INVERTEXTO_API_TOKEN=seu_token_aqui" >> .env
```

### **Erro: Timeout**
```bash
# Verificar conectividade
ping invertexto.com

# Verificar DNS
nslookup invertexto.com
```

### **Erro: Rate Limit**
```bash
# Verificar limites
curl -I http://localhost:3000/api/invertexto

# Aguardar reset (geralmente 1 hora)
```

## 📞 **Suporte**

- 📧 **Email**: suporte@invertexto.com
- 💬 **Discord**: https://discord.gg/invertexto
- 📖 **Documentação**: https://docs.invertexto.com
- 🐛 **Issues**: https://github.com/invertexto/api/issues

---

**🚀 Esta integração permite que a IA NEO.FLOWOFF utilize todos os recursos da API Invertexto para validação, geração de dados e consultas, melhorando significativamente a experiência do usuário e a qualidade dos dados coletados.**
