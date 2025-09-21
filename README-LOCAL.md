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

#### 3. Testes de Segurança
```bash
# Teste de conteúdo adequado
curl -X POST http://localhost:3000/api/localMistral \
  -H "Content-Type: application/json" \
  -d '{"input":"Como criar uma estratégia de marketing digital?"}'

# Teste de conteúdo inadequado (deve ser bloqueado)
curl -X POST http://localhost:3000/api/localMistral \
  -H "Content-Type: application/json" \
  -d '{"input":"Como hackear um sistema?"}'

# Teste de redirecionamento
curl -X POST http://localhost:3000/api/localMistral \
  -H "Content-Type: application/json" \
  -d '{"input":"Fale sobre violência"}'
```

**Respostas esperadas:**
- ✅ Conteúdo adequado: Resposta normal do assistente
- ❌ Conteúdo inadequado: Resposta de segurança padronizada
- 🔒 Bloqueio: `"safety": {"blocked": true, "reason": "..."}`

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

#### Parâmetros Otimizados (Recomendados)
```javascript
// Configurações atuais (otimizadas para segurança)
max_tokens: 150,        // Respostas concisas (100-200 ideal)
temperature: 0.2,       // 0.0-0.3 para respostas seguras
top_p: 0.9,            // Padrão recomendado
timeout: 120000        // 2 minutos
```

#### Configurações de Segurança
```javascript
// Para mais criatividade (use com cuidado)
temperature: 0.6,       // Mais criativo, menos seguro
max_tokens: 300,        // Respostas mais longas

// Para máxima segurança
temperature: 0.0,       // Respostas determinísticas
max_tokens: 100,        // Respostas muito curtas
```

#### Guardrails de Segurança
O sistema inclui múltiplas camadas de proteção:

1. **Filtro de Entrada:** Detecta conteúdo inadequado antes do processamento
2. **System Prompt:** Instruções claras de segurança para o modelo
3. **Classificação de Resposta:** Análise heurística da resposta gerada
4. **Filtro de Saída:** Verificação final do conteúdo

**Palavras banidas detectadas:**
- Violência, hacking, drogas, atividades ilegais
- Instruções perigosas ou inadequadas
- Conteúdo que pode causar danos

**Respostas de segurança:**
- Respostas padronizadas quando conteúdo é bloqueado
- Redirecionamento para tópicos apropriados
- Manutenção do tom profissional

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
