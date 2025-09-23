#!/usr/bin/env node

// optimize-simple.js - Script simples para otimizar imagens
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🗜️  Otimizador Simples de Imagens - NEO.FLOWOFF');
console.log('==============================================\n');

// Função para obter tamanho do arquivo em MB
function getFileSizeMB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
}

// Função para listar arquivos PNG grandes
function findLargePNGs(dir, minSizeMB = 0.5) {
  const files = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (path.extname(item).toLowerCase() === '.png') {
        const sizeMB = parseFloat(getFileSizeMB(fullPath));
        if (sizeMB >= minSizeMB) {
          files.push({ path: fullPath, size: sizeMB });
        }
      }
    }
  }
  
  scanDirectory(dir);
  return files.sort((a, b) => b.size - a.size); // Ordenar por tamanho (maior primeiro)
}

// Função para criar backup
function createBackup(filePath) {
  const backupPath = filePath + '.backup';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
    console.log(`📁 Backup criado: ${path.basename(backupPath)}`);
  }
}

// Função para otimizar com ferramentas nativas (se disponíveis)
function optimizeWithNative(filePath) {
  try {
    // Tentar usar pngquant se estiver disponível
    execSync(`which pngquant`, { stdio: 'ignore' });
    
    const originalSize = parseFloat(getFileSizeMB(filePath));
    const tempPath = filePath + '.tmp';
    
    // Comprimir com pngquant
    execSync(`pngquant --quality=65-80 --output "${tempPath}" "${filePath}"`, { stdio: 'ignore' });
    
    // Substituir arquivo original
    fs.renameSync(tempPath, filePath);
    
    const newSize = parseFloat(getFileSizeMB(filePath));
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
    
    console.log(`✅ ${path.basename(filePath)}: ${originalSize}MB → ${newSize}MB (${savings}% economia)`);
    return true;
    
  } catch (error) {
    console.log(`⚠️  pngquant não disponível para ${path.basename(filePath)}`);
    return false;
  }
}

// Função para criar versões WebP (se cwebp estiver disponível)
function createWebP(filePath) {
  try {
    execSync(`which cwebp`, { stdio: 'ignore' });
    
    const webpPath = filePath.replace('.png', '.webp');
    const originalSize = parseFloat(getFileSizeMB(filePath));
    
    // Converter para WebP
    execSync(`cwebp -q 80 "${filePath}" -o "${webpPath}"`, { stdio: 'ignore' });
    
    if (fs.existsSync(webpPath)) {
      const webpSize = parseFloat(getFileSizeMB(webpPath));
      const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
      
      console.log(`🌐 WebP criado: ${path.basename(webpPath)}: ${originalSize}MB → ${webpSize}MB (${savings}% economia)`);
      return true;
    }
    
  } catch (error) {
    console.log(`⚠️  cwebp não disponível para ${path.basename(filePath)}`);
    return false;
  }
  
  return false;
}

// Função para criar relatório de otimização
function createOptimizationReport(largeFiles) {
  const reportPath = 'optimization-report.md';
  let report = '# Relatório de Otimização de Imagens\n\n';
  
  report += `**Data:** ${new Date().toLocaleDateString('pt-BR')}\n`;
  report += `**Total de imagens grandes:** ${largeFiles.length}\n\n`;
  
  report += '## Imagens que precisam de otimização:\n\n';
  
  largeFiles.forEach((file, index) => {
    report += `${index + 1}. **${path.basename(file.path)}** - ${file.size}MB\n`;
    report += `   - Localização: ${file.path}\n`;
    report += `   - Recomendação: Converter para WebP ou comprimir PNG\n\n`;
  });
  
  report += '## Ações Recomendadas:\n\n';
  report += '1. **Instalar ferramentas de otimização:**\n';
  report += '   ```bash\n';
  report += '   # macOS\n';
  report += '   brew install pngquant webp\n\n';
  report += '   # Ubuntu/Debian\n';
  report += '   sudo apt-get install pngquant webp\n';
  report += '   ```\n\n';
  
  report += '2. **Converter para WebP:**\n';
  report += '   - WebP oferece 70% de redução de tamanho\n';
  report += '   - Suporte nativo na maioria dos navegadores\n';
  report += '   - Fallback para PNG em navegadores antigos\n\n';
  
  report += '3. **Implementar lazy loading:**\n';
  report += '   - Carregar imagens apenas quando necessário\n';
  report += '   - Melhorar performance inicial da página\n\n';
  
  report += '4. **Usar imagens responsivas:**\n';
  report += '   - Diferentes tamanhos para diferentes dispositivos\n';
  report += '   - Reduzir dados móveis\n\n';
  
  fs.writeFileSync(reportPath, report);
  console.log(`📄 Relatório criado: ${reportPath}`);
}

// Função principal
function main() {
  const publicDir = path.join(__dirname, 'public');
  
  if (!fs.existsSync(publicDir)) {
    console.error('❌ Diretório public não encontrado!');
    process.exit(1);
  }
  
  console.log('🔍 Procurando imagens grandes (>0.5MB)...\n');
  
  const largeFiles = findLargePNGs(publicDir, 0.5);
  
  if (largeFiles.length === 0) {
    console.log('✅ Nenhuma imagem grande encontrada!');
    return;
  }
  
  console.log(`📊 Encontradas ${largeFiles.length} imagens grandes:\n`);
  
  let totalSize = 0;
  let optimizedCount = 0;
  let webpCount = 0;
  
  for (const file of largeFiles) {
    console.log(`📸 ${path.basename(file.path)} (${file.size}MB)`);
    totalSize += file.size;
    
    // Criar backup
    createBackup(file.path);
    
    // Tentar otimizar
    if (optimizeWithNative(file.path)) {
      optimizedCount++;
    }
    
    // Tentar criar WebP
    if (createWebP(file.path)) {
      webpCount++;
    }
    
    console.log('');
  }
  
  console.log('📈 RESUMO:');
  console.log(`   Total de imagens grandes: ${largeFiles.length}`);
  console.log(`   Tamanho total: ${totalSize.toFixed(2)} MB`);
  console.log(`   Imagens otimizadas: ${optimizedCount}`);
  console.log(`   Versões WebP criadas: ${webpCount}`);
  
  // Criar relatório
  createOptimizationReport(largeFiles);
  
  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('   1. Instalar ferramentas: brew install pngquant webp');
  console.log('   2. Executar novamente este script');
  console.log('   3. Atualizar HTML para usar WebP com fallback PNG');
  console.log('   4. Implementar lazy loading');
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { findLargePNGs, optimizeWithNative, createWebP };
