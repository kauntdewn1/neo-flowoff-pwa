#!/usr/bin/env node
/**
 * 🚀 Script de Deploy Completo para IPFS/IPNS
 * 
 * Executa:
 * 1. Build da PWA
 * 2. Upload para IPFS
 * 3. Publicação no IPNS
 * 4. Commit e Push para Git
 * 
 * Uso:
 *   node scripts/deploy-ipfs.js
 *   UCAN_TOKEN=<token> node scripts/deploy-ipfs.js
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join, relative as pathRelative } from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Carrega .env
dotenv.config({ path: join(PROJECT_ROOT, '.env') });

const DIST_DIR = join(PROJECT_ROOT, 'dist');
const IPNS_KEY_NAME = process.env.IPNS_KEY_NAME || 'neo-flowoff-pwa';

// Configuração de pinning remoto
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const USE_REMOTE_PINNING = PINATA_API_KEY && PINATA_SECRET_KEY;

async function runCommand(command, options = {}) {
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      ...options
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function build() {
  console.log('\n🔨 Passo 1: Build da PWA...\n');
  const result = await runCommand('npm run build');
  if (!result.success) {
    console.error('❌ Erro no build');
    process.exit(1);
  }
  console.log('✅ Build concluído\n');
}

async function uploadToPinata() {
  console.log('📦 Fazendo upload via Pinata API...\n');
  
  try {
    const formData = new FormData();
    
    // Adiciona todos os arquivos do diretório mantendo a estrutura
    const files = getAllFiles(DIST_DIR);
    for (const file of files) {
      // Calcula o caminho relativo a partir de dist/
      const relativePath = pathRelative(DIST_DIR, file);
      // Pinata espera o caminho relativo como filepath
      formData.append('file', fs.createReadStream(file), {
        filepath: relativePath
      });
    }

    // Configura opções de pinning
    formData.append('pinataOptions', JSON.stringify({
      cidVersion: 0,
      wrapWithDirectory: true // Importante: mantém estrutura de diretório
    }));

    formData.append('pinataMetadata', JSON.stringify({
      name: 'neo-flowoff-pwa',
      keyvalues: {
        project: 'neo-flowoff-pwa',
        version: process.env.npm_package_version || '2.1.4',
        timestamp: new Date().toISOString()
      }
    }));

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    );

    const cid = response.data.IpfsHash;
    console.log(`✅ Upload via Pinata concluído! CID: ${cid}\n`);
    return cid;
  } catch (error) {
    console.error('❌ Erro no upload via Pinata:', error.response?.data || error.message);
    throw error;
  }
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

async function uploadToIPFSLocal() {
  console.log('📦 Fazendo upload via IPFS local...\n');
  
  // Verifica se IPFS está instalado
  try {
    execSync('which ipfs', { stdio: 'ignore' });
  } catch {
    console.error('❌ IPFS CLI não encontrado. Instale o IPFS: https://docs.ipfs.tech/install/');
    process.exit(1);
  }

  // Faz upload para IPFS
  const command = `ipfs add -r --pin --quiet ${DIST_DIR}`;
  const output = execSync(command, {
    encoding: 'utf-8',
    cwd: PROJECT_ROOT
  });

  // Extrai o CID do diretório (última linha é o diretório raiz)
  const lines = output.trim().split('\n').filter(line => line.trim());
  const lastLine = lines[lines.length - 1];
  
  // Com --quiet, o formato é apenas o CID
  const cid = lastLine.trim();
  
  if (!cid || !cid.startsWith('Qm')) {
    console.error('❌ Não foi possível extrair o CID do upload');
    console.error('Output:', output);
    process.exit(1);
  }
  
  console.log(`✅ Upload local concluído! CID: ${cid}`);
  console.log('⚠️  ATENÇÃO: Este CID só estará disponível enquanto o nó IPFS local estiver rodando!');
  console.log('   Configure PINATA_API_KEY e PINATA_SECRET_KEY no .env para pinning remoto.\n');
  
  return cid;
}

async function pinToRemote(cid) {
  if (!USE_REMOTE_PINNING) {
    console.log('⚠️  Pinning remoto não configurado. O conteúdo pode ficar indisponível quando o Mac desligar.');
    console.log('   Configure PINATA_API_KEY e PINATA_SECRET_KEY no .env para garantir disponibilidade permanente.\n');
    return;
  }

  console.log('📌 Fazendo pinning remoto via Pinata...\n');
  
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinByHash',
      {
        hashToPin: cid,
        pinataMetadata: {
          name: 'neo-flowoff-pwa',
          keyvalues: {
            project: 'neo-flowoff-pwa',
            version: process.env.npm_package_version || '2.1.4',
            timestamp: new Date().toISOString()
          }
        }
      },
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY
        }
      }
    );

    console.log(`✅ Pinning remoto concluído! CID ${cid} está permanentemente disponível.\n`);
  } catch (error) {
    console.error('❌ Erro no pinning remoto:', error.response?.data || error.message);
    console.error('⚠️  Continuando sem pinning remoto...\n');
  }
}

async function uploadToIPFS() {
  console.log('📦 Passo 2: Upload para IPFS...\n');
  
  // Verifica se dist existe
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Diretório dist/ não encontrado. Execute o build primeiro.');
    process.exit(1);
  }

  let cid;

  // Tenta usar Pinata se configurado
  if (USE_REMOTE_PINNING) {
    try {
      cid = await uploadToPinata();
    } catch (error) {
      console.error('❌ Falha no upload via Pinata, tentando método local...\n');
      cid = await uploadToIPFSLocal();
      // Tenta fazer pinning remoto mesmo se o upload foi local
      await pinToRemote(cid);
    }
  } else {
    // Usa método local
    cid = await uploadToIPFSLocal();
    // Tenta fazer pinning remoto se as credenciais estiverem disponíveis
    await pinToRemote(cid);
  }

  return cid;
}

async function publishToIPNS(cid) {
  console.log('🌐 Passo 3: Publicação no IPNS...\n');
  
  const ucanToken = process.env.UCAN_TOKEN;
  if (!ucanToken) {
    console.error('❌ UCAN_TOKEN não encontrado no .env');
    process.exit(1);
  }

  // Executa o script de publicação IPNS
  const command = `node scripts/ipns-publisher.js ${cid}`;
  const result = await runCommand(command, {
    env: { ...process.env, UCAN_TOKEN: ucanToken }
  });

  if (!result.success) {
    console.error('❌ Erro ao publicar no IPNS');
    process.exit(1);
  }

  console.log('✅ Publicação no IPNS concluída!\n');
}

async function commitAndPush() {
  console.log('📝 Passo 4: Commit e Push...\n');

  // Verifica status do git
  const status = execSync('git status --porcelain', {
    encoding: 'utf-8',
    cwd: PROJECT_ROOT
  }).trim();

  if (!status) {
    console.log('ℹ️  Nenhuma mudança para commitar');
    return;
  }

  // Adiciona todos os arquivos
  console.log('📦 Adicionando arquivos ao git...');
  await runCommand('git add -A');

  // Commit
  const commitMessage = `Deploy IPFS/IPNS - ${new Date().toISOString()}`;
  console.log(`💾 Commit: ${commitMessage}`);
  const commitResult = await runCommand(`git commit -m "${commitMessage}"`);
  
  if (!commitResult.success) {
    console.error('❌ Erro no commit');
    process.exit(1);
  }

  // Push
  console.log('🚀 Push para origin...');
  const pushResult = await runCommand('git push origin main');
  
  if (!pushResult.success) {
    console.error('❌ Erro no push');
    process.exit(1);
  }

  console.log('✅ Commit e push concluídos!\n');
}

// Main
async function main() {
  console.log('🚀 Deploy Completo para IPFS/IPNS\n');
  console.log('═══════════════════════════════════════\n');

  try {
    await build();
    const cid = await uploadToIPFS();
    await publishToIPNS(cid);
    await commitAndPush();

    console.log('═══════════════════════════════════════');
    console.log('✅ Deploy completo concluído com sucesso!');
    console.log('═══════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

main();
