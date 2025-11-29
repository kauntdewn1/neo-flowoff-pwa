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
	@node scripts/code-analysis.js

build: ## Build da PWA (otimiza assets)
	@echo "🔨 Building PWA..."
	@# Sincronizar versões automaticamente
	@echo "🔄 Sincronizando versões..."
	@node scripts/update-version.js || true
	@# Valida estrutura mínima
	@test -f src/index.html || (echo "❌ src/index.html não encontrado" && exit 1)
	@test -f src/styles.css || (echo "❌ src/styles.css não encontrado" && exit 1)
	@test -f src/app.js || (echo "❌ src/app.js não encontrado" && exit 1)
	@test -f src/manifest.webmanifest || (echo "❌ src/manifest.webmanifest não encontrado" && exit 1)
	@test -f src/sw.js || (echo "❌ src/sw.js não encontrado" && exit 1)
	@# Cria diretório dist se não existir
	@mkdir -p dist
	@# Build CSS modularizado
	@./scripts/build-css.sh
	@# Copia arquivos principais
	@cp src/index.html dist/
	@cp css/main.css dist/styles.css
	@cp src/app.js dist/
	@cp src/manifest.webmanifest dist/
	@cp src/sw.js dist/
	@cp src/p5-background.js dist/
	@cp src/favicon.ico dist/
	@# Copia arquivos CSS e JS adicionais
	@cp src/glass-morphism-bottom-bar.css dist/ 2>/dev/null || true
	@cp src/glass-morphism-bottom-bar.js dist/ 2>/dev/null || true
	@cp src/invertexto-simple.js dist/ 2>/dev/null || true
	@cp src/webp-support.js dist/ 2>/dev/null || true
	@cp src/index-scripts.js dist/ 2>/dev/null || true
	@cp src/blog.html dist/ 2>/dev/null || true
	@cp src/blog-styles.css dist/ 2>/dev/null || true
	@cp src/blog.js dist/ 2>/dev/null || true
	@cp src/desktop.html dist/ 2>/dev/null || true
	@# Copia CSS e JS do Protocolo NΞØ
	@mkdir -p dist/css
	@cp src/css/neo-protocol-ui.css dist/css/ 2>/dev/null || true
	@cp src/neo-protocol-ui.js dist/ 2>/dev/null || true
	@cp src/neo-protocol-init.js dist/ 2>/dev/null || true
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
	@# Verificar e limpar processos antigos na porta padrão
	@if lsof -ti:3000 >/dev/null 2>&1; then \
		echo "⚠️ Porta 3000 ocupada. Limpando processos antigos..."; \
		lsof -ti:3000 | xargs kill -9 2>/dev/null || true; \
		sleep 1; \
	fi
	@command -v node >/dev/null 2>&1 && node server.js || \
	(command -v python3 >/dev/null 2>&1 && python3 -m http.server $(PORT)) || \
	(command -v python >/dev/null 2>&1 && python -m SimpleHTTPServer $(PORT)) || \
	(command -v npx >/dev/null 2>&1 && npx serve . -p $(PORT)) || \
	(echo "❌ Nenhum servidor HTTP encontrado. Instale node, python ou npx" && exit 1)

dev-alt: ## Servidor em porta alternativa (ex: make dev-alt PORT=3001)
	@if [ -z "$(PORT)" ]; then \
		echo "❌ Especifique a porta: make dev-alt PORT=3001"; \
		exit 1; \
	fi
	@# Verificar e limpar processos na porta especificada
	@if lsof -ti:$(PORT) >/dev/null 2>&1; then \
		echo "⚠️ Porta $(PORT) ocupada. Limpando processos antigos..."; \
		lsof -ti:$(PORT) | xargs kill -9 2>/dev/null || true; \
		sleep 1; \
	fi
	@echo "🚀 Iniciando servidor Node.js na porta $(PORT)..."
	@command -v node >/dev/null 2>&1 && PORT=$(PORT) node server.js || \
	(echo "❌ Node.js não encontrado" && exit 1)

dev-auto: ## Encontra porta livre automaticamente e inicia servidor
	@echo "🔍 Procurando porta livre..."
	@PORT=3000; \
	for i in 3000 3001 3002 3003 3004 3005; do \
		if ! lsof -ti:$$i >/dev/null 2>&1; then \
			PORT=$$i; \
			break; \
		fi; \
	done; \
	echo "✅ Usando porta $$PORT"; \
	PORT=$$PORT node server.js

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

clean-ports: ## Limpa processos Node.js nas portas 3000-3005
	@echo "🧹 Limpando processos nas portas 3000-3005..."
	@for port in 3000 3001 3002 3003 3004 3005; do \
		if lsof -ti:$$port >/dev/null 2>&1; then \
			echo "  🗑️ Limpando porta $$port..."; \
			lsof -ti:$$port | xargs kill -9 2>/dev/null || true; \
		fi; \
	done
	@echo "✅ Portas limpas!"

install: ## Instala dependências (Netlify CLI)
	@echo "📦 Instalando dependências..."
	@command -v netlify >/dev/null 2>&1 || npm install -g netlify-cli
	@echo "✅ Dependências instaladas!"

# Comandos de validação
validate: ## Valida estrutura da PWA
	@echo "🔍 Validando estrutura PWA..."
	@echo "  ✓ src/index.html: $(shell test -f src/index.html && echo 'OK' || echo 'FALTANDO')"
	@echo "  ✓ src/styles.css: $(shell test -f src/styles.css && echo 'OK' || echo 'FALTANDO')"
	@echo "  ✓ src/app.js: $(shell test -f src/app.js && echo 'OK' || echo 'FALTANDO')"
	@echo "  ✓ src/manifest.webmanifest: $(shell test -f src/manifest.webmanifest && echo 'OK' || echo 'FALTANDO')"
	@echo "  ✓ src/sw.js: $(shell test -f src/sw.js && echo 'OK' || echo 'FALTANDO')"
	@echo "  ✓ public/: $(shell test -d public && echo 'OK' || echo 'FALTANDO')"
	@echo "✅ Validação concluída!"

# Comando padrão
.DEFAULT_GOAL := help
