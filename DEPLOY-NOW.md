# 🚀 Deploy Imediato - Netlify

## ✅ Build Concluído

O build foi concluído com sucesso em `./dist/`

---

## 🎯 Deploy Rápido

### Opção 1: Via Git (Recomendado - Automático)

```bash
# 1. Adicionar todas as alterações
git add .

# 2. Commit
git commit -m "feat: atualizar token Invertexto e Protocolo NΞØ"

# 3. Push (dispara deploy automático)
git push origin main
```

**O Netlify fará deploy automático após o push!**

---

### Opção 2: Via Netlify CLI (Manual)

```bash
# 1. Linkar ao projeto (primeira vez)
netlify link

# 2. Ou deploy direto se já linkado
netlify deploy --prod --dir=dist
```

---

### Opção 3: Via Netlify Dashboard

1. Acesse: https://app.netlify.com/sites/neo-flowoff
2. Vá em **Deploys**
3. Clique em **Trigger deploy** → **Deploy site**
4. Selecione a branch `main`
5. Aguarde o build

---

## ⚠️ IMPORTANTE: Variável de Ambiente

**Antes ou após o deploy**, configure a variável no Netlify:

1. Acesse: https://app.netlify.com/sites/neo-flowoff/settings/deploys#environment-variables
2. Verifique se existe `INVERTEXTO_API_TOKEN`
3. Se não existir ou estiver diferente, **adicione/atualize**:
   ```
   INVERTEXTO_API_TOKEN = 23236|oOyXKxz1LopCdmfMJJDt1EWa3Kz689Zm
   ```
4. **Redeploy** após atualizar a variável

---

## 🧪 Testar após Deploy

```bash
curl -X POST https://flowoff.xyz/api/invertexto \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"cep","params":{"cep":"01310100"}}'
```

---

**Status**: ✅ Build pronto  
**Próximo passo**: Escolha uma opção acima e faça o deploy!

