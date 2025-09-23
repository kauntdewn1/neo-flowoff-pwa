#!/usr/bin/env node

// optimize-images.js - Script para otimizar imagens do projeto
const fs = require('fs');
const path = require('path');

console.log('🖼️  Otimizador de Imagens - NEO.FLOWOFF');
console.log('=====================================\n');

// Função para obter tamanho do arquivo em MB
function getFileSizeMB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
}

// Função para listar arquivos PNG
function findPNGFiles(dir) {
  const files = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (path.extname(item).toLowerCase() === '.png') {
        files.push(fullPath);
      }
    }
  }
  
  scanDirectory(dir);
  return files;
}

// Função para otimizar imagem (simulação)
function optimizeImage(filePath) {
  const sizeBefore = getFileSizeMB(filePath);
  
  // Simulação de otimização (em produção, usar ferramentas como imagemin)
  console.log(`📁 ${path.basename(filePath)}`);
  console.log(`   Tamanho atual: ${sizeBefore} MB`);
  
  // Sugestões de otimização
  if (parseFloat(sizeBefore) > 1.0) {
    console.log(`   ⚠️  IMAGEM GRANDE - Recomendações:`);
    console.log(`   • Converter para WebP (redução ~70%)`);
    console.log(`   • Reduzir qualidade para 80-85%`);
    console.log(`   • Redimensionar se necessário`);
    console.log(`   • Usar compressão PNG otimizada`);
  } else if (parseFloat(sizeBefore) > 0.5) {
    console.log(`   ⚠️  Imagem média - Recomendações:`);
    console.log(`   • Converter para WebP`);
    console.log(`   • Reduzir qualidade para 85-90%`);
  } else {
    console.log(`   ✅ Tamanho adequado`);
  }
  
  console.log('');
}

// Função principal
function main() {
  const publicDir = path.join(__dirname, 'public');
  
  if (!fs.existsSync(publicDir)) {
    console.error('❌ Diretório public não encontrado!');
    process.exit(1);
  }
  
  console.log('🔍 Procurando imagens PNG...\n');
  
  const pngFiles = findPNGFiles(publicDir);
  
  if (pngFiles.length === 0) {
    console.log('📭 Nenhuma imagem PNG encontrada.');
    return;
  }
  
  console.log(`📊 Encontradas ${pngFiles.length} imagens PNG:\n`);
  
  let totalSize = 0;
  let largeImages = 0;
  
  for (const file of pngFiles) {
    const size = parseFloat(getFileSizeMB(file));
    totalSize += size;
    
    if (size > 1.0) {
      largeImages++;
    }
    
    optimizeImage(file);
  }
  
  console.log('📈 RESUMO:');
  console.log(`   Total de imagens: ${pngFiles.length}`);
  console.log(`   Tamanho total: ${totalSize.toFixed(2)} MB`);
  console.log(`   Imagens grandes (>1MB): ${largeImages}`);
  console.log(`   Tamanho médio: ${(totalSize / pngFiles.length).toFixed(2)} MB`);
  
  if (largeImages > 0) {
    console.log('\n🚨 AÇÕES RECOMENDADAS:');
    console.log('   1. Instalar ferramentas de otimização:');
    console.log('      npm install --save-dev imagemin imagemin-pngquant imagemin-webp');
    console.log('   2. Converter imagens grandes para WebP');
    console.log('   3. Reduzir qualidade das imagens');
    console.log('   4. Considerar lazy loading para imagens grandes');
  }
  
  console.log('\n💡 DICAS DE OTIMIZAÇÃO:');
  console.log('   • WebP: 70% menor que PNG');
  console.log('   • JPEG: Melhor para fotos');
  console.log('   • PNG: Melhor para gráficos com transparência');
  console.log('   • SVG: Melhor para ícones e logos');
  console.log('   • Lazy loading: Carregar imagens sob demanda');
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { findPNGFiles, optimizeImage, getFileSizeMB };
