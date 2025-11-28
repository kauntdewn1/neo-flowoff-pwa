# 🔑 Configuração API Invertexto - Protocolo NΞØ

## 📋 Preenchimento do Formulário

### 1. Nome do Token
```
neo-protocol
```
**Recomendação**: Use `neo-protocol` (sem hífen ou espaços extras)

---

### 2. Domínio Autorizado para Front

**Escolha o domínio de PRODUÇÃO:**

```
https://flowoff.xyz
```

**Por quê?**

- `flowoff.xyz` é o domínio principal de produção (conforme README)
- `neo-flowoff.netlify.app` é apenas para staging/deploy previews
- O token deve ser configurado para o domínio de produção

**⚠️ IMPORTANTE**: Se você precisar testar em staging também, pode criar um segundo token separado para `neo-flowoff.netlify.app`, mas o principal deve ser `flowoff.xyz`

---

### 3. Requisições por Minuto

**Recomendação baseada no uso:**

```
60 requisições por minuto
```

**Cálculo:**
- Formulário de lead: ~3-5 requisições por submissão (validação de email, CPF, CEP, CNPJ)
- Tráfego esperado: ~10-20 leads/hora = ~1-2 requisições/minuto em média
- Picos: até 10-15 leads simultâneos = ~50-60 requisições/minuto
- **60 req/min** oferece margem de segurança

**Alternativas:**
- **30 req/min**: Se quiser economizar (pode ser limitante em picos)
- **100 req/min**: Se espera muito tráfego (mais caro, mas mais seguro)

---

### 4. Restrição de API - APIs que o token pode chamar

**APIs necessárias (baseado no código atual):**

✅ **Marcar estas APIs (ESSENCIAIS):**

1. ✅ **cep** - Consulta de CEP (usado em `invertexto-simple.js` e `invertexto-integration.js`)
2. ✅ **cnpj** - Consulta de CNPJ (usado em `invertexto-integration.js`)
3. ✅ **validator** - Validação geral (CPF, etc.) - usado em `invertexto-integration.js`
4. ✅ **email-validator** - Validação de email (usado em `invertexto-integration.js`)

**APIs usadas no código (RECOMENDADAS):**

5. ✅ **qrcode** - Geração de QR Code (usado em `invertexto-integration.js` - método `gerarQRCode`)
6. ✅ **faker** - Dados de teste (usado em `invertexto-integration.js` - método `gerarDadosFalsos`)

**APIs opcionais (úteis para futuro):**

7. ⚠️ **currency** - Conversão de moedas (pode ser útil para FlowPay)
8. ⚠️ **number-to-words** - Converter números em palavras (útil para relatórios)

**APIs NÃO necessárias (não marcar):**

❌ **barcode** - Não usado no projeto
❌ **geoip** - Não usado no projeto
❌ **holidays** - Não usado no projeto
❌ **fipe** - Não usado no projeto

---

## 📝 Resumo do Preenchimento

```
Nome do Token: neo-protocol
Domínio Autorizado: https://flowoff.xyz
Requisições por Minuto: 60
APIs Habilitadas (MARCAR):
  ✅ cep
  ✅ cnpj
  ✅ validator
  ✅ email-validator
  ✅ qrcode
  ✅ faker
  ⚠️ currency (opcional - futuro)
  ⚠️ number-to-words (opcional - futuro)
```

---

## 🔧 Após Criar o Token

1. **Copiar o token gerado**
2. **Atualizar `.env`**:

   ```bash
   INVERTEXTO_API_TOKEN=seu_token_gerado_aqui
   ```
3. **Atualizar variáveis de ambiente no Netlify**:
   - Acesse: Netlify Dashboard → Site Settings → Environment Variables
   - Adicione/atualize: `INVERTEXTO_API_TOKEN`

---

## 🧪 Testar a Configuração

Após configurar, teste com:

```bash
# No terminal
curl -X POST https://flowoff.xyz/api/invertexto \
  -H "Content-Type: application/json" \
  -d '{"endpoint": "cep", "params": {"cep": "01310100"}}'
```

Ou no console do navegador:
```javascript
fetch('/api/invertexto', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: 'cep',
    params: { cep: '01310100' }
  })
}).then(r => r.json()).then(console.log);
```

---

## 📊 Monitoramento

Após configurar, monitore:
- Uso de requisições (dashboard Invertexto)
- Erros 429 (rate limit excedido)
- Tempo de resposta

Se precisar aumentar o limite, edite o token no dashboard do Invertexto.

---

**Status**: ✅ Configuração recomendada  
**Data**: 2025-01-27

