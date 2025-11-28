# 🚀 Quick Start - Protocolo NΞØ

Guia rápido para começar a usar os módulos do Protocolo NΞØ no PWA FlowOFF.

## ✅ O que já está pronto

Todos os módulos foram criados e estão prontos para uso:

- ✅ Identity Graph (NEØ ID)
- ✅ NEOFLW Token Client
- ✅ GamificationController
- ✅ FlowPay Client
- ✅ MCP Router

## 🔧 Instalação

```bash
npm install
```

Isso instalará o Thirdweb SDK necessário para interação blockchain.

## 📝 Uso Básico

### 1. Verificar se está inicializado

```javascript
// Verificar status
if (window.NEOPROTOCOL?.initialized) {
  console.log('✅ Protocolo NΞØ pronto!');
  const router = window.NEOPROTOCOL.router;
}
```

### 2. Criar/Atualizar Identidade

```javascript
const router = window.NEOPROTOCOL.router;
const identity = router.getModule('identity');

// Criar identidade
await identity.setIdentity({
  name: 'MELLØ',
  email: 'mello@flowoff.xyz',
  whatsapp: '+5562983231110'
});
```

### 3. Processar Lead (com gamificação automática)

```javascript
// Quando um lead é capturado
await router.route('action.process', {
  type: 'lead_activation',
  data: {
    origin: 'website',
    name: 'Nome do Lead',
    email: 'lead@email.com'
  }
});

// Isso automaticamente:
// - Adiciona XP
// - Desbloqueia badge "Primeiro Lead"
// - Adiciona pontos
// - Registra no histórico
```

### 4. Obter Perfil Completo

```javascript
const profile = await router.route('user.profile');

console.log(profile);
// {
//   identity: { name, email, level, xp, badges, ... },
//   token: { balance: {...}, contract: {...} },
//   gamification: { level, xp, points, questsCompleted, ... }
// }
```

### 5. Criar Checkout FlowPay

```javascript
const flowpay = router.getModule('flowpay');
const checkout = await flowpay.createCheckout(100.00, 'BRL');

// Mostrar QR Code para o usuário
console.log(checkout.qrCode);
```

## 🎮 Exemplos Práticos

### Integrar com Formulário de Lead

```javascript
// No seu formulário existente
const leadForm = document.getElementById('lead-form');
leadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = Object.fromEntries(new FormData(leadForm));
  
  // Criar identidade
  const identity = window.NEOPROTOCOL.router.getModule('identity');
  await identity.setIdentity({
    name: formData.name,
    email: formData.email,
    whatsapp: formData.whats,
    leadOrigin: 'website_form'
  });
  
  // Processar ação (ativa gamificação)
  await window.NEOPROTOCOL.router.route('action.process', {
    type: 'lead_activation',
    data: formData
  });
  
  // Continuar com redirecionamento WhatsApp...
});
```

### Mostrar Progresso do Usuário

```javascript
const progress = window.NEOPROTOCOL.router.getModule('gamification').getProgress();

// Exibir na UI
document.getElementById('user-level').textContent = `Nível ${progress.level}`;
document.getElementById('user-xp').textContent = `${progress.xp} XP`;
document.getElementById('user-badges').textContent = `${progress.badges} badges`;
```

### Verificar Saldo NEOFLW

```javascript
const token = window.NEOPROTOCOL.router.getModule('token');
const identity = window.NEOPROTOCOL.router.getModule('identity');
const user = identity.getIdentity();

if (user?.wallet) {
  const balance = await token.getBalance(user.wallet);
  console.log(`Saldo: ${balance.formatted} NEOFLW`);
}
```

## 🔗 Próximos Passos

1. **Deploy Token na Polygon Mainnet**
   - Atualizar `contractAddress.polygon` no `token-client.js`

2. **Integrar API FlowPay Real**
   - Substituir mocks no `flowpay-client.js`

3. **Adicionar UI de Gamificação**
   - Criar componentes visuais para quests, badges, progresso

4. **Conectar com Banco de Dados**
   - Migrar de localStorage para PostgreSQL

## 📚 Documentação Completa

- [Integração Completa](./NEO-PROTOCOL-INTEGRATION.md)
- [Módulos](./../src/modules/README.md)

---

**Desenvolvido por NΞØ PROTOCOL**

