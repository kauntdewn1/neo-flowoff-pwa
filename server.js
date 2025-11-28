import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';

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
      apis: {
        invertexto: process.env.INVERTEXTO_API_TOKEN && process.env.INVERTEXTO_API_TOKEN !== 'seu_token_real_aqui' ? "✅ Configurado" : "⚠️ Token não configurado"
      }
    }));
    return;
  }
  
  // Serve index.html for root
  if (cleanPath === '/') {
    pathname = '/index.html';
  }
  
  // Mapeamento especial: styles.css -> css/main.css (CSS compilado)
  if (cleanPath === '/styles.css' || cleanPath === 'styles.css') {
    const cssPath = path.join(__dirname, 'css', 'main.css');
    if (fs.existsSync(cssPath)) {
      const data = fs.readFileSync(cssPath);
      res.setHeader('Content-Type', 'text/css');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.writeHead(200);
      res.end(data);
      return;
    }
  }
  
  // Determina o caminho do arquivo: primeiro tenta src/, depois public/, depois raiz
  let filePath = path.join(__dirname, 'src', cleanPath);
  let fileExists = fs.existsSync(filePath);
  
  if (!fileExists && cleanPath.startsWith('/public/')) {
    // Se começa com /public/, tenta diretamente em public/
    filePath = path.join(__dirname, cleanPath.substring(1));
    fileExists = fs.existsSync(filePath);
  } else if (!fileExists && !cleanPath.startsWith('/api/') && !cleanPath.startsWith('/css/')) {
    // Tenta em public/ se não encontrou em src/
    const publicPath = path.join(__dirname, 'public', cleanPath);
    if (fs.existsSync(publicPath)) {
      filePath = publicPath;
      fileExists = true;
    }
  }
  
  // Se ainda não encontrou e não é um caminho especial, tenta na raiz
  if (!fileExists && !cleanPath.startsWith('/api/') && !cleanPath.startsWith('/css/') && !cleanPath.startsWith('/public/')) {
    const rootPath = path.join(__dirname, cleanPath);
    if (fs.existsSync(rootPath)) {
      filePath = rootPath;
      fileExists = true;
    }
  }
  
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mimeTypes[ext] || 'text/plain';
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Verificar se é diretório antes de tentar ler
  fs.stat(filePath, (statErr, stats) => {
    if (statErr) {
      if (statErr.code === 'ENOENT') {
        // File not found, serve index.html for SPA routing
        fs.readFile(path.join(__dirname, 'src', 'index.html'), (err, data) => {
          if (err) {
            console.error('❌ Erro ao ler index.html:', err.message);
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
        console.error('❌ Erro ao acessar arquivo:', filePath, statErr.message);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`Server error: ${statErr.message}`);
      }
      return;
    }

    // Se for diretório, redirecionar para index.html
    if (stats.isDirectory()) {
      fs.readFile(path.join(__dirname, 'src', 'index.html'), (err, data) => {
        if (err) {
          console.error('❌ Erro ao ler index.html:', err.message);
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
      return;
    }

    // Ler arquivo
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('❌ Erro ao ler arquivo:', filePath, err.message);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`Server error: ${err.message}`);
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
});

server.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📁 Diretório: ${__dirname}`);
  console.log(`🚀 PWA pronta para uso!`);
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
