#!/bin/bash

# Script para extrair seções do styles.css para módulos

echo "🔨 Extraindo seções do styles.css..."

# Criar diretório se não existir
mkdir -p css/modules

# Extrair seção hero (linhas 125-255 aproximadamente)
sed -n '125,255p' styles.css > css/modules/hero.css

# Extrair seção cards (linhas 256-764 aproximadamente)  
sed -n '256,764p' styles.css > css/modules/cards.css

# Extrair seção modais (linhas 765-1106 aproximadamente)
sed -n '765,1106p' styles.css > css/modules/modals.css

# Extrair seção PWA banner (linhas 1107-1157 aproximadamente)
sed -n '1107,1157p' styles.css > css/modules/pwa-banner.css

# Extrair seção glass morphism (linhas 1158-1589 aproximadamente)
sed -n '1158,1589p' styles.css > css/modules/glass-morphism.css

# Extrair seção blog (linhas 1590-1816 aproximadamente)
sed -n '1590,1816p' styles.css > css/modules/blog.css

# Extrair seção responsiva (linhas 1817-2305 aproximadamente)
sed -n '1817,2305p' styles.css > css/modules/responsive.css

echo "✅ Módulos CSS criados!"
