# NEØ.FLOWOFF PWA - Makefile
# Node validado do Protocolo NΞØ

.PHONY: help build deploy dev clean install

# Variáveis
SITE_NAME = neo-flowoff-pwa
NETLIFY_SITE_ID = $(shell netlify sites:list --json | jq -r '.[] | select(.name=="$(SITE_NAME)") | .site_id')

# Comandos principais
help: ## Mostra comandos disponíveis
	@echo "⚡ NEØ.FLOWOFF PWA - Comandos disponíveis:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

analyze: ## Executa análise de código PWA
	@echo "🔍 Executando análise de código PWA..."
	@node code-analysis.js

build: ## Build da PWA (otimiza assets)
	@echo "🔨 Building PWA..."
	@# Valida estrutura mínima
	@test -f index.html || (echo "❌ index.html não encontrado" && exit 1)
	@test -f styles.css || (echo "❌ styles.css não encontrado" && exit 1)
	@test -f app.js || (echo "❌ app.js não encontrado" && exit 1)
	@test -f manifest.webmanifest || (echo "❌ manifest.webmanifest não encontrado" && exit 1)
	@test -f sw.js || (echo "❌ sw.js não encontrado" && exit 1)
	@# Cria diretório dist se não existir
	@mkdir -p dist
	@# Copia arquivos principais
	@cp index.html dist/
	@cp styles.css dist/
	@cp app.js dist/
	@cp manifest.webmanifest dist/
	@cp sw.js dist/
	@cp p5-background.js dist/
	@# Copia arquivos CSS e JS adicionais
	@cp glass-morphism-bottom-bar.css dist/ 2>/dev/null || true
	@cp glass-morphism-bottom-bar.js dist/ 2>/dev/null || true
	@cp invertexto-simple.js dist/ 2>/dev/null || true
	@cp webp-support.js dist/ 2>/dev/null || true
	@cp test-glass-morphism.js dist/ 2>/dev/null || true
	@cp test-update-system.js dist/ 2>/dev/null || true
	@cp blog.html dist/ 2>/dev/null || true
	@cp blog-styles.css dist/ 2>/dev/null || true
	@cp blog.js dist/ 2>/dev/null || true
	@cp desktop.html dist/ 2>/dev/null || true
	@# Copia diretório public
	@cp -r public dist/
	@# Otimiza HTML (remove comentários e espaços desnecessários)
	@sed 's/<!--.*-->//g; s/^[[:space:]]*//g; s/[[:space:]]*$$//g' dist/index.html > dist/index.tmp && mv dist/index.tmp dist/index.html
	@echo "✅ Build concluído em ./dist/"

deploy: build ## Deploy para Netlify
	@echo "🚀 Deploying para Netlify..."
	@# Verifica se netlify CLI está instalado
	@command -v netlify >/dev/null 2>&1 || (echo "❌ Netlify CLI não encontrado. Instale com: npm i -g netlify-cli" && exit 1)
	@# Deploy
	@netlify deploy --prod --dir=dist --site=$(SITE_NAME)
	@echo "✅ Deploy concluído!"

deploy-preview: build ## Deploy preview para Netlify
	@echo "👀 Deploying preview..."
	@netlify deploy --dir=dist --site=$(SITE_NAME)
	@echo "✅ Preview deploy concluído!"

dev: ## Servidor local para desenvolvimento (recomendado)
	@echo "🚀 Iniciando servidor Node.js..."
	@command -v node >/dev/null 2>&1 && node server.js || \
	(command -v python3 >/dev/null 2>&1 && python3 -m http.server $(PORT)) || \
	(command -v python >/dev/null 2>&1 && python -m SimpleHTTPServer $(PORT)) || \
	(command -v npx >/dev/null 2>&1 && npx serve . -p $(PORT)) || \
	(echo "❌ Nenhum servidor HTTP encontrado. Instale node, python ou npx" && exit 1)

dev-alt: ## Servidor em porta alternativa (ex: make dev-alt PORT=3001)
	@echo "🚀 Iniciando servidor Node.js na porta $(PORT)..."
	@command -v node >/dev/null 2>&1 && PORT=$(PORT) node server.js || \
	(echo "❌ Node.js não encontrado" && exit 1)

dev-python: ## Servidor Python (alternativo)
	@echo "🐍 Iniciando servidor Python..."
	@command -v python3 >/dev/null 2>&1 && python3 -m http.server 3000 || \
	command -v python >/dev/null 2>&1 && python -m SimpleHTTPServer 3000 || \
	(echo "❌ Python não encontrado" && exit 1)

docker: ## Servidor Docker (recomendado)
	@echo "🐳 Iniciando servidor Docker..."
	@command -v docker >/dev/null 2>&1 || (echo "❌ Docker não encontrado. Instale o Docker" && exit 1)
	@docker-compose up --build

docker-stop: ## Para o servidor Docker
	@echo "🛑 Parando servidor Docker..."
	@docker-compose down

docker-clean: ## Limpa containers e imagens Docker
	@echo "🧹 Limpando Docker..."
	@docker-compose down --rmi all --volumes --remove-orphans

clean: ## Limpa arquivos de build
	@echo "🧹 Limpando build..."
	@rm -rf dist/
	@echo "✅ Limpeza concluída!"

install: ## Instala dependências (Netlify CLI)
	@echo "📦 Instalando dependências..."
	@command -v netlify >/dev/null 2>&1 || npm install -g netlify-cli
	@echo "✅ Dependências instaladas!"

# Comandos de validação
validate: ## Valida estrutura da PWA
	@echo "🔍 Validando estrutura PWA..."
	@echo "  ✓ index.html: $(shell test -f index.html && echo 'OK' || echo 'FALTANDO')"
	@echo "  ✓ styles.css: $(shell test -f styles.css && echo 'OK' || echo 'FALTANDO')"
	@echo "  ✓ app.js: $(shell test -f app.js && echo 'OK' || echo 'FALTANDO')"
	@echo "  ✓ manifest.webmanifest: $(shell test -f manifest.webmanifest && echo 'OK' || echo 'FALTANDO')"
	@echo "  ✓ sw.js: $(shell test -f sw.js && echo 'OK' || echo 'FALTANDO')"
	@echo "  ✓ public/: $(shell test -d public && echo 'OK' || echo 'FALTANDO')"
	@echo "✅ Validação concluída!"

# Comando padrão
.DEFAULT_GOAL := help
