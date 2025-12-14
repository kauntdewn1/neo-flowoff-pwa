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
const STORACHA_SPACE_DID = process.env.STORACHA_SPACE_DID || 'did:key:z6Mkjee3CCaP6q2vhRnE3wRBGNqMxEq645EvnYocsbbeZiBR';
const STORACHA_UCAN = process.env.STORACHA_UCAN || process.env.UCAN_TOKEN;
const USE_STORACHA = STORACHA_UCAN && STORACHA_DID;

// Função para mascarar valores sensíveis nos logs
function maskSensitive(value, showStart = 10, showEnd = 4) {
  if (!value || typeof value !== 'string') return '***';
  if (value.length <= showStart + showEnd) return '***';
  return `${value.substring(0, showStart)}...${value.substring(value.length - showEnd)}`;
}

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
    // Importa Storacha client
    const { create } = await import('@storacha/client');
    
    // Cria cliente Storacha
    console.log('🔧 Criando cliente Storacha...');
    const client = await create();
    
    // Mostra o DID do agente (útil para gerar delegações)
    try {
      const agentDID = client.agent?.did?.() || 'N/A';
      console.log(`   Agent DID: ${agentDID}\n`);
      console.log('💡 Use este DID para gerar delegações do espaço para este agente\n');
    } catch (e) {
      // Ignora se não conseguir obter o DID
    }
    
    // Configura o espaço - prioriza usar o espaço existente configurado
    let space;
    console.log(`📦 Configurando espaço Storacha...\n`);
    console.log(`   Espaço desejado: ${STORACHA_SPACE_DID}\n`);
    
    // Primeiro, tenta usar o espaço existente configurado com UCAN/Proof
    if (STORACHA_UCAN) {
      try {
        console.log('🔐 Tentando adicionar espaço existente usando proof...');
        
        // O proof gerado pelo CLI é um CAR file em base64
        // Precisamos decodificar e usar com addSpace
        const proofBytes = Buffer.from(STORACHA_UCAN, 'base64');
        
        // Adiciona o espaço usando o proof (CAR bytes)
        const addedSpace = await client.addSpace(proofBytes);
        await client.setCurrentSpace(addedSpace.did());
        space = addedSpace;
        console.log(`✅ Espaço adicionado via proof: ${space.did()}\n`);
        
        // Verifica se é o espaço desejado
        const spaceDID = space.did();
        if (spaceDID === STORACHA_SPACE_DID) {
          console.log(`✅ Espaço correto configurado: ${spaceDID}\n`);
        } else {
          console.log(`⚠️  Espaço adicionado (${spaceDID}) difere do desejado (${STORACHA_SPACE_DID})`);
          console.log(`   Usando o espaço adicionado: ${spaceDID}\n`);
        }
      } catch (proofError) {
        // Não expõe detalhes do erro que podem conter informações sensíveis
        console.log(`⚠️  Erro ao usar proof: ${proofError.message.substring(0, 100)}`);
        console.log('   Tentando método alternativo...\n');
      }
    }
    
    // Se não conseguiu com UCAN, tenta usar o espaço diretamente
    if (!space) {
      try {
        console.log(`🔗 Tentando usar espaço diretamente: ${STORACHA_SPACE_DID}...`);
        await client.setCurrentSpace(STORACHA_SPACE_DID);
        const currentSpace = client.currentSpace?.();
        const spaceDID = typeof currentSpace === 'string' 
          ? currentSpace 
          : (currentSpace?.did?.() || STORACHA_SPACE_DID);
        
        console.log(`✅ Espaço configurado diretamente: ${spaceDID}\n`);
        space = { did: () => spaceDID };
      } catch (setError) {
        console.log(`⚠️  Não foi possível usar espaço existente: ${setError.message}`);
        console.log('   Criando novo espaço...\n');
        
        // Última opção: cria um novo espaço
        try {
          space = await client.createSpace('neo-flowoff-pwa');
          await client.setCurrentSpace(space.did());
          console.log(`✅ Novo espaço criado: ${space.did()}\n`);
          console.log(`💡 Configure STORACHA_SPACE_DID=${space.did()} no .env para reutilizar\n`);
        } catch (createError) {
          throw new Error(`Não foi possível configurar espaço. Erro: ${createError.message}`);
        }
      }
    }
    
    // Verifica se temos um espaço válido
    if (!space) {
      throw new Error('Espaço não foi configurado');
    }
    
    const spaceDID = space.did();
    console.log(`🔍 Espaço final configurado: ${spaceDID}\n`);
    
    // Verifica espaço atual do cliente
    const currentSpaceCheck = client.currentSpace?.();
    if (currentSpaceCheck) {
      const currentDID = typeof currentSpaceCheck === 'string' 
        ? currentSpaceCheck 
        : (currentSpaceCheck.did?.() || String(currentSpaceCheck));
      console.log(`🔍 Espaço atual do cliente: ${currentDID}\n`);
      
      if (currentDID !== spaceDID) {
        console.log('⚠️  Aviso: Espaço configurado difere do espaço atual do cliente\n');
      }
    }

    // Prepara arquivos do diretório dist
    console.log('📦 Preparando arquivos do diretório...');
    const files = await filesFromPaths([DIST_DIR]);
    console.log(`   ${files.length} arquivo(s) preparado(s)\n`);

    // Verifica se o espaço tem permissões antes de fazer upload
    const finalSpaceDID = space.did();
    console.log(`🔐 Verificando permissões do espaço: ${finalSpaceDID}\n`);
    
    // Faz upload do diretório passando o espaço
    console.log('📤 Enviando para Storacha/IPFS...');
    console.log('   (Isso pode falhar se o espaço não tiver permissões de escrita)\n');
    
    const cid = await client.uploadDirectory(files, { space });

    console.log(`✅ Upload via Storacha concluído! CID: ${cid}\n`);
    console.log(`🌐 Gateway: https://storacha.link/ipfs/${cid}\n`);
    return cid;
  } catch (error) {
    // Mascara mensagens de erro que podem conter informações sensíveis
    const safeErrorMessage = error.message ? error.message.substring(0, 200) : 'Erro desconhecido';
    console.error('❌ Erro no upload via Storacha:', safeErrorMessage);
    
    // Mensagens de ajuda específicas
    if (error.message && error.message.includes('space/blob/add')) {
      console.error('\n💡 Erro de permissão detectado!');
      console.error('   O espaço precisa de uma delegação (proof) válida.\n');
      console.error('💡 Como resolver:');
      console.error('   1. Gere uma delegação do espaço para seu agente usando Storacha CLI:');
      console.error('      storacha space use <SPACE_DID>');
      console.error('      storacha delegation create <AGENT_DID> \\');
      console.error('        --can space/blob/add \\');
      console.error('        --can space/index/add \\');
      console.error('        --can filecoin/offer \\');
      console.error('        --can upload/add \\');
      console.error('        --base64');
      console.error('');
      console.error('   2. Use o output base64 como STORACHA_UCAN no .env');
      console.error(`   3. Espaço: ${STORACHA_SPACE_DID ? maskSensitive(STORACHA_SPACE_DID, 25, 8) : 'N/A'}`);
      console.error('   4. Verifique no console: https://console.storacha.network\n');
      console.error('   Ou deixe o código criar um novo espaço automaticamente.\n');
    }
    
    // Não expõe stack trace completo (pode conter informações sensíveis)
    if (error.stack && process.env.NODE_ENV === 'development') {
      console.error('\nStack (dev only):', error.stack.substring(0, 500));
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
  console.log('   Configure Storacha no .env para upload permanente via Web3.\n');
  
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
