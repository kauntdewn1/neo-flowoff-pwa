# 🔧 Configuração do Facebook App para ASI/Chatbot

## 📋 Configurações Necessárias no Facebook App

### 1. **Configurações Básicas**

Acesse: https://developers.facebook.com/apps/1338892407681784/settings/basic/

#### Página do App (OBRIGATÓRIO)

- **Página do App**: Vincule à página do Facebook
  - URL da Página: `https://www.facebook.com/profile.php?id=61583401456165`
  - Ou use o nome/ID da página se tiver uma página oficial

#### Domínios do App

- **Domínios do App**: Adicione `flowoff.xyz`
- **Domínios do Site**: Adicione `flowoff.xyz`

#### URLs do App

- **URL do Site**: `https://flowoff.xyz`
- **URLs de Redirecionamento OAuth Válidas**: 
  - `https://flowoff.xyz/`
  - `https://flowoff.xyz/auth/facebook/callback` (se usar OAuth)

### 2. **Configurações do Messenger** (Se usar Messenger)

Acesse: https://developers.facebook.com/apps/1338892407681784/messenger/settings/

#### Webhooks

- **URL de Callback**: `https://flowoff.xyz/webhook/messenger` (ou sua URL de webhook; `server.js` já expõe esse endpoint)
- **Token de Verificação**: Configure um token seguro e defina a variável de ambiente `FB_MESSENGER_VERIFY_TOKEN` com o mesmo valor
- **Assinatura HMAC**: Para garantir a integridade, defina `FB_MESSENGER_APP_SECRET` (o mesmo segredo do app) e o servidor validará o cabeçalho `X-Hub-Signature-256`
- **Eventos de Assinatura**: 
  - ✅ `messages`
  - ✅ `messaging_postbacks`
  - ✅ `messaging_optins`

> ⚠️ Se `FB_MESSENGER_APP_SECRET` não estiver configurado no ambiente, o servidor ainda aceita os eventos mas não verifica `X-Hub-Signature-256`; para produção sempre defina o segredo do app.

#### Tokens de Acesso

- Configure o **Token de Acesso da Página** se usar Messenger

### 3. **Configurações de Produtos**

#### Messenger (Se aplicável)

- Ative o produto **Messenger**
- Configure a página do Facebook vinculada
- Configure webhooks para receber mensagens

#### WhatsApp Business API (Se usar WhatsApp)

- Ative o produto **WhatsApp**
- Configure número de telefone verificado
- Configure webhooks

### 4. **Configurações de Privacidade**

Acesse: https://developers.facebook.com/apps/1338892407681784/settings/privacy/

- **URL da Política de Privacidade**: `https://flowoff.xyz/privacy`
- **URL dos Termos de Serviço**: `https://flowoff.xyz/terms`
- **Categoria do App**: Selecione a categoria apropriada (ex: "Negócios")

### 5. **Verificação do App**

Para apps que fazem atendimentos/chatbot, você pode precisar:

1. **Verificação do App** (se necessário para produção)

   - Acesse: https://developers.facebook.com/apps/1338892407681784/app-review/
   - Siga o processo de verificação se o app precisar de permissões especiais

2. **Modo de Desenvolvimento → Modo Live**
   - Após configurar tudo, mude de "Modo de Desenvolvimento" para "Modo Live"
   - Isso permite que o app funcione para todos os usuários

## 🔍 Verificações Importantes

### Meta Tags no HTML (Já Configurado ✅)
```html
<meta property="fb:app_id" content="1338892407681784">
<meta property="og:url" content="https://flowoff.xyz">
```

### Verificar no Meta Debugger

1. Acesse: https://developers.facebook.com/tools/debug/
2. Cole: `https://flowoff.xyz/`
3. Verifique:
   - ✅ Código de resposta: 200
   - ✅ `fb:app_id` presente
   - ✅ Todas as meta tags OG corretas

## 📝 Checklist de Configuração

- [ ] **Página do App vinculada** (OBRIGATÓRIO): `https://www.facebook.com/profile.php?id=61583401456165`
- [ ] Domínio `flowoff.xyz` adicionado em "Domínios do App"
- [ ] URL do site configurada: `https://flowoff.xyz`
- [ ] Meta tag `fb:app_id` presente no HTML ✅
- [ ] Webhooks configurados (se usar Messenger/WhatsApp)
- [ ] Política de Privacidade e Termos de Serviço configurados
- [ ] App verificado (se necessário)
- [ ] Modo Live ativado (após testes)

## 🚀 Próximos Passos

1. **Configure os domínios** no painel do Facebook App
2. **Teste o webhook** (se usar Messenger/WhatsApp)
3. **Verifique no Meta Debugger** que tudo está correto
4. **Mude para Modo Live** quando estiver pronto

## 📚 Referências

- [Facebook App Settings](https://developers.facebook.com/apps/1338892407681784/settings/basic/)
- [Messenger Platform](https://developers.facebook.com/docs/messenger-platform)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)

---

**⚠️ IMPORTANTE**: Sem configurar o domínio no Facebook App, o app não funcionará corretamente como ASI/chatbot, mesmo com a meta tag `fb:app_id` presente.
