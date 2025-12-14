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
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { filesFromPaths } from 'files-from-path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Carrega .env
dotenv.config({ path: join(PROJECT_ROOT, '.env') });

const DIST_DIR = join(PROJECT_ROOT, 'dist');
const IPNS_KEY_NAME = process.env.IPNS_KEY_NAME || 'neo-flowoff-pwa';

// Configuração Storacha (Web3 descentralizado)
const STORACHA_DID = process.env.STORACHA_DID || 'did:key:z4MXj1wBzi9jUstyPWmomSd1pFwszvphKndMbzxrAdxYPNYpEhdHeDWvtULKgrWfbbSXFeQZbpnSPihq2NFL1GaqvFGRPYRRKzap12r57RdqvUEBdvbravLoKd5ZTsU6AwfoE6qfn8cGvCkxeZTwSAH5ob3frxH85px2TGYDJ9hPGFnkFo5Ysoc2gk9fvK9Q1Esod5Mv6CMDbnT3icR2jYZWsaBNzzfB5vhd4YQtkghxuzZABtyJYYz54FbjD6AXuogZksorduWuZT4f8wKoinsZ86UqsKPHxquSDSfLjGiVaT8BTGoRg7kri8fZGKA2tukYug4TiQVDprgGEbL6N85XHDJ2RQ6EVwscrhLG38aSzqms1Mjjv';
const STORACHA_UCAN = process.env.STORACHA_UCAN || process.env.UCAN_TOKEN;
const USE_STORACHA = STORACHA_UCAN && STORACHA_DID;

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

async function uploadToStoracha() {
  console.log('🌐 Fazendo upload via Storacha (Web3 descentralizado)...\n');
  
  try {
    // Importa Storacha client dinamicamente
    const { create } = await import('@storacha/client');
    const { Signer } = await import('@storacha/client/principal/ed25519');
    const { Delegation } = await import('@storacha/client');
    
    // Cria signer a partir do DID key (se disponível)
    // Para Storacha, precisamos criar o cliente com o principal
    let principal;
    try {
      // Tenta criar signer a partir de uma chave privada se disponível
      // Se não, usa o DID diretamente
      if (process.env.STORACHA_PRIVATE_KEY) {
        principal = Signer.parse(process.env.STORACHA_PRIVATE_KEY);
      } else {
        // Cria cliente sem principal (será criado automaticamente)
        principal = null;
      }
    } catch (e) {
      console.log('ℹ️  Criando cliente Storacha sem signer específico...');
      principal = null;
    }

    // Cria cliente Storacha
    const client = principal 
      ? await create({ principal })
      : await create();

    // Se temos UCAN, aplica a delegação
    if (STORACHA_UCAN) {
      console.log('🔐 Aplicando delegação UCAN...');
      try {
        const delegationData = Buffer.from(STORACHA_UCAN, 'base64url');
        const delegation = await Delegation.extract(new Uint8Array(delegationData));
        
        if (delegation.ok) {
          // Adiciona espaço com a delegação
          const space = await client.addSpace(delegation.ok);
          client.setCurrentSpace(space.did());
          console.log(`✅ Espaço Storacha configurado: ${space.did()}\n`);
        } else {
          console.log('⚠️  UCAN não pôde ser extraído, continuando sem delegação...\n');
        }
      } catch (ucanError) {
        console.log('⚠️  Erro ao processar UCAN, continuando sem delegação:', ucanError.message);
      }
    }

    // Prepara arquivos do diretório dist
    console.log('📦 Preparando arquivos do diretório...');
    const files = await filesFromPaths([DIST_DIR]);

    // Faz upload do diretório
    console.log('📤 Enviando para Storacha/IPFS...');
    const cid = await client.uploadDirectory(files);

    console.log(`✅ Upload via Storacha concluído! CID: ${cid}\n`);
    return cid;
  } catch (error) {
    console.error('❌ Erro no upload via Storacha:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    throw error;
  }
}

// Função removida - usando files-from-path agora

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

// Função removida - Storacha faz pinning automático no upload

async function uploadToIPFS() {
  console.log('📦 Passo 2: Upload para IPFS...\n');
  
  // Verifica se dist existe
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Diretório dist/ não encontrado. Execute o build primeiro.');
    process.exit(1);
  }

  let cid;

  // Tenta usar Storacha se configurado (Web3 descentralizado)
  if (USE_STORACHA) {
    try {
      cid = await uploadToStoracha();
      console.log('✅ Upload via Storacha concluído! O conteúdo está permanentemente disponível na rede IPFS (Web3).\n');
    } catch (error) {
      console.error('❌ Falha no upload via Storacha, tentando método local...\n');
      cid = await uploadToIPFSLocal();
      console.log('⚠️  Usando método local. Configure STORACHA_UCAN e STORACHA_DID no .env para upload permanente.\n');
    }
  } else {
    // Usa método local
    cid = await uploadToIPFSLocal();
    console.log('⚠️  Configure STORACHA_UCAN e STORACHA_DID no .env para upload permanente via Web3.\n');
  }

  return cid;
}

async function publishToIPNS(cid) {
  console.log('🌐 Passo 3: Publicação no IPNS...\n');
  
  // Usa UCAN_TOKEN ou STORACHA_UCAN como fallback
  const ucanToken = process.env.UCAN_TOKEN || process.env.STORACHA_UCAN;
  if (!ucanToken) {
    console.error('❌ UCAN_TOKEN ou STORACHA_UCAN não encontrado no .env');
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
