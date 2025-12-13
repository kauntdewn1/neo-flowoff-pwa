import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import axios from 'axios';
import { createHmac } from 'crypto';

// Carrega variáveis de ambiente
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const MESSENGER_VERIFY_TOKEN = process.env.FB_MESSENGER_VERIFY_TOKEN || 'flowoff-messenger-verify-token';
const MESSENGER_APP_SECRET = process.env.FB_MESSENGER_APP_SECRET || '';
const isProduction = process.env.NODE_ENV === 'production';
const log = (...args) => {
  // Sempre loga em desenvolvimento, mesmo se NODE_ENV não estiver definido
  if (!isProduction || process.env.NODE_ENV === undefined) {
    console.log(...args);
  }
};
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
// Modelos via variáveis de ambiente (valores padrão seguros)
const OPENAI_MODEL = process.env.OPENAI_MODEL || process.env.LLM_MODEL || 'gpt-4o-mini';
const GEMINI_MODEL = process.env.GEMINI_MODEL || process.env.LLM_MODEL_FALLBACK || 'gemini-2.0-flash-exp';

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json'
};

  const verifyMessengerSignature = (signature = '', body = '') => {
    if (!signature || !MESSENGER_APP_SECRET) return false;
  const [algorithm, hash] = signature.split('=');
  if (algorithm !== 'sha256' || !hash) return false;
  const expectedHash = createHmac('sha256', MESSENGER_APP_SECRET).update(body).digest('hex');
  return hash === expectedHash;
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = decodeURIComponent(parsedUrl.pathname);
  
  // Remove query parameters for file serving
  const cleanPath = pathname.split('?')[0];

  // Messenger webhook (GET verification, POST events)
  if (cleanPath === '/webhook/messenger') {
    if (req.method === 'GET') {
      const hubMode = parsedUrl.query['hub.mode'];
      const hubToken = parsedUrl.query['hub.verify_token'];
      const challenge = parsedUrl.query['hub.challenge'];
      if (hubMode === 'subscribe' && hubToken === MESSENGER_VERIFY_TOKEN) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(challenge || '');
      } else {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Verify token mismatch');
      }
      return;
    }

    if (req.method === 'POST') {
      let payload = '';
      req.on('data', (chunk) => {
        payload += chunk;
      });

      req.on('end', () => {
        const signature = req.headers['x-hub-signature-256'];
        const signatureValid = !MESSENGER_APP_SECRET || verifyMessengerSignature(signature, payload);
        if (MESSENGER_APP_SECRET && !signatureValid) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid signature' }));
          return;
        }

        let parsed;
        try {
          parsed = payload ? JSON.parse(payload) : {};
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
          return;
        }

        log('Messenger webhook event received:', parsed.object || 'unknown');

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      });

      return;
    }

    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method not allowed');
    return;
  }

  // API endpoints
  if (cleanPath === '/api/health') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '2.1.3',
      apis: {
        validator: "✅ Validação local descentralizada (sem APIs externas)",
        lead: "✅ Disponível",
        cep: "✅ Validação local (descentralizado)"
      },
      features: {
        backgroundSync: "✅ Ativo",
        offlineQueue: "✅ Ativo",
        formValidation: "✅ Ativo"
      }
    }));
    return;
  }

  // API endpoint para receber leads
  if (cleanPath === '/api/lead' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const leadData = JSON.parse(body);
        
        // Aqui você pode salvar no banco de dados, enviar email, etc.
        // Por enquanto, apenas logamos e retornamos sucesso
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Lead recebido com sucesso',
          data: {
            id: Date.now(),
            ...leadData
          }
        }));
      } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          error: 'Erro ao processar lead',
          message: error.message
        }));
      }
    });
    return;
  }

  // API endpoint para consulta de CEP
  if (cleanPath.startsWith('/api/cep/')) {
    const cep = cleanPath.replace('/api/cep/', '').replace(/\D/g, '');
    
    if (cep.length !== 8) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.writeHead(400);
      res.end(JSON.stringify({
        success: false,
        error: 'CEP inválido',
        message: 'CEP deve ter 8 dígitos'
      }));
      return;
    }

    // Descentralizado: retorna estrutura básica sem dependência de APIs externas
    // O frontend faz validação local via SimpleValidator
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: {
        cep: cep.replace(/(\d{5})(\d{3})/, '$1-$2'),
        message: 'Validação local - sem dependência de APIs externas'
      },
      source: 'local'
    }));
    return;
  }

  // Endpoint removido: /api/invertexto
  // Descentralizado: não dependemos de APIs externas centralizadas
  // Validação local via SimpleValidator no frontend

  // API Chat com IA (OpenAI/Gemini)
  if (cleanPath === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { message, history = [] } = JSON.parse(body);
        
        if (!message || !message.trim()) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: 'Mensagem é obrigatória'
          }));
          return;
        }

        // Sistema de prompt para o agente
        const systemPrompt = `Você é NEO, o assistente IA da FlowOFF. A FlowOFF é uma agência especializada em:
- Marketing digital avançado e estratégia
- Blockchain e Web3
- Desenvolvimento de sistemas, WebApps e PWAs
- Tokenização de ativos
- Agentes IA personalizados
- Arquitetura de ecossistemas digitais

Você deve:
- Responder de forma direta, útil e profissional
- Ser proativo em ajudar, não apenas direcionar para humanos
- Usar conhecimento real sobre os serviços da FlowOFF
- Manter tom conversacional mas técnico quando necessário
- Se não souber algo específico, seja honesto mas ofereça alternativas

NÃO direcione imediatamente para humanos. Tente resolver primeiro com sua inteligência.`;

        let aiResponse = null;
        let modelUsed = null;
        let errorDetails = null;

        // Verificar se há chaves de API configuradas
        if (!OPENAI_API_KEY && !GOOGLE_API_KEY) {
          log('⚠️ Nenhuma API key configurada (OPENAI_API_KEY ou GOOGLE_API_KEY)');
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.writeHead(200);
          res.end(JSON.stringify({
            success: false,
            error: 'API keys não configuradas',
            message: 'Configure OPENAI_API_KEY ou GOOGLE_API_KEY no .env'
          }));
          return;
        }

        // Tentar OpenAI primeiro
        if (OPENAI_API_KEY) {
          try {
            log('🔄 Tentando OpenAI...');
            const messages = [
              { role: 'system', content: systemPrompt },
              ...history.slice(-10), // Últimas 10 mensagens para contexto
              { role: 'user', content: message }
            ];

            const openaiResponse = await axios.post(
              'https://api.openai.com/v1/chat/completions',
              {
                model: OPENAI_MODEL,
                messages: messages,
                temperature: 0.7,
                max_tokens: 500
              },
              {
                headers: {
                  'Authorization': `Bearer ${OPENAI_API_KEY}`,
                  'Content-Type': 'application/json'
                },
                timeout: 15000
              }
            );

            aiResponse = openaiResponse.data.choices[0]?.message?.content?.trim();
            modelUsed = OPENAI_MODEL;
            log('✅ OpenAI response received:', aiResponse?.substring(0, 50) + '...');
          } catch (error) {
            errorDetails = error.response?.data || error.message;
            log('❌ OpenAI error:', error.message);
            if (error.response?.status === 401) {
              log('⚠️ OpenAI API key inválida ou expirada');
            }
          }
        }

        // Fallback para Gemini se OpenAI falhar
        if (!aiResponse && GOOGLE_API_KEY) {
          try {
            log('🔄 Tentando Gemini como fallback...');
            const geminiResponse = await axios.post(
              `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
              {
                contents: [{
                  parts: [{
                    text: `${systemPrompt}\n\nHistórico:\n${history.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUsuário: ${message}\n\nNEO:`
                  }]
                }],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 500
                }
              },
              {
                timeout: 15000
              }
            );

            aiResponse = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            modelUsed = GEMINI_MODEL.replace('-exp', '');
            log('✅ Gemini response received:', aiResponse?.substring(0, 50) + '...');
          } catch (error) {
            errorDetails = error.response?.data || error.message;
            log('❌ Gemini error:', error.message);
            if (error.response?.status === 401 || error.response?.status === 403) {
              log('⚠️ Google API key inválida ou expirada');
            }
          }
        }

        // Se nenhuma API funcionou, retornar erro claro
        if (!aiResponse) {
          log('❌ Nenhuma API de IA funcionou. Erros:', errorDetails);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.writeHead(200);
          res.end(JSON.stringify({
            success: false,
            error: 'APIs de IA indisponíveis',
            message: 'Todas as tentativas de API falharam. Verifique as chaves de API.',
            details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
          }));
          return;
        }

        // Se ambas falharem, retornar null para usar fallback no frontend
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            response: aiResponse,
            model: modelUsed || 'unknown',
            timestamp: new Date().toISOString()
          }));
      } catch (error) {
        log('Chat API error:', error.message);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.writeHead(500);
        res.end(JSON.stringify({
          success: false,
          error: error.message
        }));
      }
    });
    return;
  }

  if (cleanPath === '/api/google-knowledge' && req.method === 'GET') {
    const queryParam = parsedUrl.query.q;
    if (!queryParam) {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(400);
      res.end(JSON.stringify({ success: false, error: 'Query is required' }));
      return;
    }

    if (!GOOGLE_API_KEY) {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(500);
      res.end(JSON.stringify({
        success: false,
        error: 'GOOGLE_API_KEY is not configured'
      }));
      return;
    }

    (async () => {
      const endpoint = 'https://kgsearch.googleapis.com/v1/entities:search';
      try {
        const response = await axios.get(endpoint, {
          params: {
            query: queryParam,
            key: GOOGLE_API_KEY,
            limit: 3,
            indent: false,
            languages: 'pt-BR,en'
          },
          timeout: 10000
        });

        const elements = response.data?.itemListElement || [];
        const entries = elements.map(({ result }) => {
          if (!result) return null;
          const parts = [];
          if (result.name) parts.push(result.name);
          if (result.description) parts.push(result.description);
          if (result.detailedDescription?.articleBody) {
            parts.push(result.detailedDescription.articleBody);
          }
          return parts.filter(Boolean).join(' — ');
        }).filter(Boolean);

        const summary = entries.slice(0, 3).join(' | ');

        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          summary: summary || 'Nenhuma informação adicional foi encontrada.',
          entries
        }));
      } catch (error) {
        log('Google knowledge failure:', error.message);
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(502);
        res.end(JSON.stringify({
          success: false,
          error: 'Erro ao consultar o Google Knowledge Graph'
        }));
      }
    })();
    return;
  }

  // Serve index.html for root
  if (cleanPath === '/') {
    cleanPath = '/index.html';
  }
  
  const filePath = path.join(__dirname, cleanPath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mimeTypes[ext] || 'text/plain';
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found, serve index.html for SPA routing
        fs.readFile(path.join(__dirname, 'index.html'), (err2, data2) => {
          if (err2) {
            log('❌ Erro ao ler index.html:', err2.message);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`<h1>404 - File not found</h1><p>Erro: ${err2.message}</p>`);
          } else {
            res.writeHead(200, { 
              'Content-Type': 'text/html',
              'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
              'Pragma': 'no-cache',
              'Expires': '0'
            });
            res.end(data2);
          }
        });
      } else {
        log('❌ Erro ao ler arquivo:', filePath, err.message, err.code);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        const errorMsg = isProduction 
          ? 'Internal Server Error' 
          : `<h1>500 - Server Error</h1><p>Erro: ${err.message}</p><p>Código: ${err.code}</p><p>Arquivo: ${filePath}</p>`;
        res.end(errorMsg);
      }
    } else {
      // Headers para evitar cache apenas para arquivos estáticos
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Content-Type', mimeType);
      res.writeHead(200);
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  // Sempre mostra mensagem de inicialização
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📁 Diretório: ${__dirname}`);
  console.log(`🌍 Ambiente: ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
  console.log(`✅ Servidor iniciado com sucesso!`);
  console.log(`   Acesse: http://localhost:${PORT}`);
  console.log(`   Pressione Ctrl+C para parar\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    log(`❌ Porta ${PORT} já está em uso!`);
    log('💡 Soluções:');
    log('   1. Pare o processo: kill -9 $(lsof -ti:${PORT})');
    log('   2. Use outra porta: PORT=3001 make dev');
    log('   3. Use servidor alternativo: make dev-python');
  } else {
    log('❌ Erro no servidor:', err.message);
  }
  process.exit(1);
});
