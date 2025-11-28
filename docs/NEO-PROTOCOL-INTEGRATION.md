# 🧬 Protocolo NΞØ - Integração Modular

**Plano Mestre de Integração** - Versão Executável

---

## 📋 Visão Geral

Este documento descreve a arquitetura modular do Protocolo NΞØ integrada ao PWA FlowOFF.

### Ordem de Prioridade (Definida)

1. **Identity Graph (NEØ ID)** → Base de tudo
2. **NEOFLW Token** → Economia e valor
3. **GamificationController** → Engajamento
4. **FlowPay** → Monetização
5. **MCP Router** → Comunicação central

---

## 🏗️ Arquitetura Modular

### Estrutura de Diretórios

```
src/modules/
├── neo-id/
│   └── identity-graph.js      # Sistema de identidade
├── neoflw-token/
│   └── token-client.js        # Cliente do token NEOFLW
├── gamification/
│   └── gamification-controller.js  # Sistema de gamificação
├── flowpay/
│   └── flowpay-client.js     # Gateway PIX → Crypto
├── mcp-router/
│   └── mcp-router.js         # Router central
└── index.js                  # Exportações centralizadas
```

---

## 🔌 Integração no PWA

### 1. Inicialização

```javascript
import { getMCPRouter } from './modules/index.js';
import { ThirdwebSDK } from 'thirdweb/sdk';

// Inicializar router com Thirdweb SDK
const router = getMCPRouter();
await router.init({
  thirdwebSDK: new ThirdwebSDK('polygon') // ou 'sepolia' para testnet
});
```

### 2. Uso Básico

```javascript
// Obter perfil completo do usuário
const profile = await router.route('user.profile');

// Processar ação (com gamificação automática)
await router.route('action.process', {
  type: 'lead_activation',
  data: { origin: 'website' }
});

// Obter quests disponíveis
const quests = await router.route('gamification.quests');
```

---

## 🪪 Identity Graph (NEØ ID)

### Funcionalidades

- Consolidação de identidade do usuário
- Armazenamento híbrido (localStorage → PostgreSQL → Blockchain)
- Rastreamento de histórico
- Progressão e badges

### Uso

```javascript
import { getIdentityGraph } from './modules/index.js';

const identity = getIdentityGraph();
await identity.init();

// Criar/atualizar identidade
await identity.setIdentity({
  name: 'MELLØ',
  email: 'mello@flowoff.xyz',
  wallet: '0x...'
});

// Adicionar XP
await identity.addXP(50, 'Quest completada');

// Adicionar badge
await identity.addBadge({
  id: 'first_lead',
  name: 'Primeiro Lead'
});
```

---

## 💰 NEOFLW Token

### Contrato

- **Sepolia Testnet**: `0x5AaCebca3f0CD9283401a83bC7BA5db48011CE87`
- **Polygon Mainnet**: (a ser deployado)

### Funcionalidades

- Leitura de saldo
- Transferências
- Burn (queima)
- Integração com Identity Graph

### Uso

```javascript
import { getNEOFLWClient } from './modules/index.js';

const token = getNEOFLWClient();
await token.init(thirdwebSDK);

// Obter saldo
const balance = await token.getBalance('0x...');

// Transferir
await token.transfer('0x...', '100.0');

// Queimar
await token.burn('50.0');
```

---

## 🎮 GamificationController

### Funcionalidades

- Sistema de níveis e XP
- Quests e missões
- Conversão de pontos em NEOFLW
- Badges e achievements

### Quests Padrão

- `lead_activation_1`: Primeiro Lead
- `wallet_connect`: Conectar Wallet
- `first_stake`: Primeiro Staking
- `social_share`: Compartilhar FlowOFF

### Uso

```javascript
import { getGamificationController } from './modules/index.js';

const gamification = getGamificationController();
await gamification.init();

// Completar quest
await gamification.completeQuest('lead_activation_1');

// Adicionar pontos
await gamification.addPoints(100, 'Ação realizada');

// Obter progresso
const progress = gamification.getProgress();
```

---

## 💳 FlowPay

### Funcionalidades

- Checkout PIX
- Conversão PIX → Crypto
- Cashback em NEOFLW
- Tokenização de recibos
- Vouchers

### Uso

```javascript
import { getFlowPayClient } from './modules/index.js';

const flowpay = getFlowPayClient();
await flowpay.init();

// Criar checkout
const checkout = await flowpay.createCheckout(100.00, 'BRL');

// Verificar status
const status = await flowpay.checkPaymentStatus(checkout.id);

// Gerar voucher
const voucher = await flowpay.generateVoucher(50.00, 'Desconto especial');
```

---

## 🧭 MCP Router

### Rotas Disponíveis

- `user.profile` - Perfil completo do usuário
- `action.process` - Processar ação com gamificação
- `gamification.quests` - Quests e missões disponíveis

### Status dos Módulos

```javascript
const router = getMCPRouter();
const status = router.getStatus();
// {
//   initialized: true,
//   modules: { identity: true, token: true, ... },
//   routes: ['user.profile', 'action.process', ...]
// }
```

---

## 🔄 Fluxo de Integração Completo

### Exemplo: Lead Ativado

```javascript
// 1. Usuário preenche formulário
const formData = { name, email, whatsapp };

// 2. Criar identidade
const identity = getIdentityGraph();
await identity.setIdentity(formData);

// 3. Processar ação via router (ativa gamificação)
const router = getMCPRouter();
await router.route('action.process', {
  type: 'lead_activation',
  data: { origin: 'website', ...formData }
});

// 4. Resultado: XP ganho, badge desbloqueado, pontos adicionados
```

### Exemplo: Pagamento com Cashback

```javascript
// 1. Criar checkout FlowPay
const checkout = await flowpay.createCheckout(100.00);

// 2. Usuário paga via PIX
// (processo externo)

// 3. Verificar pagamento
const status = await flowpay.checkPaymentStatus(checkout.id);

// 4. Cashback processado automaticamente
// - Pontos adicionados
// - NEOFLW creditado (quando contrato disponível)
// - Compra registrada no Identity Graph
```

---

## 🚀 Próximos Passos

### MVP (Agora)

- [x] Identity Graph base
- [x] NEOFLW Token client
- [x] GamificationController
- [x] FlowPay client
- [x] MCP Router

### Fase 2

- [ ] Deploy NEOFLW Token na Polygon Mainnet
- [ ] Integração real com API FlowPay
- [ ] Contrato de mint para conversão pontos → NEOFLW
- [ ] Integração com PostgreSQL (substituir localStorage)
- [ ] Integração com IPFS para metadados

### Fase 3

- [ ] Staking real de NEOFLW
- [ ] Sistema de governança
- [ ] Integração com FlowCloser
- [ ] Integração com FLUXX DAO
- [ ] MCP Router v1.1 completo

---

## 📝 Notas Técnicas

### Dependências

- `thirdweb`: SDK para interação blockchain
- Armazenamento: localStorage (MVP) → PostgreSQL (produção)
- Blockchain: Polygon (mainnet)

### Segurança

- Validação de dados em todas as camadas
- Sanitização de inputs
- Rate limiting (a implementar)
- Criptografia de dados sensíveis (a implementar)

### Performance

- Lazy loading de módulos
- Cache de dados frequentes
- Otimização de chamadas blockchain

---

## 🧬 Conclusão

Esta arquitetura modular permite:

1. **Escalabilidade**: Cada módulo evolui independentemente
2. **Manutenibilidade**: Código organizado e testável
3. **Flexibilidade**: Fácil adicionar novos módulos
4. **Performance**: Carregamento sob demanda

O Protocolo NΞØ está pronto para evoluir de projeto para **plataforma**.

---

**Desenvolvido por NΞØ PROTOCOL**  
**Versão**: 1.0.0  
**Data**: 2025-01-27

