import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

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

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = decodeURIComponent(parsedUrl.pathname);
  
  // Remove query parameters for file serving
  const cleanPath = pathname.split('?')[0];
  
  // API endpoints
  if (cleanPath === '/api/health') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '2.1.0',
      apis: {
        invertexto: process.env.INVERTEXTO_API_TOKEN && process.env.INVERTEXTO_API_TOKEN !== 'seu_token_real_aqui' ? "✅ Configurado" : "⚠️ Token não configurado",
        lead: "✅ Disponível",
        cep: process.env.INVERTEXTO_API_TOKEN && process.env.INVERTEXTO_API_TOKEN !== 'seu_token_real_aqui' ? "✅ Disponível" : "⚠️ Requer token Invertexto"
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

    // Tentar consultar via API Invertexto se disponível
    const token = process.env.INVERTEXTO_API_TOKEN;
    if (token && token !== 'seu_token_real_aqui') {
      // Usar IIFE async para fazer a requisição
      (async () => {
        try {
          const axios = (await import('axios')).default;
          const response = await axios.get(`https://invertexto.com/api/cep/${cep}`, {
            params: { token },
            timeout: 10000
          });
          
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: response.data,
            source: 'invertexto'
          }));
        } catch (error) {
          // Se falhar, retornar erro mas não bloquear
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.writeHead(200);
          res.end(JSON.stringify({
            success: false,
            error: 'CEP não encontrado ou serviço indisponível',
            message: 'Você pode continuar mesmo assim',
            cep: cep
          }));
        }
      })();
      return;
    } else {
      // Sem token, retornar que não está disponível mas não é erro
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.writeHead(200);
      res.end(JSON.stringify({
        success: false,
        error: 'Serviço de CEP não configurado',
        message: 'Você pode continuar mesmo assim',
        cep: cep
      }));
      return;
    }
  }
  
  // Serve index.html for root
  if (cleanPath === '/') {
    pathname = '/index.html';
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
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('File not found');
          } else {
            res.writeHead(200, { 
              'Content-Type': 'text/html',
              'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
              'Pragma': 'no-cache',
              'Expires': '0'
            });
            res.end(data);
          }
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('Server error');
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
  // Servidor rodando
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Porta ${PORT} já está em uso!`);
    console.log(`💡 Soluções:`);
    console.log(`   1. Pare o processo: kill -9 $(lsof -ti:${PORT})`);
    console.log(`   2. Use outra porta: PORT=3001 make dev`);
    console.log(`   3. Use servidor alternativo: make dev-python`);
  } else {
    console.error('❌ Erro no servidor:', err.message);
  }
  process.exit(1);
});
