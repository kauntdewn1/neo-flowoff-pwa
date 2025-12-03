#!/usr/bin/env node
/**
 * Script de Setup e Inicialização - NEØ.FLOWOFF PWA
 * Garante que tudo está configurado e atualizado
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('→ NEØ.FLOWOFF PWA - Setup e Inicialização\n');

// 1. Verificar Node.js
console.log('• Verificando ambiente...');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
  const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
  if (majorVersion < 18) {
    console.error('✗ Node.js versão 18+ é necessário. Versão atual:', nodeVersion);
    process.exit(1);
  }
  console.log(`  ✓ Node.js ${nodeVersion} (OK)`);
} catch (error) {
  console.error('✗ Node.js não encontrado');
  process.exit(1);
}

// 2. Instalar dependências
console.log('\n📦 Instalando/atualizando dependências...');
try {
  execSync('npm install', { stdio: 'inherit', cwd: __dirname });
  console.log('  ✓ Dependências instaladas');
} catch (error) {
  console.error('✗ Erro ao instalar dependências');
  process.exit(1);
}

// 3. Verificar/criar .env
console.log('\n⚙️  Verificando configuração...');
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env-example.txt');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('  ⚠️  Arquivo .env não encontrado');
    console.log('  📝 Copiando env-example.txt para .env...');
    const envExample = fs.readFileSync(envExamplePath, 'utf-8');
    fs.writeFileSync(envPath, envExample);
    console.log('  ✓ Arquivo .env criado (configure suas variáveis)');
  } else {
    console.log('  ⚠️  Arquivo .env não encontrado e env-example.txt não existe');
  }
} else {
  console.log('  ✓ Arquivo .env existe');
}

// 4. Validar estrutura PWA
console.log('\n• Validando estrutura PWA...');
const requiredFiles = [
  'index.html',
  'styles.css',
  'app.js',
  'manifest.webmanifest',
  'sw.js'
];

const requiredDirs = ['public'];

let allOk = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ✗ ${file} (FALTANDO)`);
    allOk = false;
  }
});

requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`  ✓ ${dir}/`);
  } else {
    console.log(`  ✗ ${dir}/ (FALTANDO)`);
    allOk = false;
  }
});

if (!allOk) {
  console.error('\n✗ Estrutura PWA incompleta');
  process.exit(1);
}

// 5. Verificar pasta .projetos
console.log('\n📁 Verificando pasta .projetos...');
const projetosPath = path.join(__dirname, '.projetos');
if (!fs.existsSync(projetosPath)) {
  fs.mkdirSync(projetosPath, { recursive: true });
  console.log('  ✓ Pasta .projetos criada');
} else {
  console.log('  ✓ Pasta .projetos existe');
}

// 6. Resumo
console.log('\n✅ Setup concluído!\n');
console.log('📋 Próximos passos:');
console.log('  1. Configure o arquivo .env com suas variáveis de ambiente');
console.log('  2. Execute: npm start (ou npm run dev para desenvolvimento)');
console.log('  3. Acesse: http://localhost:3000\n');

