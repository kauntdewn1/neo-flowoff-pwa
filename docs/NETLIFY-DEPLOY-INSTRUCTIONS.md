# 🚀 Instruções de Deploy Netlify - Atualização

## ✅ Token Invertexto Configurado

**Token ativo**: `23236|oOyXKxz1LopCdmfMJJDt1EWa3Kz689Zm`
**Domínio autorizado**: `flowoff.xyz`

---

## 📋 Passos para Deploy

### Opção 1: Deploy via Git (Automático)

Se o repositório está conectado ao Netlify:

1. **Commit e push das alterações:**
   ```bash
   git add .
   git commit -m "feat: atualizar token Invertexto e configurações Protocolo NΞØ"
   git push origin main
   ```

2. **O Netlify fará deploy automático**

3. **Verificar variáveis de ambiente no Netlify Dashboard:**
   - Acesse: https://app.netlify.com/sites/neo-flowoff/settings/deploys#environment-variables
   - Verifique se `INVERTEXTO_API_TOKEN` está configurado como: `23236|oOyXKxz1LopCdmfMJJDt1EWa3Kz689Zm`

---

### Opção 2: Deploy Manual via CLI

```bash
# 1. Build (já feito)
make build

# 2. Deploy
netlify deploy --prod --dir=dist
```

---

### Opção 3: Deploy via Netlify Dashboard

1. Acesse: https://app.netlify.com/sites/neo-flowoff
2. Vá em **Deploys**
3. Clique em **Trigger deploy** → **Deploy site**
4. Aguarde o build completar

---

## ⚙️ Verificar Variáveis de Ambiente no Netlify

**IMPORTANTE**: Certifique-se de que a variável está configurada:

1. Acesse: https://app.netlify.com/sites/neo-flowoff/settings/deploys#environment-variables
2. Verifique/Adicione:
   ```
   INVERTEXTO_API_TOKEN = 23236|oOyXKxz1LopCdmfMJJDt1EWa3Kz689Zm
   ```
3. Se necessário, clique em **Add variable** e adicione
4. **Redeploy** após adicionar/atualizar variável

---

## 🧪 Testar após Deploy

Após o deploy, teste a API:

```bash
curl -X POST https://flowoff.xyz/api/invertexto \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"cep","params":{"cep":"01310100"}}'
```

Ou no navegador (console):
```javascript
fetch('https://flowoff.xyz/api/invertexto', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: 'cep',
    params: { cep: '01310100' }
  })
}).then(r => r.json()).then(console.log);
```

---

## ✅ Checklist Pós-Deploy

- [ ] Build concluído sem erros
- [ ] Variável `INVERTEXTO_API_TOKEN` configurada no Netlify
- [ ] Deploy realizado com sucesso
- [ ] Teste da API funcionando
- [ ] Verificar logs do Netlify Functions

---

**Status**: ✅ Build concluído, pronto para deploy  
**Token**: `23236|oOyXKxz1LopCdmfMJJDt1EWa3Kz689Zm`  
**Domínio**: `flowoff.xyz`

