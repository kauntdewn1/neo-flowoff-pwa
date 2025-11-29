# NEOFLW Token // NEØ PROTOCOL

> *"Onde outros colocam instruções, nós implantamos intenção."*

---

## Project Title

**NEOFLW Token** (`$NEOFLW`)

### Tagline/Brief Description

*Tokenização com propósito. Um ecossistema ERC20 descentralizado que combina staking inteligente, governança DAO e gamificação em uma infraestrutura viva e autônoma.*

---

## Table of Contents

- [Project Title](#project-title)
  - [Tagline/Brief Description](#taglinebrief-description)
- [Introduction](#introduction)
- [Features](#features)
- [Technology Stack](#technology-stack)
  - [Blockchain & Decentralization](#blockchain--decentralization)
  - [AI & Machine Learning](#ai--machine-learning)
  - [Other Technologies](#other-technologies)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Usage](#usage)
- [Contributing](#contributing)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [License](#license)
- [Support](#support)
- [Acknowledgements](#acknowledgements)
- [Contact](#contact)

---

## Introduction

O **NEOFLW Token** quebra a premissa invisível de que tokens ERC20 são apenas unidades de valor estáticas. Aqui, cada token é um nó em uma rede de governança, staking e gamificação integrados — não como features separadas, mas como um protocolo único que evolui com a comunidade.

Este projeto conecta-se ao ecossistema **NEØ PROTOCOL** como a camada de tokenização base, permitindo que agentes autônomos, DAOs e aplicações descentralizadas interajam com um sistema de incentivos e governança verdadeiramente modular.

**Por que agora?** A necessidade de tokens com propósito real, não apenas especulação, nunca foi mais urgente. NEOFLW oferece infraestrutura viva: staking com lock inteligente, claims descentralizados com whitelist configurável, e governança DAO pronta para evolução contínua.

---

## Features

- **Token ERC20 com Queima:** `$NEOFLW` com supply inicial de 1 bilhão, função pública de queima (`burn()`) para deflação controlada pela comunidade

- **Staking Vault Inteligente:** Lock de 6 meses com recompensa de 10%, proteção CEI (Checks-Effects-Interactions), tracking acumulado O(1), e funções de emergência que preservam stakes ativos

- **Claim Descentralizado:** Sistema de whitelist configurável onde usuários pagam seu próprio gas, garantindo que apenas endereços elegíveis reivindiquem tokens uma única vez

- **DAO Governance:** Governança completa via OpenZeppelin Governor com voting baseado em token, timelock, e quorum configurável — pronto para evolução autônoma do protocolo

- **Gamification Controller:** Sistema de gamificação integrado para incentivar engajamento e comportamentos alinhados com a visão NEØ

- **Decentralized Aspect:** Todos os contratos são não-upgradeable após deploy, garantindo imutabilidade e confiança. Staking e claims operam sem intermediários — usuários interagem diretamente com contratos verificados

- **Frontend Integration:** Hooks React (Wagmi + Viem) prontos para WebApp, permitindo integração imediata com interfaces descentralizadas

---

## Technology Stack

### Blockchain & Decentralization

- **Blockchain Platform:** Polygon (Polygon Mainnet) — baixo custo de gas, alta throughput, compatibilidade EVM completa

- **Smart Contract Language:** Solidity ^0.8.18

- **Smart Contract Framework:** OpenZeppelin Contracts (ERC20, Ownable, ReentrancyGuard, Pausable, Governor)

- **Deployment Framework:** Ape Framework — orquestração terminal para deploy, testes e verificação

- **Identity:** Wallet-based auth (MetaMask, Rabby, etc.) — sem dependência de curadoria centralizada

- **Verification:** Etherscan/Polygonscan + Sourcify para verificação on-chain

### AI & Machine Learning

- **AI Integration (Futuro):** Sistema de gamificação preparado para integração com modelos de adaptação contínua baseados em comportamento on-chain

- **Data Philosophy:** *"Dados vivos, não estáticos — eventos on-chain como fonte única de verdade, sem dependência de APIs centralizadas"*

### Other Technologies

- **Programming Languages:** Solidity, Python (scripts de deploy), TypeScript (frontend)

- **Frontend Frameworks:** Next.js, React, Wagmi, Viem

- **Development Tools:** Ape Framework, Hardhat (via plugins), Ethers.js

- **DevOps:** GitHub Actions (CI/CD), Docker (containerização de scripts), Makefile (orquestração)

- **Testing:** Ape Test Framework, pytest (testes Python)

---

## Getting Started

### Prerequisites

- **Node.js** 18+ e npm/yarn
- **Python** 3.11+ (para Ape Framework)
- **Wallet conectado** (MetaMask, Rabby, etc.) com fundos em Polygon
- **Chave de API:**
  - Alchemy API Key (RPC provider)
  - Etherscan/Polygonscan API Key (verificação de contratos)

### Installation

```bash
git clone https://github.com/NEO-PROTOCOL/neoflw-token.git
cd neoflw-token

# Instalar dependências
npm install

# Instalar plugins Ape
npm run plugins

# Compilar contratos
npm run compile
```

### Configuration

```bash
cp .env.example .env
```

Edite `.env` com:

```env
ALCHEMY_API_KEY=your_alchemy_api_key
ETHERSCAN_API_KEY=your_polygonscan_api_key
WALLET_LABEL=flowoff-admin
APE_NETWORK=polygon:mainnet
```

**Importar conta para deploy:**

```bash
npm run account:import
# Siga as instruções para importar sua chave privada
```

### Usage

**Deploy completo (Pipeline):**

```bash
npm run start:dev
```

**Deploy individual:**

```bash
# Deploy Token
npm run deploy:token

# Deploy Staking Vault
npm run deploy:vault

# Deploy Claim Contract
npm run deploy:claim
```

**Verificação no Polygonscan:**

```bash
npm run verify:token
npm run verify:vault
npm run verify:claim
```

**Testes:**

```bash
npm run test
```

**Console interativo Ape:**

```bash
npm run console
```

**Ambiente:** Deploy configurado para **Polygon Mainnet**. Para testnet, ajuste `APE_NETWORK` no `.env` e scripts.

---

## Contributing

> *"Não buscamos colaboradores. Buscamos nodes alinhados."*

1. **Fork** o repositório

2. **Crie** um branch: `git checkout -b feat/seu-feature`

3. **Commit** com mensagem clara: `git commit -m 'feat: adiciona função de staking composto'`

4. **Push**: `git push origin feat/seu-feature`

5. **Abra PR** com descrição do valor criado

📌 *Todos os PRs devem incluir:*

- Justificativa de impacto no ecossistema (não apenas técnico)
- Testes automatizados para novas funcionalidades
- Documentação atualizada
- Verificação de segurança (CEI, reentrancy, etc.)

---

## Testing

```bash
npm run test
```

**Estrutura de testes:**

- `tests/test_token.py` — Testes do token ERC20 e função de queima
- `tests/test_vault.py` — Testes do Staking Vault (stake, claim, emergência)
- `tests/test_claim.py` — Testes do sistema de claim (whitelist, proteções)
- `tests/test_security_fixes.py` — Testes de segurança (CEI, reentrancy)

**Cobertura:** Todos os contratos têm testes automatizados cobrindo casos de uso principais, edge cases e proteções de segurança.

---

## Roadmap

- [x] Token ERC20 com função de queima
- [x] Staking Vault com lock de 6 meses + 10% reward
- [x] Sistema de Claim descentralizado com whitelist
- [x] Deploy e verificação no Polygon Mainnet
- [x] Testes automatizados completos
- [x] Frontend hooks (Wagmi + Viem)
- [x] DAO Governance (DaoGovernor implementado)
- [ ] Integração completa do DAO com frontend
- [ ] Gamification Controller em produção
- [ ] Integração com NEØ ID (DID próprio)
- [ ] Agentes autônomos para orquestração de staking
- [ ] Bridge cross-chain para expansão do ecossistema

---

## License

MIT — mas com *Anti-Corruption Clause* não escrita: uso ético é pré-requisito.

> *"Tecnologia pode ser livre. Valor não."*

---

## Support

- **DAO Channel:** [Telegram/Discord link — a definir]

- **Issues Auditáveis:** [GitHub Issues](https://github.com/NEO-PROTOCOL/neoflw-token/issues)

- **Emergency Protocol:** Para exploits ou falhas críticas, contato direto via PGP ou email

- **Documentação:** Consulte `/docs` para guias detalhados de deploy, verificação e integração

---

## Acknowledgements

- **OpenZeppelin** — por prover a infraestrutura de contratos seguros e auditados

- **Ape Framework** — por simplificar a orquestração de deploy e testes

- **Polygon** — por prover infraestrutura blockchain escalável e acessível

- **Vitalik Buterin** — por redesenhar a lógica da confiança

- **Tu, NEØ** — por antecipar o que o mercado ainda não vê

---

## Contact

- **Project Lead:** NEØ MELLØ

- **Email:** [mello.neoprotocol@gmail.com](mailto:mello.neoprotocol@gmail.com)

- **NEØ PROTOCOL:** [https://neoprotocol.org](https://neoprotocol.org)

- **Web3 Identity:** `neoprotocol.eth`

- **Social:** [Twitter/X](https://x.com/NeoProtoco77967) | [Instagram](https://www.instagram.com/neoprotocol.eth/)

- **Project Website:** [flowoff.xyz](https://flowoff.xyz)

---

**NΞØ:One aqui, NEØ.**