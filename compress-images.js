#!/usr/bin/env node

// compress-images.js - Script para comprimir imagens automaticamente
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant').default;
const imageminWebp = require('imagemin-webp').default;
const fs = require('fs');
const path = require('path');

console.log('🗜️  Compressor de Imagens - NEO.FLOWOFF');
console.log('=====================================\n');

// Função para obter tamanho do arquivo em MB
function getFileSizeMB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
}

// Função para comprimir PNGs
async function compressPNGs() {
  console.log('📁 Comprimindo imagens PNG...\n');
  
  try {
    const files = await imagemin(['public/**/*.png'], {
      destination: 'public/compressed',
      plugins: [
        imageminPngquant({
          quality: [0.6, 0.8], // Qualidade entre 60% e 80%
          speed: 1, // Velocidade máxima
          strip: true // Remove metadados
        })
      ]
    });
    
    console.log(`✅ ${files.length} imagens PNG comprimidas`);
    
    // Mostrar economia de espaço
    for (const file of files) {
      const originalPath = file.sourcePath;
      const compressedPath = file.destinationPath;
      
      if (fs.existsSync(originalPath) && fs.existsSync(compressedPath)) {
        const originalSize = parseFloat(getFileSizeMB(originalPath));
        const compressedSize = parseFloat(getFileSizeMB(compressedPath));
        const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        
        console.log(`   ${path.basename(originalPath)}: ${originalSize}MB → ${compressedSize}MB (${savings}% economia)`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao comprimir PNGs:', error.message);
  }
}

// Função para converter para WebP
async function convertToWebP() {
  console.log('\n🌐 Convertendo para WebP...\n');
  
  try {
    const files = await imagemin(['public/**/*.png'], {
      destination: 'public/webp',
      plugins: [
        imageminWebp({
          quality: 80, // Qualidade 80%
          method: 6, // Método de compressão otimizado
          lossless: false // Permitir perda para melhor compressão
        })
      ]
    });
    
    console.log(`✅ ${files.length} imagens convertidas para WebP`);
    
    // Mostrar economia de espaço
    for (const file of files) {
      const originalPath = file.sourcePath;
      const webpPath = file.destinationPath;
      
      if (fs.existsSync(originalPath) && fs.existsSync(webpPath)) {
        const originalSize = parseFloat(getFileSizeMB(originalPath));
        const webpSize = parseFloat(getFileSizeMB(webpPath));
        const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
        
        console.log(`   ${path.basename(originalPath)}: ${originalSize}MB → ${webpSize}MB (${savings}% economia)`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao converter para WebP:', error.message);
  }
}

// Função para criar versões otimizadas das imagens principais
async function optimizeMainImages() {
  console.log('\n🎯 Otimizando imagens principais...\n');
  
  const mainImages = [
    'public/card.png',
    'public/icon-512.png',
    'public/flowoff logo.png',
    'public/poston.png',
    'public/logos/NEO_LAST.png',
    'public/logos/flowoff logo.png',
    'public/logos/geometrico.png',
    'public/logos/metalica.png',
    'public/logos/pink_metalic.png'
  ];
  
  for (const imagePath of mainImages) {
    if (fs.existsSync(imagePath)) {
      try {
        console.log(`📸 Otimizando: ${path.basename(imagePath)}`);
        
        // Comprimir PNG
        const compressedFiles = await imagemin([imagePath], {
          destination: 'public/optimized',
          plugins: [
            imageminPngquant({
              quality: [0.7, 0.85],
              speed: 1,
              strip: true
            })
          ]
        });
        
        // Converter para WebP
        const webpFiles = await imagemin([imagePath], {
          destination: 'public/optimized',
          plugins: [
            imageminWebp({
              quality: 85,
              method: 6
            })
          ]
        });
        
        if (compressedFiles.length > 0) {
          const originalSize = parseFloat(getFileSizeMB(imagePath));
          const compressedSize = parseFloat(getFileSizeMB(compressedFiles[0].destinationPath));
          const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
          console.log(`   PNG: ${originalSize}MB → ${compressedSize}MB (${savings}% economia)`);
        }
        
        if (webpFiles.length > 0) {
          const originalSize = parseFloat(getFileSizeMB(imagePath));
          const webpSize = parseFloat(getFileSizeMB(webpFiles[0].destinationPath));
          const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
          console.log(`   WebP: ${originalSize}MB → ${webpSize}MB (${savings}% economia)`);
        }
        
      } catch (error) {
        console.error(`   ❌ Erro ao otimizar ${path.basename(imagePath)}:`, error.message);
      }
    }
  }
}

// Função para criar diretórios necessários
function createDirectories() {
  const dirs = ['public/compressed', 'public/webp', 'public/optimized'];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Criado diretório: ${dir}`);
    }
  }
}

// Função principal
async function main() {
  try {
    // Criar diretórios
    createDirectories();
    
    // Otimizar imagens principais primeiro
    await optimizeMainImages();
    
    // Comprimir todas as PNGs
    await compressPNGs();
    
    // Converter para WebP
    await convertToWebP();
    
    console.log('\n🎉 Otimização concluída!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('   1. Verificar as imagens otimizadas em public/optimized/');
    console.log('   2. Substituir as imagens originais pelas otimizadas');
    console.log('   3. Atualizar referências no HTML para usar WebP');
    console.log('   4. Implementar fallback para navegadores sem suporte WebP');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { compressPNGs, convertToWebP, optimizeMainImages };
