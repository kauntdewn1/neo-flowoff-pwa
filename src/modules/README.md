# 🧬 Módulos do Protocolo NΞØ

Estrutura modular para integração no PWA FlowOFF.

## 📦 Módulos Disponíveis

### 1. Identity Graph (NEØ ID)

**Arquivo**: `neo-id/identity-graph.js`

Sistema nervoso central de identidade do usuário.

**Funcionalidades:**

- Consolidação de identidade (nome, wallet, email, telegram, whatsapp)
- Rastreamento de histórico
- Progressão (nível, XP, badges)
- Staking e compras
- Agente responsável e origem do lead

### 2. NEOFLW Token

**Arquivo**: `neoflw-token/token-client.js`

Cliente para interação com o token NEOFLW.

**Contrato:**
- Sepolia Testnet: `0x5AaCebca3f0CD9283401a83bC7BA5db48011CE87`
- Polygon Mainnet: (a ser deployado)

**Funcionalidades:**
- Leitura de saldo
- Transferências
- Burn (queima)

### 3. GamificationController
**Arquivo**: `gamification/gamification-controller.js`

Sistema de gamificação integrado.

**Funcionalidades:**
- Níveis e progressão
- Quests e missões
- Conversão de pontos em NEOFLW
- Badges e achievements

### 4. FlowPay
**Arquivo**: `flowpay/flowpay-client.js`

Gateway de pagamento PIX para crypto.

**Funcionalidades:**
- Checkout PIX
- Conversão PIX → Crypto
- Cashback em NEOFLW
- Tokenização de recibos
- Vouchers

### 5. MCP Router
**Arquivo**: `mcp-router/mcp-router.js`

Central de comunicação entre módulos.

**Rotas:**
- `user.profile` - Perfil completo
- `action.process` - Processar ação
- `gamification.quests` - Quests disponíveis

## 🚀 Uso Rápido

```javascript
// Importar módulos
import { getMCPRouter } from './modules/index.js';

// Inicializar (automaticamente no app.js)
const router = window.NEOPROTOCOL.router;

// Obter perfil do usuário
const profile = await router.route('user.profile');

// Processar ação (ex: lead ativado)
await router.route('action.process', {
  type: 'lead_activation',
  data: { origin: 'website' }
});
```

## 📚 Documentação Completa

Veja `docs/NEO-PROTOCOL-INTEGRATION.md` para documentação detalhada.

