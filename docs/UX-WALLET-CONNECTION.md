# 🎨 UX de Conexão de Wallet - Abordagem Modular

**Status**: ✅ **Implementado seguindo melhores práticas de grandes empresas**

---

## 🎯 Princípio: Modular e Contextual

Seguindo o padrão de grandes empresas (MetaMask, WalletConnect, Coinbase Wallet, etc.), a conexão de wallet é **modular e contextual**, não invasiva.

---

## 📍 Onde o Botão Aparece

### **1. Card de Saldo NEOFLW** (Contextual Principal)

- **Quando**: Usuário não tem wallet conectada
- **Localização**: Dentro do card `neo-token-card`
- **Ação**: Mostra prompt claro: "Conecte sua wallet para ver seu saldo NEOFLW"
- **Botão**: `🔗 Conectar Wallet` (botão primário, full-width no mobile)

### **2. Card de Perfil** (Contextual Secundário)

- **Quando**: Usuário não tem wallet conectada
- **Localização**: Dentro do card `neo-profile-card`, na seção de ações
- **Ação**: Botão menor, ao lado do botão "Atualizar"
- **Badge**: Quando conectada, mostra badge verde "🔗 Wallet conectada"

### **3. Ações que Requerem Wallet** (Contextual por Necessidade)

- **Converter Pontos**: Se usuário tentar converter sem wallet, mostra modal
- **Staking**: Se usuário tentar fazer staking sem wallet, mostra modal
- **Transações**: Qualquer ação que requer wallet mostra prompt contextual

---

## ❌ O Que NÃO Fazemos

### **Não colocar no Header**

- ❌ Não invasivo
- ❌ Não força a conexão
- ❌ Não polui a interface principal

### **Não forçar conexão**

- ❌ Não mostra modal automaticamente
- ❌ Não bloqueia funcionalidades básicas
- ❌ Não interrompe o fluxo do usuário

---

## ✅ Padrão de UX

### **1. Descoberta Natural**

O usuário descobre a necessidade de conectar wallet quando:
- Tenta ver saldo → Card de token mostra prompt
- Tenta converter pontos → Card mostra necessidade
- Vê badge no perfil → Indica que pode conectar

### **2. Modal iOS-like (Sheet)**

Quando o usuário clica em "Conectar Wallet":
- Modal desliza de baixo para cima (iOS sheet style)
- Backdrop com blur
- Fácil de fechar (swipe down ou clicar fora)
- Opções claras: Email, Social, MetaMask

### **3. Feedback Visual**

- **Sem wallet**: Prompt claro no card
- **Com wallet**: Badge verde no perfil + saldo visível
- **Conectando**: Loading state no modal
- **Conectado**: Notificação de sucesso

---

## 🎨 Componentes Modulares

### **Card de Token (`neo-token-card`)**

```html
<!-- Estado: Sem wallet -->
<div class="neo-wallet-prompt">
  <button class="btn primary block">🔗 Conectar Wallet</button>
  <p class="neo-muted small">Conecte para ver saldo e converter pontos</p>
</div>

<!-- Estado: Com wallet -->
<div class="neo-token-balance">
  <div class="neo-balance-amount">1,234.56 NEOFLW</div>
  <div class="neo-balance-label">Saldo na wallet</div>
</div>
```

### **Card de Perfil (`neo-profile-card`)**

```html
<!-- Badge quando conectada -->
<p class="neo-wallet-badge">
  <span class="neo-wallet-icon">🔗</span>
  Wallet conectada
</p>

<!-- Botão quando não conectada -->
<button class="btn primary small">🔗 Conectar Wallet</button>
```

---

## 📱 Responsividade

### **Mobile (PWA)**

- Botão full-width no card de token
- Modal ocupa 90% da tela (sheet style)
- Touch-friendly (área de toque grande)

### **Desktop**

- Botão inline no card de perfil
- Modal centralizado (não sheet)
- Hover states claros

---

## 🔄 Fluxo de Conexão

```
1. Usuário vê card de token sem saldo
   ↓
2. Clica em "Conectar Wallet"
   ↓
3. Modal iOS sheet aparece de baixo
   ↓
4. Escolhe método (Email/Social/MetaMask)
   ↓
5. Completa autenticação
   ↓
6. Modal fecha, notificação de sucesso
   ↓
7. Card atualiza mostrando saldo
   ↓
8. Badge aparece no perfil
```

---

## 🎯 Benefícios da Abordagem Modular

### **✅ Não Invasivo**
- Não força conexão
- Não polui header
- Não interrompe fluxo

### **✅ Contextual**
- Aparece onde faz sentido
- Explica por que conectar
- Mostra benefício claro

### **✅ Escalável**
- Fácil adicionar novos pontos de conexão
- Cada card pode ter seu próprio prompt
- Modal é reutilizável

### **✅ Segue Padrões**
- MetaMask: Botão contextual
- WalletConnect: Modal sheet
- Coinbase: Não força conexão

---

## 📊 Comparação com Abordagem Tradicional

| Aspecto | Tradicional (Header) | Modular (Contextual) |
|---------|---------------------|---------------------|
| **Visibilidade** | Sempre visível | Quando necessário |
| **Invasividade** | Alta | Baixa |
| **Contexto** | Genérico | Específico |
| **UX** | Força conexão | Convida conexão |
| **Escalabilidade** | Limitada | Alta |

---

## ✅ Status Atual

- ✅ Botão contextual no card de token
- ✅ Botão contextual no card de perfil
- ✅ Modal iOS sheet style
- ✅ Badge quando conectada
- ✅ Feedback visual claro
- ✅ Não invasivo
- ✅ Modular e escalável

---

**Última atualização**: 28 de Novembro de 2025  
**Padrão seguido**: MetaMask, WalletConnect, Coinbase Wallet

