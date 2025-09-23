# 🚀 Configuração Netlify - API Invertexto

## 📋 **Passos para Configurar**

### **1. Deploy Automático**
✅ O código já foi enviado para o GitHub e deve fazer deploy automático na Netlify.

### **2. Configurar Token da API**
1. Acesse o painel da Netlify
2. Vá em **Site settings** → **Environment variables**
3. Adicione a variável:
   - **Key**: `INVERTEXTO_API_TOKEN`
   - **Value**: `seu_token_real_aqui` (substitua pelo token real)

### **3. Redeploy**
Após configurar a variável de ambiente:
1. Vá em **Deploys**
2. Clique em **Trigger deploy** → **Deploy site**

### **4. Testar a Integração**
```bash
# Teste rápido
npm run test-invertexto-netlify-quick

# Teste completo
npm run test-invertexto-netlify
```

## 🔧 **URLs das APIs**

Após o deploy, suas APIs estarão disponíveis em:
- **API Invertexto**: `https://seu-site.netlify.app/api/invertexto`
- **Health Check**: `https://seu-site.netlify.app/api/health`

## 🧪 **Teste Manual**

```bash
# Teste CEP
curl -X POST https://seu-site.netlify.app/api/invertexto \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"cep","params":{"cep":"74000000"}}'

# Health Check
curl https://seu-site.netlify.app/api/health
```

## 📊 **Monitoramento**

- **Logs**: Netlify → Functions → Logs
- **Métricas**: Netlify → Functions → Analytics
- **Health**: `https://seu-site.netlify.app/api/health`

## 🚨 **Troubleshooting**

### **Erro: Token não configurado**
- Verifique se a variável `INVERTEXTO_API_TOKEN` está configurada
- Faça um redeploy após configurar

### **Erro: Function not found**
- Verifique se o deploy foi concluído
- Aguarde alguns minutos após o deploy

### **Erro: Timeout**
- A API Invertexto pode estar lenta
- Verifique os logs da função

---

**🎉 Após configurar o token e fazer o redeploy, sua API Invertexto estará funcionando na Netlify!**
