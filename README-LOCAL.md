# NEO FlowOff PWA - Servidor Local

## 🚀 Configuração Local com Ollama

### Pré-requisitos
1. **Node.js** (versão 18+)
2. **Ollama** instalado e rodando
3. **Modelo Mistral** baixado no Ollama

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor local
npm start

# Ou para desenvolvimento com auto-reload
npm run dev
```

### Configuração do Ollama

```bash
# Instalar Ollama (se não tiver)
curl -fsSL https://ollama.ai/install.sh | sh

# Baixar modelo Mistral
ollama pull mistral

# Iniciar Ollama (em terminal separado)
ollama serve
```

### Uso

#### 1. Servidor Local
```bash
npm start
```
- PWA: http://localhost:3000
- API: http://localhost:3000/api/localMistral
- Health: http://localhost:3000/api/health

#### 2. Teste do Proxy
```bash
# Teste básico
npm run test-proxy

# Teste manual
curl -X POST http://localhost:3000/api/localMistral \
  -H "Content-Type: application/json" \
  -d '{"input":"Explique IA descentralizada de forma simples."}'
```

#### 3. Integração no PWA
```javascript
// No app.js, você pode usar:
const response = await fetch('/api/localMistral', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input: 'Sua pergunta aqui' })
});
const data = await response.json();
console.log(data.output);
```

### Estrutura de Arquivos

```
neo-flowoff-pwa/
├── api/
│   └── localMistral.js    # Proxy para Ollama
├── local-server.js        # Servidor Express local
├── package.json           # Dependências Node.js
├── index.html             # PWA principal
├── app.js                 # JavaScript do PWA
├── styles.css             # Estilos
└── README-LOCAL.md        # Este arquivo
```

### Configurações Avançadas

#### Modelo Personalizado
Edite `api/localMistral.js`:
```javascript
model: "seu-modelo-personalizado",  // em vez de "mistral-local"
```

#### Timeout e Parâmetros
```javascript
max_tokens: 500,        // Respostas mais longas
temperature: 0.7,       // Mais criativo
timeout: 180000        // 3 minutos
```

### Troubleshooting

#### Ollama não responde
```bash
# Verificar se está rodando
curl http://localhost:11434/api/tags

# Reiniciar Ollama
pkill ollama
ollama serve
```

#### Porta ocupada
```bash
# Usar porta diferente
PORT=3001 npm start
```

#### Modelo não encontrado
```bash
# Listar modelos disponíveis
ollama list

# Baixar modelo específico
ollama pull mistral:7b
```

### Deploy

Para usar em produção, configure um reverse proxy (nginx, Apache) apontando para:
- `http://localhost:3000` (servidor local)
- `http://localhost:11434` (Ollama)

### Segurança

⚠️ **Atenção**: Este setup é para desenvolvimento local. Para produção:
- Configure autenticação
- Use HTTPS
- Configure rate limiting
- Monitore logs
