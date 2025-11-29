#!/usr/bin/env node
/**
 * Script para atualizar versão do PWA automaticamente
 * Atualiza: package.json, manifest.webmanifest, sw.js, index.html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Obter versão do package.json
function getCurrentVersion() {
  const packagePath = path.join(rootDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  return packageJson.version;
}

// Incrementar versão (patch, minor, major)
function incrementVersion(version, type = 'patch') {
  const [major, minor, patch] = version.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

// Atualizar package.json
function updatePackageJson(version) {
  const packagePath = path.join(rootDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  packageJson.version = version;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ package.json atualizado para v${version}`);
}

// Atualizar manifest.webmanifest
function updateManifest(version) {
  const manifestPath = path.join(rootDir, 'src', 'manifest.webmanifest');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.version = version;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`✅ manifest.webmanifest atualizado para v${version}`);
}

// Atualizar sw.js (CACHE version)
function updateServiceWorker(version) {
  const swPath = path.join(rootDir, 'src', 'sw.js');
  let swContent = fs.readFileSync(swPath, 'utf8');
  
  // Atualizar CACHE version
  const cacheRegex = /const CACHE = ['"]neo-flowoff-v[\d.]+[^'"]*['"]/;
  swContent = swContent.replace(cacheRegex, `const CACHE = 'neo-flowoff-v${version}-clean'`);
  
  fs.writeFileSync(swPath, swContent);
  console.log(`✅ sw.js atualizado para v${version}`);
}

// Atualizar index.html (query strings ?v=)
function updateIndexHtml(version) {
  const htmlPath = path.join(rootDir, 'src', 'index.html');
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Atualizar TODAS as versões nos query strings (padrão genérico)
  // Isso pega qualquer arquivo com ?v=X.X.X
  htmlContent = htmlContent.replace(
    /\?v=[\d.]+/g,
    `?v=${version}`
  );
  
  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`✅ index.html atualizado para v${version}`);
}

// Função principal
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  let newVersion;
  
  if (command === 'increment') {
    const type = args[1] || 'patch'; // patch, minor, major
    const currentVersion = getCurrentVersion();
    newVersion = incrementVersion(currentVersion, type);
    console.log(`📦 Incrementando versão: ${currentVersion} → ${newVersion} (${type})`);
  } else if (command === 'set') {
    newVersion = args[1];
    if (!newVersion || !/^\d+\.\d+\.\d+$/.test(newVersion)) {
      console.error('❌ Versão inválida. Use: node scripts/update-version.js set 1.2.3');
      process.exit(1);
    }
    console.log(`📦 Definindo versão: ${newVersion}`);
  } else {
    // Sem argumentos: apenas sincronizar versões existentes
    newVersion = getCurrentVersion();
    console.log(`🔄 Sincronizando versões para: ${newVersion}`);
  }
  
  // Atualizar todos os arquivos
  updatePackageJson(newVersion);
  updateManifest(newVersion);
  updateServiceWorker(newVersion);
  updateIndexHtml(newVersion);
  
  console.log(`\n✅ Versão ${newVersion} aplicada em todos os arquivos!`);
  console.log(`\n💡 Próximo passo: make build`);
}

main();

