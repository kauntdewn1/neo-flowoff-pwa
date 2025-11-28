# 🚀 Configuração de Deploy Previews e Branch Deploys - Netlify

## 📋 **O que foi configurado**

O arquivo `netlify.toml` foi otimizado para suportar diferentes contextos de deploy:

### **Contextos Configurados**

1. **Production** (`main` branch)
   - `NODE_ENV=production`
   - Cache agressivo habilitado
   - Build otimizado

2. **Deploy Preview** (Pull Requests)
   - `NODE_ENV=development`
   - `NETLIFY_DEPLOY_PREVIEW=true`
   - Cache desabilitado para facilitar testes

3. **Branch Deploy** (branches específicas)
   - `NODE_ENV=development`
   - `NETLIFY_BRANCH_DEPLOY=true`
   - Para branches configuradas no Netlify

4. **Staging** (branch `staging`)
   - `NODE_ENV=staging`
   - Ambiente intermediário

5. **Feature Branches** (`feature/*`)
   - `NODE_ENV=development`
   - Para branches de desenvolvimento

## 🔗 **URLs Geradas Automaticamente**

### **Deploy Previews**
Quando você abre um Pull Request, o Netlify cria automaticamente:
```
deploy-preview-123--neo-flowoff.netlify.app
```

### **Branch Deploys**
Para branches configuradas, você terá:
```
branch-name--neo-flowoff.netlify.app
```

### **Produção**
```
neo-flowoff.netlify.app
```
(ou seu domínio customizado)

## ⚙️ **Como Habilitar Branch Deploys**

1. Acesse o painel do Netlify
2. Vá em **Site settings** → **Build & deploy** → **Continuous Deployment**
3. Em **Branch deploys**, clique em **Configure**
4. Escolha uma das opções:
   - **All branches**: Todas as branches fazem deploy
   - **Let me add individual branches**: Adicione branches específicas
5. Clique em **Save**

## 🎯 **Variáveis de Ambiente por Contexto**

Você pode configurar variáveis diferentes para cada contexto:

### **No Netlify Dashboard:**
1. **Site settings** → **Environment variables**
2. Configure variáveis específicas por contexto:
   - Production
   - Deploy previews
   - Branch deploys
   - Staging

### **Exemplo:**
```
# Produção
API_URL=https://api.producao.com
DEBUG=false

# Deploy Preview
API_URL=https://api.staging.com
DEBUG=true
```

## 📝 **Usando Variáveis no Código**

As variáveis `NETLIFY_DEPLOY_PREVIEW` e `NETLIFY_BRANCH_DEPLOY` estão disponíveis durante o build:

```javascript
// No seu código JavaScript
if (process.env.NETLIFY_DEPLOY_PREVIEW === 'true') {
  // Código específico para previews
  console.log('Rodando em Deploy Preview');
}

if (process.env.NETLIFY_BRANCH_DEPLOY === 'true') {
  // Código específico para branch deploys
  console.log('Rodando em Branch Deploy');
}
```

## 🔧 **Configurações Específicas**

### **Headers de Cache**

- **Produção**: Cache agressivo (1 ano)
- **Previews/Branches**: Cache desabilitado para ver mudanças imediatamente

### **Build Command**

Todos os contextos usam `make build`, mas você pode personalizar:

```toml
[context.deploy-preview]
  command = "make build && npm run test"
  publish = "dist"
```

## 🚨 **Troubleshooting**

### **Branch Deploy não está funcionando**
- Verifique se a branch está configurada no Netlify
- Confirme que o plano permite Branch Deploys (planos pagos)

### **Deploy Preview não aparece no PR**
- Verifique se o Netlify está conectado ao repositório
- Confirme que o PR está aberto (não draft)

### **Variáveis de ambiente não funcionam**
- Verifique se estão configuradas no contexto correto
- Faça um redeploy após configurar

## 📚 **Recursos Úteis**

- [Netlify Branch Deploys Docs](https://docs.netlify.com/deploy/deploy-types/branch-deploys/)
- [Netlify Deploy Previews Docs](https://docs.netlify.com/deploy/deploy-types/deploy-previews/)
- [Netlify Context Configuration](https://docs.netlify.com/configure-builds/file-based-configuration/#deploy-contexts)

---

**✅ Configuração completa! Agora você tem Deploy Previews e Branch Deploys otimizados!**

