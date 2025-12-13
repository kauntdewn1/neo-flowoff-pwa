// scripts/build.js - Build script para Netlify (sem dependência de make)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔨 Building PWA...');

// Valida estrutura mínima
const requiredFiles = [
  'index.html',
  'styles.css',
  'js/app.js',
  'manifest.webmanifest',
  'sw.js'
];

for (const file of requiredFiles) {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${file} não encontrado`);
    process.exit(1);
  }
}

// Cria diretório dist se não existir
const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Build CSS modularizado
console.log('🔨 Concatenando módulos CSS...');
try {
  execSync('bash build-css.sh', { cwd: rootDir, stdio: 'pipe' });
} catch (error) {
  console.error('❌ Erro ao construir CSS:', error.message);
  process.exit(1);
}

// Copia arquivos principais
const filesToCopy = [
  'index.html',
  'styles.css',
  'app.js',
  'manifest.webmanifest',
  'sw.js',
  'favicon.ico',
  'blog.html',
  'blog-styles.css',
  'blog.js',
  'desktop.html',
  'glass-morphism-bottom-bar.css',
  'bento-grid.css'
];

for (const file of filesToCopy) {
  const srcPath = path.join(rootDir, file);
  const destPath = path.join(distDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
  }
}

// Copia pasta js/
const jsSrcDir = path.join(rootDir, 'js');
const jsDestDir = path.join(distDir, 'js');
if (fs.existsSync(jsSrcDir)) {
  if (!fs.existsSync(jsDestDir)) {
    fs.mkdirSync(jsDestDir, { recursive: true });
  }
  const jsFiles = fs.readdirSync(jsSrcDir);
  for (const file of jsFiles) {
    const srcPath = path.join(jsSrcDir, file);
        const destPath = path.join(jsDestDir, file);
    if (fs.statSync(srcPath).isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copia diretório public (se existir)
const publicSrcDir = path.join(rootDir, 'public');
const publicDestDir = path.join(distDir, 'public');
if (fs.existsSync(publicSrcDir)) {
  fs.cpSync(publicSrcDir, publicDestDir, { recursive: true });
} else {
  // Tenta publicj como fallback
  const publicjSrcDir = path.join(rootDir, 'publicj');
  if (fs.existsSync(publicjSrcDir)) {
    fs.cpSync(publicjSrcDir, publicDestDir, { recursive: true });
  }
}

// Otimiza HTML (remove comentários)
const indexHtmlPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  let html = fs.readFileSync(indexHtmlPath, 'utf8');
  html = html.replace(/<!--.*?-->/gs, '');
  fs.writeFileSync(indexHtmlPath, html, 'utf8');
}

console.log('✅ Build concluído em ./dist/');
