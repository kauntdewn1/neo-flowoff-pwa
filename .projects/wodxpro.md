# WOD X PRO - Frontend Web App

**Aplicação Next.js para o protocolo WOD X PRO**

Este repositório contém a aplicação web frontend do WOD X PRO, construída com Next.js 14, React, TypeScript e integração com blockchain via Alchemy Account Kit.

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Alchemy (para Account Kit)
- Chave API do Lighthouse (opcional, para IPFS)

### Instalação

```bash
npm install
```

### Configuração

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Alchemy
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_ALCHEMY_POLICY_ID=your_policy_id

# Chain
# IMPORTANTE: Chain ID 137 = Polygon Mainnet (onde os contratos estão deployados)
NEXT_PUBLIC_CHAIN_ID=137

# IPFS (Lighthouse - opcional)
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_lighthouse_key

# Contract Addresses (serão obtidos do @wodxpro/contract-data)
# Opcional: sobrescrever se necessário
NEXT_PUBLIC_ARENA_ADDRESS=0x...
NEXT_PUBLIC_WOD_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_VALIDATOR_REGISTRY_ADDRESS=0x...
```

### Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Build para Produção

```bash
npm run build
npm start
```

## 📦 Dependências Principais

- **Next.js 14** - Framework React
- **wagmi** - Hooks para interação com blockchain
- **viem** - Cliente Ethereum
- **@wodxpro/contract-data** - ABIs e endereços dos contratos
- **@account-kit/react** - Alchemy Account Kit (Account Abstraction)
- **@lighthouse-web3/sdk** - Upload para IPFS

## 🏗️ Estrutura do Projeto

```
wod-app-web/
├── app/               # Next.js App Router
│   ├── layout.tsx     # Layout principal
│   ├── page.tsx       # Página inicial
│   └── ui/            # Componentes UI
├── components/         # Componentes React
│   ├── ArenaDashboard.tsx
│   ├── DailyTraining.tsx
│   └── ...
├── hooks/             # Custom hooks
│   ├── useArena.ts    # Hook para Arena contract
│   └── useWODToken.ts # Hook para WODToken
├── lib/               # Utilitários
│   ├── contractData.ts    # Helper para @wodxpro/contract-data
│   ├── accountKitConfig.ts
│   └── ipfs.ts
└── package.json
```

## 🔗 Integração com Contratos

O frontend usa o package `@wodxpro/contract-data` para obter ABIs e endereços dos contratos:

```typescript
import { getContractDataForChain } from '@/lib/contractData';

// Buscar dados do contrato Arena
const { abi, address } = await getContractDataForChain('Arena');
```

Os hooks (`useArena`, `useWODToken`) já estão configurados para usar este package automaticamente.

## 🎨 Componentes Principais

### ArenaDashboard

Dashboard principal para visualizar e participar de desafios.

### DailyTraining

Interface para registrar treinos diários (off-chain).

### ValidatorDashboard

Dashboard para validadores votarem em submissões.

### VideoUpload

Componente para upload de vídeos para IPFS.

## 🔐 Autenticação

O app usa **Alchemy Account Kit** para autenticação sem fricção:

- Login com email (OTP/Magic Link)
- Smart Contract Wallets
- Gasless transactions (via Gas Manager)

## 📡 IPFS Integration

O app suporta múltiplos provedores IPFS:

- **NFT.Storage** (primary)
- **Lighthouse** (fallback)
- **Local IPFS** (dev only)

Vídeos são armazenados permanentemente no IPFS/Filecoin.

## 🚀 Deploy

### Vercel (Recomendado)

```bash
vercel
```

### Outros Plataformas

O app pode ser deployado em qualquer plataforma que suporte Next.js:

- Netlify
- Railway
- AWS Amplify
- Docker

## 🔧 Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `NEXT_PUBLIC_ALCHEMY_API_KEY` | Chave API do Alchemy | Sim |
| `NEXT_PUBLIC_ALCHEMY_POLICY_ID` | Policy ID do Gas Manager | Sim |
| `NEXT_PUBLIC_CHAIN_ID` | Chain ID (137 = Polygon Mainnet) | Sim |
| `NEXT_PUBLIC_LIGHTHOUSE_API_KEY` | Chave API do Lighthouse | Não |

**📖 Para mais detalhes, veja [Configuração de Variáveis de Ambiente](./docs/setup/ENV_SETUP.md)**

## 📝 Scripts Disponíveis

- `npm run dev` - Desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Rodar build de produção
- `npm run lint` - Rodar ESLint

## 🔗 Links

- **Domain**: `wodx.pro`
- **Token**: `$WOD`
- **Repository**: [wodxpro/wod-x-pro](https://github.com/wodxpro/wod-x-pro)
- **Chain**: Polygon Mainnet (Chain ID: 137)

## 📚 Documentação

Documentação completa disponível em [`docs/`](./docs/):

- **[Índice](./docs/INDEX.md)** - Índice geral da documentação
- **[Instalação](./docs/setup/INSTALLATION.md)** - Guia de instalação
- **[Variáveis de Ambiente](./docs/setup/ENV_SETUP.md)** - Configuração de env vars
- **[Thirdweb](./docs/configuration/THIRDWEB.md)** - Configuração Thirdweb
- **[Guia do Usuário](./docs/guides/USER_GUIDE.md)** - O que você verá na aplicação
- **[Status](./docs/status/STATUS.md)** - Status atual do projeto

## 📄 Licença

MIT

---

**Última atualização:** 24 de Novembro de 2025

# WOD [X] PRO - Whitepaper

**Protocolo Descentralizado de Performance Atlética**

**Versão 1.0** | Novembro 2024

**Domain**: `wod.eth` e `wodx.pro` | **Token**: `$WOD`

---

## 📋 Resumo Executivo

WOD [X] PRO é um protocolo descentralizado construído em blockchain que transforma desempenho físico em valor digital permanente e auditável. Através de smart contracts na rede Polygon POS, o protocolo permite que atletas participem de desafios competitivos, submetam provas de esforço (vídeos armazenados em IPFS), e recebam recompensas em tokens $WOD baseadas em validação por consenso descentralizado.

O protocolo elimina intermediários, garante transparência total, e cria uma economia verdadeiramente descentralizada onde o esforço físico gera valor real. Utilizando tecnologias como Account Abstraction (Alchemy Account Kit), IPFS para armazenamento permanente, e smart contracts auditáveis, o WOD [X] PRO oferece uma experiência sem fricção para atletas enquanto mantém a soberania e permanência dos dados.

**Principais Diferenciais:**

- ✅ Primeira plataforma descentralizada de performance atlética
- ✅ Validação por consenso (51% dos validadores)
- ✅ Armazenamento permanente em IPFS
- ✅ UX sem fricção (login social, sem necessidade de conhecimento em cripto)
- ✅ Economia descentralizada com tokens de valor real

---

## 1. Introdução

### 1.1 O Problema

O mercado de fitness e performance atlética enfrenta desafios estruturais que limitam a capacidade de atletas monetizarem e comprovarem seu desempenho:

**1. Centralização e Dependência de Plataformas**

- Dados de performance ficam presos em servidores privados
- Plataformas podem ser desligadas, resultando em perda permanente de histórico
- Algoritmos de redes sociais controlam visibilidade e monetização
- Intermediários capturam valor sem retornar aos criadores

**2. Falta de Prova Permanente**

- Não existe forma auditável e permanente de comprovar desempenho histórico
- Vídeos podem ser deletados, contas podem ser banidas
- Histórico de treinos não tem valor de mercado

**3. Barreiras Geográficas e Financeiras**

- Competições físicas têm custos altos e barreiras geográficas
- Poucas oportunidades para atletas amadores monetizarem esforço
- Sistema de recompensas baseado em "pontos" sem valor real

**4. Falta de Transparência**

- Resultados de competições podem ser contestados
- Processo de validação não é transparente
- Distribuição de prêmios depende de intermediários

### 1.2 A Oportunidade

O mercado global de fitness está em crescimento constante:

- **50+ milhões** de pessoas praticam exercícios regularmente no Brasil
- **Mercado global** de fitness tech cresce ~15% ao ano
- **CrossFit, HIIT, Funcional** são segmentos em expansão
- **Apostas esportivas** movimentam bilhões globalmente

A tecnologia blockchain oferece a infraestrutura perfeita para resolver esses problemas:

- **Descentralização**: Protocolo independente de servidores centrais
- **Permanência**: Dados armazenados de forma imutável
- **Transparência**: Todas as regras e transações são públicas
- **Automação**: Smart contracts executam lógica sem intermediários

---

## 2. A Solução: WOD [X] PRO

### 2.1 Visão Geral

WOD [X] PRO é um protocolo descentralizado que permite:

1. **Mineração de Tokens através de Performance**: Atletas ganham tokens $WOD ao completar desafios validados
2. **Validação Descentralizada**: Sistema de consenso onde validadores com stake aprovam/rejeitam performances
3. **Armazenamento Permanente**: Vídeos de prova armazenados em IPFS (Filecoin) para sempre
4. **Economia Real**: Tokens $WOD têm valor de mercado e podem ser trocados por fiat

### 2.2 Arquitetura de Dois Níveis

O protocolo opera em dois níveis distintos:

#### Nível 1: Treinos Diários (Off-Chain)

- **Armazenamento**: Vídeos em IPFS via Lighthouse.storage
- **Custo**: Zero (sem transações blockchain)
- **Propósito**: Histórico pessoal, tracking de progresso
- **Sync Opcional**: Pode ser sincronizado on-chain quando necessário

#### Nível 2: A Arena (On-Chain)

- **Armazenamento**: CIDs registrados em smart contracts
- **Custo**: Gas fees (subsidiados via Account Abstraction)
- **Propósito**: Desafios competitivos com entry fee e prize pool
- **Validação**: Consenso descentralizado obrigatório

Esta arquitetura garante:

- ✅ UX fluida para treinos diários (sem fricção)
- ✅ Valor econômico apenas em desafios competitivos
- ✅ Histórico permanente mesmo para treinos off-chain
- ✅ Flexibilidade para sincronizar quando necessário

---

## 3. Arquitetura Técnica

### 3.1 Stack Tecnológica

**Blockchain:**

- **Rede**: Polygon POS
- **Linguagem**: Solidity ^0.8.20
- **Padrões**: OpenZeppelin Contracts
- **Custos**: ~$0.01 por transação

**Frontend:**

- **Framework**: Next.js 14 (React, TypeScript)
- **Wallet**: Alchemy Account Kit (Account Abstraction)
- **Login**: Social login (Google, e-mail)
- **UX**: Zero conhecimento de cripto necessário

**Armazenamento:**

- **IPFS**: Lighthouse.storage (IPFS + Filecoin)
- **Permanência**: Garantida por Filecoin
- **Acesso**: Via CID (Content Identifier)

**On-Ramp:**

- **Provedor**: FlowPay
- **Método**: PIX (Brasil)
- **Conversão**: Fiat → $WOD automático

### 3.2 Smart Contracts

O protocolo consiste em três contratos principais:

#### 3.2.1 WODToken.sol

**Tipo**: ERC20 Token

**Funções Principais:**

- `mint(address to, uint256 amount)`: Cria novos tokens (apenas owner)
- `burn(uint256 amount)`: Queima tokens do próprio endereço
- `transfer/transferFrom`: Transferências padrão ERC20

**Tokenomics:**

- **Max Supply**: 1.000.000.000 WOD (hard cap)
- **Distribuição**:
  - 30% - Tesouraria do Protocolo
  - 25% - Recompensas de Desafio (mint progressivo)
  - 15% - Fundadores (vesting off-chain)
  - 10% - Parceiros (vesting opcional)
  - 10% - Liquidez
  - 10% - Ecossistema / DAO

**Segurança:**

- OpenZeppelin AccessControl
- Pausable (pode pausar em emergências)
- Apenas owner pode mint (Safe multisig)

#### 3.2.2 ValidatorRegistry.sol

**Propósito**: Registro de validadores com sistema de stake

**Funções Principais:**

- `registerValidator(uint256 stakeAmount)`: Registra novo validador com stake mínimo
- `updateStake(uint256 additionalStake)`: Aumenta stake existente
- `unregisterValidator()`: Remove validador e retorna stake
- `isValidator(address)`: Verifica se endereço é validador ativo
- `getValidatorCount()`: Retorna número de validadores
- `getValidators()`: Retorna lista de validadores

**Mecânica de Stake:**

- **Stake Mínimo**: 1.000 WOD (configurável pelo owner)
- **Propósito**: Garantir comprometimento e qualidade das validações
- **Retorno**: Stake pode ser recuperado ao desregistrar

**Estrutura de Dados:**

```solidity
struct Validator {
    address validatorAddress;
    uint256 stakeAmount;
    uint256 registeredAt;
    bool isActive;
}
```

#### 3.2.3 Arena.sol

**Propósito**: Contrato principal que gerencia desafios, submissões, votação e distribuição

**Funções Principais:**

1. **`createChallenge(...)`** (onlyOwner)
   - Cria novo desafio com nome, descrição, entry fee, período
   - Define prize pool inicial (acumula entry fees)

2. **`enterChallenge(uint256 challengeId)`**
   - Atleta entra no desafio pagando entry fee
   - Entry fee é transferido para o contrato (acumula no prize pool)

3. **`submitProof(uint256 challengeId, string proofCID)`**
   - Atleta submete prova de esforço (CID do IPFS)
   - CID é registrado on-chain vinculado ao atleta

4. **`vote(uint256 challengeId, address athlete, bool approved)`** (onlyValidators)
   - Validador vota em uma submissão (true = Rep, false = No-Rep)
   - Voto é registrado on-chain com timestamp

5. **`resolveChallenge(uint256 challengeId)`**
   - Resolve desafio após deadline de validação
   - Calcula vencedores baseado em consenso (51% aprovação)
   - Distribui prize pool automaticamente para vencedores

**Constantes:**

- `VALIDATION_DEADLINE`: 7 dias após endTime do desafio
- `MIN_CONSENSUS_PERCENT`: 51% (maioria dos validadores deve aprovar)
- `VALIDATION_FEE_PERCENT`: 10% do prize pool para validadores (futuro)

**Estruturas de Dados:**
```solidity
struct Challenge {
    uint256 id;
    string name;
    string description;
    uint256 entryFee;
    uint256 prizePool;
    uint256 startTime;
    uint256 endTime;
    bool isActive;
    mapping(address => Submission) submissions;
    address[] participants;
}

struct Submission {
    address athlete;
    string proofCID;
    uint256 timestamp;
    bool exists;
    uint256 approvalVotes;
    uint256 rejectVotes;
}
```

### 3.3 Fluxo de Operação Completo

#### Fase 1: Criação de Desafio
```
Admin (Owner) → Arena.createChallenge(...)
→ Novo desafio criado on-chain
→ Evento ChallengeCreated emitido
```

#### Fase 2: Entrada de Atletas
```
Atleta → WODToken.approve(Arena, entryFee)
Atleta → Arena.enterChallenge(challengeId)
→ WODToken.transferFrom(atleta → Arena, entryFee)
→ Entry fee acumula no prizePool
→ Atleta adicionado à lista de participantes
```

#### Fase 3: Submissão de Prova
```
Atleta → Upload vídeo → Lighthouse.storage
→ Recebe CID (hash IPFS)
→ Arena.submitProof(challengeId, CID)
→ CID registrado on-chain vinculado ao atleta
```

#### Fase 4: Validação
```
Validadores (com stake) → Arena.vote(challengeId, athlete, approved)
→ Votos registrados on-chain
→ Sistema calcula aprovação/rejeição por atleta
```

#### Fase 5: Resolução e Distribuição
```
Após deadline (endTime + 7 dias) → Arena.resolveChallenge(challengeId)
→ Contrato calcula vencedores (≥51% aprovação)
→ WODToken.transfer(vencedor, prizePerWinner)
→ Distribuição automática e transparente
```

### 3.4 Segurança e Descentralização

**Princípios de Segurança:**

- ✅ **OpenZeppelin Contracts**: Padrão da indústria
- ✅ **ReentrancyGuard**: Previne ataques de reentrância
- ✅ **AccessControl**: Controle granular de permissões
- ✅ **Pausable**: Pode pausar em emergências (apenas owner)

**Descentralização:**

- ✅ **Zero Trust**: Nenhuma ação requer confiança em servidor central
- ✅ **Transparência**: Todas as regras estão no código dos contratos
- ✅ **Auditabilidade**: Qualquer pessoa pode verificar lógica e histórico
- ✅ **Imutabilidade**: Regras não podem ser alteradas sem consenso (apenas owner pode mudar parâmetros)

**Governança Futura:**

- Migração para DAO (Decentralized Autonomous Organization)
- Token holders votam em mudanças de parâmetros
- Owner atual (Safe multisig) será substituído por governança on-chain

---

## 4. Tokenomics

### 4.1 Distribuição de Tokens

**Max Supply**: 1.000.000.000 WOD (hard cap, não pode ser excedido)

**Alocação Inicial:**

| Categoria | Percentual | Quantidade | Vesting |
|-----------|------------|------------|---------|
| Tesouraria Protocolo | 30% | 300.000.000 WOD | Controlado por Safe multisig |
| Recompensas de Desafio | 25% | 250.000.000 WOD | Mint progressivo via Arena |
| Fundadores | 15% | 150.000.000 WOD | 4 anos (25% a cada ano) |
| Parceiros | 10% | 100.000.000 WOD | Negociável |
| Liquidez | 10% | 100.000.000 WOD | Imediato |
| Ecossistema / DAO | 10% | 100.000.000 WOD | Governança futura |

### 4.2 Mecânica de Emissão

**Mint Progressivo:**

- Tokens de recompensa são mintados conforme desafios são resolvidos
- Arena.sol pode ter MINTER_ROLE para mintar recompensas automaticamente
- Ou mint manual via Safe multisig após resolução de desafio

**Queima (Burn):**

- Qualquer holder pode queimar seus próprios tokens
- Reduz supply total (deflacionário)
- Pode ser usado para ajustar economia do protocolo

### 4.3 Utilidade do Token

**$WOD é usado para:**

1. **Entry Fees em Desafios**
   - Atletas pagam $WOD para participar de desafios
   - Entry fees acumulam no prize pool

2. **Stake de Validadores**
   - Validadores fazem stake mínimo de 1.000 $WOD
   - Garante comprometimento e qualidade

3. **Recompensas**
   - Vencedores recebem $WOD do prize pool
   - Validadores recebem comissão em $WOD (futuro)

4. **Governança (Futuro)**
   - Token holders votam em propostas
   - Decisões sobre parâmetros do protocolo

5. **Liquidez**
   - Tokens podem ser trocados por fiat via DEX/CEX
   - On-ramp PIX permite compra direta

### 4.4 Modelo Econômico

**Fluxo de Valor:**

```
Atletas compram $WOD (PIX) 
  ↓
Participam de desafios (entry fee)
  ↓
Prize pool acumula
  ↓
Vencedores recebem $WOD
  ↓
Ciclo se repete (mais demanda por $WOD)
```

**Fatores de Valorização:**

- **Demanda**: Mais atletas = mais entry fees = mais demanda por $WOD
- **Escassez**: Max supply fixo + queima = deflacionário
- **Utilidade**: Token necessário para participar do protocolo
- **Governança**: Valor futuro como token de governança

---

## 5. Mecânica da Arena

### 5.1 Criação de Desafios

**Quem pode criar**: Owner (Safe multisig, futuramente DAO)

**Parâmetros de um Desafio:**

- **Nome**: Identificação do desafio
- **Descrição**: Regras e critérios detalhados
- **Entry Fee**: Taxa de entrada em $WOD
- **Start Time**: Quando o desafio começa
- **End Time**: Quando o desafio termina

**Exemplo:**
```
Nome: "100 Burpees em 10 Minutos"
Descrição: "Complete 100 burpees no tempo máximo de 10 minutos. 
Vídeo deve mostrar início e fim claramente."
Entry Fee: 100 WOD
Start Time: 2024-12-01 00:00 UTC
End Time: 2024-12-07 23:59 UTC
```

### 5.2 Participação

**Processo:**

1. Atleta aprova Arena para gastar entry fee
2. Atleta chama `enterChallenge(challengeId)`
3. Entry fee é transferido para o contrato
4. Atleta é adicionado à lista de participantes
5. Prize pool aumenta pelo valor da entry fee

**Restrições:**

- Desafio deve estar ativo
- Deve estar dentro do período (startTime ≤ now ≤ endTime)
- Atleta não pode ter entrado antes no mesmo desafio
- Atleta deve ter $WOD suficiente

### 5.3 Submissão de Prova

**Processo:**

1. Atleta grava vídeo da performance
2. Upload para Lighthouse.storage (IPFS)
3. Recebe CID (Content Identifier)
4. Chama `submitProof(challengeId, CID)`
5. CID é registrado on-chain vinculado ao atleta

**Requisitos da Prova:**

- Vídeo deve estar em IPFS (permanente)
- CID deve ser válido
- Submissão deve ser feita antes do endTime
- Atleta deve ter entrado no desafio

### 5.4 Sistema de Validação

**Validadores:**

- Devem ter stake mínimo (1.000 $WOD)
- Registrados no ValidatorRegistry
- Podem votar em qualquer submissão

**Votação:**

- **Rep (approved = true)**: Validador aprova a performance
- **No-Rep (approved = false)**: Validador rejeita a performance
- Cada validador pode votar apenas uma vez por atleta por desafio
- Votos são registrados on-chain com timestamp

**Período de Validação:**

- Começa: Após endTime do desafio
- Duração: 7 dias (VALIDATION_DEADLINE)
- Após deadline: Qualquer um pode chamar `resolveChallenge()`

### 5.5 Consenso e Resolução

**Cálculo de Consenso:**

- Para cada atleta, conta votos de aprovação
- Calcula percentual: `approvalVotes / totalValidators`
- Se `percentual ≥ 51%` (MIN_CONSENSUS_PERCENT): Atleta é vencedor

**Exemplo:**
```
Total de validadores: 10
Atleta A: 6 aprovações, 1 rejeição → 60% → ✅ Vencedor
Atleta B: 4 aprovações, 3 rejeições → 40% → ❌ Não vencedor
Atleta C: 5 aprovações, 2 rejeições → 50% → ❌ Não vencedor (precisa 51%)
```

**Distribuição de Prêmios:**

- Prize pool é dividido igualmente entre todos os vencedores
- Se houver 3 vencedores e prize pool de 300 WOD: cada um recebe 100 WOD
- Distribuição é automática via `WODToken.transfer()`

**Comissão de Validadores (Futuro):**

- 10% do prize pool pode ir para validadores
- Distribuído proporcionalmente ao stake
- Incentiva validação de qualidade

---

## 6. Sistema de Validação

### 6.1 Registro de Validadores

**Requisitos:**

- Stake mínimo: 1.000 $WOD (configurável)
- Aprovação prévia do WODToken para ValidatorRegistry
- Não pode estar já registrado

**Processo:**

1. Validador aprova WODToken para ValidatorRegistry
2. Chama `registerValidator(stakeAmount)`
3. Tokens são transferidos para o contrato (stake)
4. Validador é marcado como ativo
5. Adicionado à lista de validadores

### 6.2 Incentivos

**Atuais:**

- Validadores podem validar performances
- Participam do consenso descentralizado
- Contribuem para a qualidade do protocolo

**Futuros:**

- Comissão por validação bem-sucedida
- Distribuição proporcional ao stake
- Penalidades por validação maliciosa (slashing)

### 6.3 Qualidade e Reputação

**Garantias de Qualidade:**

- Stake mínimo garante comprometimento financeiro
- Sistema de consenso (51%) previne manipulação
- Votos são públicos e auditáveis

**Reputação Futura:**

- Sistema de reputação on-chain
- Validadores com histórico positivo ganham mais comissão
- Validadores maliciosos podem perder stake (slashing)

---

## 7. Armazenamento e Permanência

### 7.1 IPFS e Filecoin

**Tecnologia:**

- **IPFS**: Protocolo de armazenamento descentralizado
- **Filecoin**: Rede de armazenamento permanente
- **Lighthouse.storage**: Provedor que garante permanência

**Vantagens:**

- ✅ **Permanência**: Vídeos não podem ser deletados
- ✅ **Descentralização**: Não depende de servidor único
- ✅ **Acesso Global**: Qualquer um pode acessar via CID
- ✅ **Imutabilidade**: CID não muda (garantia de integridade)

### 7.2 CID (Content Identifier)

**O que é:**

- Hash criptográfico do conteúdo
- Único para cada vídeo
- Não pode ser alterado sem mudar o conteúdo

**Uso no Protocolo:**

- CID é registrado on-chain no Arena.sol
- Vincula prova de esforço ao atleta
- Validadores acessam vídeo via CID

**Exemplo:**

```
Vídeo → IPFS → CID: QmXxx123...
→ Arena.submitProof(challengeId, "QmXxx123...")
→ CID registrado on-chain
→ Validadores acessam: ipfs://QmXxx123...
```

---

## 8. UX e Account Abstraction

### 8.1 Alchemy Account Kit

**Tecnologia:**

- Smart Contract Wallets (Account Abstraction)
- Login social (Google, e-mail)
- Recuperação de conta sem seed phrase

**Experiência do Usuário:**

1. Atleta clica "Entrar com Google"
2. Wallet é criada automaticamente
3. Não precisa gerenciar chaves privadas
4. Transações podem ser assinadas sem conhecimento técnico

**Benefícios:**

- ✅ Zero fricção de entrada
- ✅ Recuperação fácil (via e-mail)
- ✅ Mais seguro que wallets tradicionais
- ✅ UX similar a apps tradicionais

### 8.2 Gasless Transactions

**Meta-Transactions:**

- Protocolo pode subsidiar gas fees inicialmente
- Atletas não precisam ter ETH/MATIC para transações
- Reduz barreira de entrada

**Account Abstraction:**

- Permite assinar transações sem gerenciar gas
- Paymaster pode pagar gas em nome do usuário
- Experiência similar a apps web2

---

## 9. Roadmap

### Fase 1: MVP e Lançamento (Q4 2024 - Q1 2025)

**Status**: ✅ Em desenvolvimento

**Concluído:**

- [x] Smart Contracts (WODToken, ValidatorRegistry, Arena)
- [x] Frontend básico (Next.js)
- [x] Integração IPFS (Lighthouse.storage)
- [x] Sistema de login (Alchemy Account Kit)

**Em Andamento:**

- [ ] Integração completa Alchemy Account Kit (social login)
- [ ] On-Ramp PIX funcional (Alchemy Pay)
- [ ] Deploy em testnet (Polygon Amoy)
- [ ] Beta com 100 usuários

**Objetivos:**

- 1.000 usuários ativos
- 10+ desafios criados
- 50+ validadores registrados

### Fase 2: Crescimento (Q2 - Q3 2025)

**Planejado:**

- [ ] Deploy em mainnet (Polygon POS)
- [ ] Marketing para comunidade CrossFit/fitness
- [ ] Sistema de oráculo (preparação para Fase 2: Mercado)
- [ ] Dashboard de validadores aprimorado
- [ ] Sistema de reputação on-chain

**Objetivos:**

- 10.000+ usuários ativos
- 100+ desafios mensais
- 200+ validadores ativos
- Prize pools de R$ 10.000+

### Fase 3: O Mercado (Q4 2025)

**Nova Funcionalidade:**

- [ ] Bolsa de performance descentralizada
- [ ] Apostas em eventos esportivos
- [ ] Oráculo descentralizado para resultados
- [ ] Pool de liquidez para apostas
- [ ] Sistema de odds automático

**Objetivos:**

- 50.000+ usuários ativos
- Mercado de apostas funcional
- Volume de apostas de R$ 100.000+/mês

### Fase 4: Escala e Expansão (2026+)

**Expansão:**

- [ ] Integração com wearables (Apple Watch, Garmin)
- [ ] Parcerias com academias e coaches
- [ ] Expansão para outros esportes (corrida, ciclismo, natação)
- [ ] Governança descentralizada (DAO)
- [ ] Token listing em DEX/CEX

**Objetivos:**

- 100.000+ usuários ativos
- Presença global
- Economia própria do protocolo
- Possível aquisição/IPO

---

## 10. Modelo de Negócio

### 10.1 Fontes de Receita

**Fase 1: A Arena**

1. **Taxa de Protocolo em Desafios**
   - 5-10% de cada entry fee vai para o protocolo
   - Exemplo: 100 participantes × R$ 50 = R$ 5.000
   - Protocolo recebe: R$ 250-500

2. **On-Ramp PIX**
   - Margem na conversão R$ → $WOD
   - Exemplo: R$ 100 compra 200 $WOD, protocolo ganha R$ 2-5

3. **Taxa de Validação (Futuro)**
   - 10% do prize pool para validadores
   - Protocolo pode receber % dessa taxa

**Fase 2: O Mercado**

4. **Taxa de Apostas**
   - 5% de cada aposta no mercado
   - Potencial de crescimento exponencial
   - Exemplo: R$ 10.000 em apostas = R$ 500 para protocolo

### 10.2 Projeção de Receita

**Cenário Conservador (Ano 1):**

- 1.000 usuários ativos
- 10 desafios/mês
- 50 participantes por desafio
- Entry fee média: R$ 50
- Taxa do protocolo: 10%

**Cálculo:**

- 10 desafios × 50 participantes × R$ 5 = **R$ 2.500/mês**
- **R$ 30.000/ano**

**Cenário Otimista (Ano 2):**

- 10.000 usuários ativos
- 100 desafios/mês
- 100 participantes por desafio
- Taxa do protocolo: 10%

**Cálculo:**

- 100 desafios × 100 participantes × R$ 5 = **R$ 50.000/mês**
- **R$ 600.000/ano**

**Com Fase 2 (Mercado):**

- 1% dos usuários apostam R$ 100/mês
- 100 apostadores × R$ 100 = R$ 10.000/mês
- Taxa: 5% = **R$ 500/mês**
- Com 10.000 usuários = **R$ 5.000/mês = R$ 60.000/ano**

### 10.3 Custos Operacionais

**Custos Fixos:**

- Infraestrutura (IPFS, blockchain): ~R$ 1.000/mês
- Desenvolvimento: ~R$ 20.000/mês
- Marketing: ~R$ 10.000/mês

**Custos Variáveis:**

- Gas subsidy (inicial): ~R$ 5.000/mês (diminui com escala)
- On-ramp fees: Margem já considerada na receita

**Break-even:**

- ~R$ 30.000/mês de receita
- Atingível no cenário conservador (Ano 1)

---

## 11. Segurança e Auditoria

### 11.1 Segurança dos Contratos

**Padrões Utilizados:**

- ✅ OpenZeppelin Contracts (auditados pela comunidade)
- ✅ ReentrancyGuard (previne ataques de reentrância)
- ✅ AccessControl (controle granular de permissões)
- ✅ Pausable (pode pausar em emergências)

**Práticas de Segurança:**

- ✅ Código público e auditável
- ✅ Testes unitários extensivos
- ✅ Deploy em testnet antes de mainnet
- ✅ Verificação de contratos no PolygonScan

**Auditoria Formal:**

- ⏳ Planejada antes de deploy em mainnet
- Empresas especializadas (Trail of Bits, OpenZeppelin, etc.)
- Relatório público de auditoria

### 11.2 Riscos e Mitigações

**Riscos Identificados:**

1. **Ataque de 51% (Validadores)**
   - **Risco**: Se 51% dos validadores coludirem
   - **Mitigação**: Stake mínimo garante comprometimento financeiro, sistema de reputação futura

2. **Exploração de Smart Contracts**
   - **Risco**: Bugs no código podem ser explorados
   - **Mitigação**: Auditoria formal, testes extensivos, OpenZeppelin

3. **Perda de Chaves (Owner)**
   - **Risco**: Owner perde acesso ao Safe multisig
   - **Mitigação**: Safe multisig com múltiplos signatários, timelock para mudanças críticas

4. **Regulatório**
   - **Risco**: Mudanças em regulamentação de cripto
   - **Mitigação**: Compliance com regulamentações locais, estrutura jurídica adequada

5. **Adoção**
   - **Risco**: Baixa adoção de usuários
   - **Mitigação**: UX sem fricção, marketing focado, parcerias estratégicas

---

## 12. Governança Futura

### 12.1 Migração para DAO

**Fase Atual:**

- Owner: Safe multisig (múltiplos signatários)
- Decisões: Requerem assinatura de maioria dos signatários

**Fase Futura:**

- Governança descentralizada via token holders
- Propostas on-chain
- Votação ponderada por quantidade de $WOD
- Execução automática via smart contracts

### 12.2 Parâmetros Governáveis

**Futuramente controlados por DAO:**

- Entry fee mínimo/máximo
- Stake mínimo de validadores
- Percentual de consenso (atualmente 51%)
- Taxa do protocolo
- Distribuição de recompensas

**Timelock:**

- Mudanças críticas terão delay (ex: 7 dias)
- Permite que comunidade reaja antes da execução

---

## 13. Conclusão

WOD [X] PRO representa uma inovação fundamental no mercado de fitness e performance atlética. Ao combinar blockchain, IPFS, e validação descentralizada, o protocolo cria uma economia verdadeiramente descentralizada onde o esforço físico gera valor real e permanente.

**Principais Conquistas:**

- ✅ Primeira plataforma descentralizada de performance atlética
- ✅ Sistema de validação por consenso transparente e auditável
- ✅ Armazenamento permanente de provas de esforço
- ✅ UX sem fricção que elimina barreiras de entrada
- ✅ Economia descentralizada com tokens de valor real

**Visão de Longo Prazo:**
WOD [X] PRO visa se tornar a infraestrutura padrão para comprovação e monetização de desempenho atlético globalmente. Com expansão para outros esportes, integração com wearables, e um mercado de apostas descentralizado, o protocolo tem potencial para transformar completamente como atletas interagem com seu desempenho e como fãs participam do esporte.

**Chamada para Ação:**

- **Atletas**: Participem de desafios, validem performances, construam seu legado on-chain
- **Validadores**: Façam stake, validem com qualidade, ganhem recompensas
- **Desenvolvedores**: Contribuam com o código, sugiram melhorias, construam sobre o protocolo
- **Investidores**: Apoiem o crescimento do protocolo, participem da governança futura

---

## 14. Referências e Links

**Repositório:**
- GitHub: https://github.com/kauntdewn1/wod-eth

**Documentação:**

- Arquitetura: `docs/ARCHITECTURE.md`
- Análise de Contratos: `docs/ANALISE_CONTRATOS.md`
- FAQ: `docs/FAQ.md`
- Explicação Simples: `docs/EXPLICACAO_SIMPLES.md`

**Contatos:**
- Domain ENS: `wod.eth`
- Domain: `wodx.pro`
- Email: [a definir]

**Tecnologias:**
- Polygon: https://polygon.technology/
- Alchemy: https://www.alchemy.com/
- Lighthouse: https://lighthouse.storage/
- IPFS: https://ipfs.io/
- OpenZeppelin: https://www.openzeppelin.com/

---

## 15. Glossário

**Account Abstraction**: Tecnologia que permite criar wallets sem gerenciar chaves privadas, com login social e recuperação fácil.

**CID (Content Identifier)**: Hash criptográfico que identifica unicamente um arquivo no IPFS.

**Consenso**: Acordo entre validadores sobre a validade de uma performance. No WOD [X] PRO, requer 51% de aprovação.

**Entry Fee**: Taxa paga por atletas para participar de um desafio na Arena.

**IPFS (InterPlanetary File System)**: Protocolo de armazenamento descentralizado que garante permanência de arquivos.

**Prize Pool**: Pool de prêmios acumulado a partir das entry fees de todos os participantes de um desafio.

**Rep/No-Rep**: Termos usados por validadores para aprovar (Rep) ou rejeitar (No-Rep) uma performance.

**Smart Contract**: Código executado automaticamente na blockchain, sem necessidade de intermediários.

**Stake**: Tokens bloqueados como garantia de comprometimento. Validadores fazem stake para poder validar.

**Validator**: Participante que valida performances de atletas. Deve fazer stake mínimo e votar em submissões.

---

**Fim do Whitepaper**

*Documento criado em Novembro 2024. Versão 1.0.*

*Para atualizações e versões mais recentes, consulte o repositório oficial.*


