# 🚀 NEØ.FLOWOFF PWA

**Agência de Marketing na Blockchain**  
Desenvolvimento de sistemas, WebApp's, IAs e tokenização.

---

## 📋 Sobre

PWA (Progressive Web App) da NEØ.FLOWOFF, uma agência especializada em:
- Marketing digital avançado e estratégia
- Blockchain e Web3
- Desenvolvimento de sistemas, WebApps e PWAs
- Tokenização de ativos
- Agentes IA personalizados
- Arquitetura de ecossistemas digitais

---

## 🚀 Início Rápido

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
# ou
make dev

# Acesse: http://localhost:3000
```

### Build para Produção

```bash
# Build
npm run build
# ou
make build

# Resultado em: ./dist/
```

---

## 📁 Estrutura do Projeto

Ver documentação completa: [`docs/PROJECT-STRUCTURE.md`](docs/PROJECT-STRUCTURE.md)

### Principais Diretórios

- `js/` - JavaScript do frontend
- `css/` - CSS modularizado
- `public/` - Assets públicos (imagens, ícones)
- `scripts/` - Scripts de build e automação
- `netlify/functions/` - Netlify Functions
- `docs/` - Documentação completa

---

## 📚 Documentação

Toda documentação está em [`docs/`](docs/):

- **Deploy:** [`docs/DEPLOY_NEOFLOWOFF.md`](docs/DEPLOY_NEOFLOWOFF.md) - Guia completo de deploy (Netlify + IPFS + ENS)
- **Status:** [`docs/STATUS-RAPIDO.md`](docs/STATUS-RAPIDO.md) - Status rápido dos domínios
- **IPFS:** [`docs/IPFS-UPLOAD-GUIDE.md`](docs/IPFS-UPLOAD-GUIDE.md) - Guia de upload para IPFS
- **Estrutura:** [`docs/PROJECT-STRUCTURE.md`](docs/PROJECT-STRUCTURE.md) - Estrutura detalhada do projeto
- **Configurações:** 
  - [`docs/FACEBOOK-APP-CONFIG.md`](docs/FACEBOOK-APP-CONFIG.md)
  - [`docs/NETLIFY-SETUP.md`](docs/NETLIFY-SETUP.md)
  - [`docs/META-CRAWLER-FIX.md`](docs/META-CRAWLER-FIX.md)
  - [`docs/GLASS-MORPHISM-INTEGRATION.md`](docs/GLASS-MORPHISM-INTEGRATION.md)

---

## 🌐 Domínios

- **Web2:** 
  - `flowoff.xyz` (GoDaddy + Netlify)
  - `flowoff.com.br` (Registro.br + Netlify)
- **Web3:** 
  - `neoflowoff.eth` (ENS → IPNS)
- **Netlify:** 
  - `neo-flowoff.netlify.app`

---

## 🛠️ Scripts Disponíveis

```bash
npm start          # Inicia servidor
npm run dev        # Desenvolvimento com nodemon
npm run build      # Build para produção
npm run test       # Testes de validação
npm run ipns:publish # Publicar no IPNS
```

### Comandos Make

```bash
make help          # Lista comandos
make build         # Build da PWA
make dev           # Servidor local
make validate      # Valida estrutura
make clean         # Limpa build
```

---

## 🔧 Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Node.js (server.js para dev)
- **Deploy:** Netlify (Web2) + IPFS/IPNS (Web3)
- **IA:** OpenAI (GPT-4o-mini) + Google Gemini
- **PWA:** Service Worker, Manifest, Offline support

---

## 📦 Dependências

- `axios` - HTTP client
- `cbor` - UCAN token support
- `dotenv` - Variáveis de ambiente

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
PORT=3000
NODE_ENV=development

# APIs de IA (opcional - configure no Netlify UI)
# OPENAI_API_KEY=seu_token_aqui
# GOOGLE_API_KEY=seu_token_aqui
# LLM_MODEL=gpt-4o-mini
# LLM_MODEL_FALLBACK=gemini-2.0-flash-exp

# IPFS/IPNS
IPFS_API_URL=https://ipfs.io
IPNS_KEY_NAME=neo-flowoff-pwa
IPNS_KEY_ID=k51qzi...
UCAN_TOKEN=seu_token_aqui
```

---

## 📄 Licença

MIT

---

## 👤 Autor

**MELLØ™** - Arquiteto de Ecossistemas Digitais

- Website: https://flowoff.xyz
- ENS: neoflowoff.eth
- WhatsApp: +55 62 98323-1110

---

**Versão:** 2.1.3  
**Última atualização:** 2025-01-20
