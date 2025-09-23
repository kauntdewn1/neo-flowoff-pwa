# 🚀 Integração API Invertexto - NEO.FLOWOFF

## 📋 **Implementação Completa**

A integração com a API Invertexto foi implementada com sucesso! Agora você tem acesso a todos os 10 endpoints da API através do seu servidor local.

## 🔧 **Como Configurar**

### **1. Obter Token da API**
1. Acesse: https://invertexto.com/api
2. Crie sua conta e obtenha seu token
3. Copie o arquivo `env-example.txt` para `.env`
4. Substitua `seu_token_real_aqui` pelo seu token real

```bash
# Copiar arquivo de exemplo
cp env-example.txt .env

# Editar com seu token
nano .env
```

### **2. Instalar Dependências**
```bash
npm install
```

### **3. Iniciar Servidor**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🧪 **Como Testar**

### **Teste Rápido**
```bash
npm run test-invertexto-quick
```

### **Teste Completo**
```bash
npm run test-invertexto
```

### **Teste Manual**
```bash
# Teste CEP
curl -X POST http://localhost:3000/api/invertexto \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"cep","params":{"cep":"74000000"}}'

# Teste Validação CPF
curl -X POST http://localhost:3000/api/invertexto \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"validator","params":{"type":"cpf","value":"12345678901"}}'
```

## 📊 **Endpoints Disponíveis**

| Endpoint | Descrição | Exemplo |
|----------|-----------|---------|
| `barcode` | Códigos de barras | `{"text":"123456789012"}` |
| `qrcode` | QR Codes | `{"text":"https://neo.flowoff.com"}` |
| `geoip` | Localização por IP | `{"ip":"8.8.8.8"}` |
| `currency` | Conversão de moedas | `{"from":"USD","to":"BRL","amount":100}` |
| `faker` | Dados falsos | `{"locale":"pt_BR","type":"name"}` |
| `validator` | Validação (CPF/CNPJ) | `{"type":"cpf","value":"12345678901"}` |
| `cep` | Consulta de CEP | `{"cep":"74000000"}` |
| `cnpj` | Consulta de CNPJ | `{"cnpj":"12345678000195"}` |
| `number-to-words` | Números por extenso | `{"number":1234,"locale":"pt_BR"}` |
| `email-validator` | Validação de email | `{"email":"usuario@exemplo.com"}` |

## 🎯 **Exemplos Práticos**

### **Validação de Lead**
```javascript
async function validarLead(dadosLead) {
  const response = await fetch('/api/invertexto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: 'validator',
      params: { type: 'cpf', value: dadosLead.cpf }
    })
  });
  
  const result = await response.json();
  return result.success && result.data.valid;
}
```

### **Gerar QR Code WhatsApp**
```javascript
async function gerarQRWhatsApp(numero, mensagem) {
  const linkWhatsApp = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  
  const response = await fetch('/api/invertexto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: 'qrcode',
      params: { text: linkWhatsApp, size: 200, format: 'png' }
    })
  });
  
  const result = await response.json();
  return result.data.qr_code_url;
}
```

### **Consultar Dados de Empresa**
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
  return result.success ? result.data : null;
}
```

## 📈 **Monitoramento**

### **Health Check**
```bash
curl http://localhost:3000/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "NEO FlowOff Local Server",
  "apis": {
    "localMistral": "✅ Disponível",
    "invertexto": "✅ Configurado"
  }
}
```

## 🚨 **Troubleshooting**

### **Erro: Token não configurado**
```bash
# Verificar arquivo .env
cat .env | grep INVERTEXTO_API_TOKEN

# Se não existir, copiar exemplo
cp env-example.txt .env
```

### **Erro: Servidor não responde**
```bash
# Verificar se está rodando
curl http://localhost:3000/api/health

# Reiniciar servidor
npm run dev
```

### **Erro: Timeout**
```bash
# Verificar conectividade
ping invertexto.com

# Verificar DNS
nslookup invertexto.com
```

## 📚 **Documentação Completa**

- 📖 **Documentação detalhada**: `INVERTEXTO_API_EXAMPLES.md`
- 🧪 **Script de teste**: `test-invertexto.js`
- ⚙️ **Configuração**: `env-example.txt`

## 🎉 **Próximos Passos**

1. **Configure seu token** no arquivo `.env`
2. **Teste a integração** com `npm run test-invertexto-quick`
3. **Integre com sua IA** usando os exemplos fornecidos
4. **Monitore o uso** através do health check

---

**🚀 A integração está pronta! Agora sua IA NEO.FLOWOFF pode usar todos os recursos da API Invertexto para validação, geração de dados e consultas.**
