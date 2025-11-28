# 🔍 Resolução de Tokens Invertexto

## 📋 Situação Atual

Você tem **2 tokens** no `.env`:

1. **Token 1** (linha 1): `21976|hZQXuMyP6eW0sydqMCxNC9JLJKSHbsOs`
2. **Token 2** (linha 13): `23236|oOyXKxz1LopCdmfMJJDt1EWa3Kz689Zm`

⚠️ **Problema**: O segundo token (linha 13) **sobrescreve** o primeiro porque está definido depois.

---

## ✅ Solução Imediata

### 1. Limpar o `.env`

Remova a duplicação. Mantenha apenas **UM** token:

```bash
# Remover a linha 1 (token antigo)
# Manter apenas a linha 13 (token novo)
INVERTEXTO_API_TOKEN=23236|oOyXKxz1LopCdmfMJJDt1EWa3Kz689Zm
```

### 2. Verificar no Dashboard Invertexto

1. Acesse: https://invertexto.com/api
2. Faça login
3. Verifique qual token está **ativo** e **configurado para `flowoff.xyz`**
4. Use esse token no `.env`

### 3. Testar Manualmente

Teste qual token funciona via curl:

```bash
# Teste Token 1
curl -X POST https://invertexto.com/api/cep \
  -H "Content-Type: application/json" \
  -d '{"token":"21976|hZQXuMyP6eW0sydqMCxNC9JLJKSHbsOs","cep":"01310100"}'

# Teste Token 2
curl -X POST https://invertexto.com/api/cep \
  -H "Content-Type: application/json" \
  -d '{"token":"23236|oOyXKxz1LopCdmfMJJDt1EWa3Kz689Zm","cep":"01310100"}'
```

---

## 🔧 Configuração Correta do `.env`

```bash
# API Invertexto - Token ÚNICO (sem duplicação)
INVERTEXTO_API_TOKEN=TOKEN_CORRETO_AQUI

# Outras configurações...
```

---

## 📝 Próximos Passos

1. **Verificar no dashboard** qual token está configurado para `flowoff.xyz`
2. **Remover duplicação** no `.env`
3. **Testar** via servidor local: `npm run dev` e acessar `/api/invertexto`
4. **Atualizar Netlify** com o token correto nas variáveis de ambiente

---

**Status**: ⚠️ Tokens duplicados no .env  
**Ação**: Remover duplicação e usar apenas o token configurado para `flowoff.xyz`

