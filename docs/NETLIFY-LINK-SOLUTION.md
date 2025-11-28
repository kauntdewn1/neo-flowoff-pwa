# 🔗 Solução: Linkar Projeto Netlify

## ❌ Problema

O Netlify não encontrou um projeto conectado ao repositório:
```
https://github.com/kauntdewn1/neo-flowoff-pwa
```

---

## ✅ Soluções

### Opção 1: Criar Novo Projeto no Netlify (Recomendado)

```bash
# Criar e linkar em um comando
netlify init

# Ou criar site específico
netlify sites:create --name neo-flowoff-pwa
netlify link --name neo-flowoff-pwa
```

---

### Opção 2: Linkar Manualmente com Site ID

Se você já tem um projeto no Netlify Dashboard:

1. Acesse: https://app.netlify.com/sites
2. Encontre o projeto (pode ser `neo-flowoff` ou similar)
3. Vá em **Site settings** → **General** → copie o **Site ID**
4. Linke usando o ID:

```bash
netlify link --id SEU_SITE_ID_AQUI
```

---

### Opção 3: Criar via Dashboard e Linkar

1. Acesse: https://app.netlify.com
2. Clique em **Add new site** → **Import an existing project**
3. Conecte ao GitHub e selecione `neo-flowoff-pwa`
4. Configure:
   - **Build command**: `make build` ou `npm run build`
   - **Publish directory**: `dist`
5. Depois, linke localmente:

```bash
netlify link
```

---

### Opção 4: Deploy Direto (Sem Link)

Se você só quer fazer deploy uma vez:

```bash
# Build primeiro
make build

# Deploy direto (cria site se não existir)
netlify deploy --prod --dir=dist
```

---

## 🎯 Recomendação

**Use a Opção 1** (`netlify init`) - é a mais simples e configura tudo automaticamente.

---

## ⚙️ Após Linkar

Depois de linkar, configure as variáveis de ambiente:

```bash
# Via CLI
netlify env:set INVERTEXTO_API_TOKEN "23236|oOyXKxz1LopCdmfMJJDt1EWa3Kz689Zm"

# Ou via Dashboard
# https://app.netlify.com/sites/SEU_SITE/settings/deploys#environment-variables
```

---

## 🚀 Deploy

Após linkar:

```bash
make build
netlify deploy --prod --dir=dist
```

---

**Próximo passo**: Escolha uma opção acima e execute! 🎯

