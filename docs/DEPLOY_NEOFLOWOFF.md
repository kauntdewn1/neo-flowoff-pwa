# 🚀 Deploy NEOFLOWOFF — Fluxo Completo

**Versão:** 1.1.0  
**Data:** 2025-01-20  
**Status:** Cloudflare removido por decisão arquitetural

---

## 📋 Visão Geral

Este documento descreve o fluxo completo de publicação do projeto **NEOFLOWOFF** em três camadas operacionais bem definidas:

1. **Web2 (Netlify)** — produção, performance e usuários humanos
2. **Web3 (IPFS + IPNS)** — continuidade, soberania e imutabilidade
3. **Naming (ENS)** — resolução humana e descentralizada

Este fluxo foi projetado para ser **auditável, delegável e automatizável**.

---

## 🔄 Diagrama do Fluxo

```
BUILD LOCAL
   ↓
DEPLOY NETLIFY (flowoff.xyz)
   ↓
UPLOAD IPFS (CID imutável)
   ↓
PUBLISH IPNS (ponte dinâmica)
   ↓
ENS neoflowoff.eth → IPNS
```

---

## 📦 1. Build Local

### Pré-requisitos

- Node.js 18.x
- Make
- Dependências instaladas (`npm install`)

### Comando

```bash
make build
```

### Resultado

- Diretório `./dist/` criado com todos os assets otimizados
- Arquivos principais:
  - `index.html`
  - `styles.css`
  - `js/app.js`
  - `manifest.webmanifest`
  - `sw.js`
  - `public/` (recursos estáticos)

### Validação

```bash
make validate
```

---

## 🌐 2. Deploy Netlify (Web2)

### Pré-requisitos

- Repositório Git conectado ao Netlify
- Site configurado no Netlify Dashboard
- Build command configurado: `make build`
- Publish directory: `dist`

### Processo de Deploy

O Netlify usa **gatilho automático via repositório Git**:

1. **Push para branch principal** (ex: `main` ou `master`)
2. **Netlify detecta o push** automaticamente
3. **Executa build** conforme configurado (`make build`)
4. **Publica o diretório `dist/`** automaticamente

### Deploy Manual (Opcional)

Para deploy manual via CLI (apenas se necessário):

```bash
# Requer Netlify CLI instalado
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

**Nota**: O deploy automático via Git é o método padrão e recomendado.

### Domínios Configurados

- **Primário**: `flowoff.xyz`
- **Secundário**: `flowoff.com.br`

### Configuração DNS

**IMPORTANTE**: DNS configurado diretamente no registrador de domínio, **SEM proxy Cloudflare**.

#### Para `flowoff.xyz`:

```
Tipo: A
Nome: @
Valor: <IP_NETLIFY>
TTL: 3600

Tipo: CNAME
Nome: www
Valor: neo-flowoff.netlify.app
TTL: 3600
```

#### Para `flowoff.com.br`:

```
Tipo: CNAME
Nome: @
Valor: neo-flowoff.netlify.app
TTL: 3600

Tipo: CNAME
Nome: www
Valor: neo-flowoff.netlify.app
TTL: 3600
```

### Verificação

```bash
curl -I https://flowoff.xyz
# Deve retornar: HTTP/2 200
```

---

## 📡 3. Upload para IPFS

### Pré-requisitos

- IPFS instalado e rodando: `ipfs daemon`
- Node IPFS configurado

### Comando

```bash
# Upload do diretório dist completo
ipfs add -r ./dist --pin=true
```

### Saída Esperada

```
added QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXX dist/index.html
added QmYYYYYYYYYYYYYYYYYYYYYYYYYYYYY dist/styles.css
...
added QmZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ dist
```

### CID Raiz

O último CID retornado é o **CID raiz** do diretório. Este é o CID que será usado no IPNS.

### Pin Local (Opcional mas Recomendado)

```bash
ipfs pin add <CID_RAIZ>
```

### Verificação

```bash
# Testar acesso via gateway público
curl https://ipfs.io/ipfs/<CID_RAIZ>
```

---

## 🔑 4. Publicar no IPNS

### Pré-requisitos

- IPFS rodando
- CID raiz do passo anterior

### Gerar Key IPNS (se não existir)

```bash
# Listar keys existentes
ipfs key list -l

# Criar nova key (se necessário)
ipfs key gen ipns.neoflowoff.root
```

### Publicar CID no IPNS

```bash
# Publicar usando key específica
ipfs name publish /ipfs/<CID_RAIZ> --key=ipns.neoflowoff.root

# Ou publicar usando key padrão
ipfs name publish /ipfs/<CID_RAIZ>
```

### Saída Esperada

```
Published to /ipns/k51qzi5uqu5dXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### IPNS Key

O valor retornado (`k51qzi5uqu5d...`) é o **IPNS Key** que será usado no ENS.

### Verificação

```bash
# Testar resolução IPNS
ipfs name resolve /ipns/k51qzi5uqu5dXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Deve retornar: /ipfs/<CID_RAIZ>
```

### Gateway Público

```bash
# Testar via gateway
curl https://ipfs.io/ipns/k51qzi5uqu5dXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 🌍 5. Configurar ENS (neoflowoff.eth)

### Pré-requisitos

- Wallet com controle do domínio `neoflowoff.eth`
- Gas (ETH) para transações
- Acesso ao ENS Manager: https://app.ens.domains/

### Passo 1: Configurar Contenthash

1. Acesse: https://app.ens.domains/name/neoflowoff.eth/details
2. Vá em **Records** → **Add/Edit Record**
3. Selecione **Content Hash**
4. Cole o IPNS Key: `/ipns/k51qzi5uqu5dXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
5. Confirme a transação

### Comando Alternativo (via CLI)

```bash
# Usando ens-update (ferramenta externa)
ens-update contenthash neoflowoff.eth /ipns/k51qzi5uqu5dXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Passo 2: Configurar Text Record

1. No mesmo painel, vá em **Text Records**
2. Adicione:
   - **Key**: `url`
   - **Value**: `https://flowoff.xyz`
3. Confirme a transação

### Verificação

```bash
# Verificar contenthash
ens-resolver contenthash neoflowoff.eth

# Verificar text record
ens-resolver text neoflowoff.eth url
```

### Resolução

Após configurado, o domínio `neoflowoff.eth` será resolvido via:
- Navegadores com suporte ENS: `neoflowoff.eth`
- Gateway IPFS: `https://ipfs.io/ipns/k51qzi5uqu5d...`
- Resolver ENS: `https://app.ens.domains/name/neoflowoff.eth`

---

## 🔄 Fluxo de Atualização

Quando houver mudanças no código:

### 1. Build

```bash
make build
```

### 2. Deploy Netlify

```bash
# Push para branch principal (deploy automático)
git push origin main
```

O Netlify detecta o push e executa o deploy automaticamente.

### 3. Upload IPFS (novo CID)

```bash
ipfs add -r ./dist --pin=true
# Anotar novo CID_RAIZ
```

### 4. Atualizar IPNS

```bash
ipfs name publish /ipfs/<NOVO_CID_RAIZ> --key=ipns.neoflowoff.root
```

### 5. ENS (opcional)

O ENS já aponta para o IPNS, então **não precisa atualizar** o ENS. O IPNS automaticamente resolve para o novo CID.

---

## 🔐 UCAN — Política Executável (v1.1)

Esta seção define **UCANs reais e executáveis**, não conceituais.
Cada UCAN aqui descrito corresponde a um token que pode existir no sistema.

---

### 🧱 UCAN ROOT — Autoridade Máxima

- **Issuer (iss):** DID master do operador (MELLØ)
- **Uso:** Somente delegação
- **Onde vive:** Offline / cold
- **Expiração:** longa (90–180 dias)

**Capacidades:**

- `can: delegate`
- Escopo: criação de UCANs de projeto

**Nunca usado em automações.**

---

### 🏗️ UCAN PROJECT — NEOFLOWOFF

- **Issuer:** UCAN ROOT
- **Audience:** Operadores autorizados do projeto
- **Expiração:** média (30 dias)

**Escopo:**

- Storage do projeto NEOFLOWOFF
- IPNS key oficial do projeto

**Capacidades:**

- `upload/pin` (builds IPFS)
- `publish` limitado ao IPNS do projeto

---

### 🎯 UCAN ROLE — PUBLISH_IPNS

- **Issuer:** UCAN PROJECT
- **Audience:** Agente IPNSPublisher
- **Expiração:** curta (5–15 minutos)

**Capacidade executável:**

- `can: publish`
- `resource: /ipns/ipns.neoflowoff.root`
- Sem wildcard

**Este UCAN não pode delegar autoridade.**

---

### 🤖 UCAN AGENT — IPNSPublisher

- **Issuer:** UCAN ROLE (PUBLISH_IPNS)
- **Audience:** Processo automatizado (script ou Action)
- **Expiração:** curtíssima (5–10 minutos)

**Permissão única:**

- Atualizar o IPNS do projeto para um novo CID

**Após expiração, o token é automaticamente inválido.**

---

### 🧪 Testes Obrigatórios de Validação

Todo UCAN emitido deve satisfazer:

1. Consegue publicar **apenas** `/ipns/ipns.neoflowoff.root`
2. Falha ao tentar publicar qualquer outro IPNS
3. Falha após expiração
4. Não consegue delegar autoridade

**Se qualquer teste falhar, o UCAN deve ser descartado.**

---

### 🧭 Observação Arquitetural

- UCAN não substitui IPNS ou ENS
- UCAN governa **quem pode mover o ponteiro**
- IPNS governa **para onde o ponteiro aponta**
- ENS governa **como humanos chegam lá**

**Essa separação é intencional e não deve ser colapsada.**

---

### 🔑 Mapeamento UCAN → Operadores

| Operador | UCAN Necessário | Escopo |
|----------|----------------|--------|
| **DevOps Web2** | Netlify Token (externo) | Deploy Netlify |
| **DevOps IPFS** | UCAN PROJECT | Upload + Pin IPFS |
| **DevOps IPNS** | UCAN ROLE (PUBLISH_IPNS) | Publish IPNS apenas |
| **DevOps ENS** | Wallet privada | Configuração ENS |
| **Agent Automatizado** | UCAN AGENT | Publish IPNS (5-10min) |

### ⚠️ Nota de Segurança

- **UCAN ROOT**: Nunca expor em ambientes de execução. Mantido offline.
- **IPNS Key**: Mantenha a chave privada `ipns.neoflowoff.root` segura. Se comprometida, gere nova key e atualize o ENS.
- **ENS Wallet**: Use hardware wallet ou multisig para controle do domínio ENS.
- **Netlify Token**: Use variáveis de ambiente, nunca commite tokens.

---

## 📝 Checklist de Deploy

### Deploy Inicial

- [ ] Build local executado com sucesso
- [ ] Deploy Netlify concluído
- [ ] DNS configurado (sem Cloudflare)
- [ ] Upload IPFS concluído (CID anotado)
- [ ] IPNS publicado (IPNS Key anotada)
- [ ] ENS contenthash configurado
- [ ] ENS text record `url` configurado
- [ ] Verificação de todos os endpoints

### Deploy de Atualização

- [ ] Build local executado
- [ ] Deploy Netlify concluído
- [ ] Upload IPFS (novo CID)
- [ ] IPNS atualizado com novo CID
- [ ] Verificação de resolução IPNS

---

## 🛠️ Troubleshooting

### Problema: IPNS não resolve

```bash
# Verificar se IPNS está publicado
ipfs name resolve /ipns/k51qzi5uqu5d...

# Verificar se CID está pinned
ipfs pin ls | grep <CID>

# Republicar se necessário
ipfs name publish /ipfs/<CID> --key=ipns.neoflowoff.root
```

### Problema: ENS não resolve

```bash
# Verificar contenthash no ENS
ens-resolver contenthash neoflowoff.eth

# Verificar se IPNS Key está correta
# Comparar com o IPNS Key publicado
```

### Problema: Netlify não faz deploy

```bash
# Verificar autenticação
netlify status

# Verificar site ID
netlify sites:list

# Limpar cache e redeploy
netlify deploy --prod --dir=dist --build
```

### Problema: DNS não resolve

- Verificar registros DNS no painel do registrador
- Confirmar que **não há proxy Cloudflare** ativo
- Aguardar propagação DNS (até 48h)

---

## 📚 Referências

- **Netlify Docs**: https://docs.netlify.com/
- **IPFS Docs**: https://docs.ipfs.io/
- **IPNS Docs**: https://docs.ipfs.io/concepts/ipns/
- **ENS Docs**: https://docs.ens.domains/
- **Makefile**: `/Makefile` (comandos de build)

---

## ⚠️ Notas Importantes

1. **Cloudflare Removido**: Este projeto **não utiliza Cloudflare** como dependência de infraestrutura (proxy, DNS, Workers, Pages). DNS configurado diretamente no registrador.
   
   **Nota sobre CDN**: O projeto utiliza `cdnjs.cloudflare.com` apenas como CDN público para a biblioteca p5.js. Isso é um serviço CDN público e não representa dependência de infraestrutura Cloudflare. Se necessário, a biblioteca pode ser hospedada localmente.

2. **IPNS Refresh**: IPNS records não expiram logicamente, mas precisam ser reanunciados para manter resolução eficiente na rede. Configure um cron job para refresh automático:
   ```bash
   # Exemplo de cron (diário) - Refresh de disponibilidade
   # IPNS records não expiram, mas precisam ser reanunciados para manter resolução eficiente
   0 0 * * * /usr/local/bin/ipfs name publish /ipfs/<CID> --key=ipns.neoflowoff.root
   ```

3. **CID Imutável**: Cada build gera um novo CID. O IPNS permite atualizar sem mudar o ENS.

4. **Backup IPNS Key**: Faça backup da IPNS key privada (`ipns.neoflowoff.root`). Se perdida, será necessário criar nova key e atualizar o ENS.

---

## 🤖 Agent IPNSPublisher (Próximo Nível)

### Visão Geral

O próximo salto operacional é automatizar o processo de publicação IPNS através de um Agent dedicado, utilizando **UCAN AGENT** conforme definido na política executável acima.

### Arquitetura do Agent

```
┌─────────────────────────────────────────────────────────┐
│              Agent IPNSPublisher                        │
├─────────────────────────────────────────────────────────┤
│ Input: CID raiz do build                                │
│ Output: IPNS publicado e verificado                      │
│                                                          │
│ UCAN AGENT:                                             │
│   - Issuer: UCAN ROLE (PUBLISH_IPNS)                    │
│   - Expiração: 5-10 minutos                             │
│   - Escopo: /ipns/ipns.neoflowoff.root                 │
│   - Ação: publish (única)                              │
│                                                          │
│ Execução:                                               │
│   - Script local ou GitHub Action                        │
│   - Validação automática após publish                   │
│   - Logging e auditoria                                 │
└─────────────────────────────────────────────────────────┘
```

### Benefícios

- ✅ **Deploy quase automático**: Integração com pipeline CI/CD
- ✅ **Zero risco sistêmico**: UCAN AGENT expira em 5-10 minutos
- ✅ **Auditoria clara**: Cada publish rastreável e logado
- ✅ **Escalável**: Padrão replicável para múltiplos projetos
- ✅ **Conformidade UCAN**: Implementa política executável v1.1

### Implementação Sugerida

#### Opção 1: Script Local

```bash
#!/bin/bash
# scripts/publish-ipns.sh

CID=$1
KEY="ipns.neoflowoff.root"

if [ -z "$CID" ]; then
  echo "❌ CID não fornecido"
  exit 1
fi

echo "🔑 Publicando CID $CID no IPNS..."
ipfs name publish /ipfs/$CID --key=$KEY

echo "✅ Verificando publicação..."
RESOLVED=$(ipfs name resolve /ipns/$KEY)
if [ "$RESOLVED" = "/ipfs/$CID" ]; then
  echo "✅ IPNS publicado com sucesso!"
else
  echo "❌ Falha na verificação"
  exit 1
fi
```

#### Opção 2: GitHub Action

```yaml
# .github/workflows/publish-ipns.yml
name: Publish IPNS

on:
  workflow_dispatch:
    inputs:
      cid:
        description: 'CID raiz do build'
        required: true

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup IPFS
        run: |
          # Setup IPFS CLI
      - name: Publish IPNS
        run: |
          ipfs name publish /ipfs/${{ inputs.cid }} --key=ipns.neoflowoff.root
      - name: Verify
        run: |
          ipfs name resolve /ipns/ipns.neoflowoff.root
```

### Integração com Pipeline

1. **Build** → Gera CID
2. **Agent IPNSPublisher** → Publica CID no IPNS (com UCAN de 10min)
3. **Verificação** → Confirma resolução IPNS
4. **Logging** → Registra publish para auditoria

### Próximos Passos

- [ ] Implementar script de publish com UCAN
- [ ] Configurar GitHub Action (se aplicável)
- [ ] Integrar com pipeline de deploy
- [ ] Configurar logging e auditoria
- [ ] Documentar processo de geração de UCAN tokens

---

**Fim do Documento — DEPLOY_NEOFLOWOFF v1.1**

**Última atualização**: 2025-01-20  
**Mantido por**: DevOps NEOFLOWOFF
