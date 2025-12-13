# 🧹 Plano de Limpeza e Organização - NEØ.FLOWOFF PWA

**Data:** 2025-01-20  
**Status:** Em execução

---

## 📋 Arquivos Obsoletos para Remover

### ❌ Invertexto (removido do projeto)
- [x] `test-invertexto.js` - Teste obsoleto
- [x] `TESTE_INVERTEXTO_RESULTADO.md` - Documentação obsoleta
- [x] `README-INVERTEXTO.md` - Documentação obsoleta
- [x] `pages/api/invertexto.js` - API removida
- [ ] `js/invertexto-simple.js` - Verificar se ainda é usado

### ❌ Scripts não utilizados
- [ ] `app.js` (raiz) - Verificar se é duplicado de `js/app.js`
- [ ] `clear-sw-cache.js` - Verificar uso
- [ ] `extract-css-modules.sh` - Verificar se é necessário

### ❌ Documentação desorganizada
- [ ] Consolidar relatórios em `docs/reports/`
- [ ] Mover documentação técnica para `docs/`

---

## 📁 Estrutura Proposta

```
neo-flowoff-pwa/
├── docs/                    # Toda documentação
│   ├── DEPLOY_NEOFLOWOFF.md
│   ├── STATUS-RAPIDO.md
│   ├── IPFS-UPLOAD-GUIDE.md
│   └── reports/             # Relatórios
│       ├── optimization-report.md
│       └── IMAGE-OPTIMIZATION-REPORT.md
├── scripts/                 # Scripts úteis
│   ├── build.js
│   ├── ipns-publisher.js
│   └── test.js
├── js/                      # JavaScript do frontend
├── css/                     # CSS modularizado
├── public/                  # Assets públicos
├── netlify/                 # Netlify Functions
└── [arquivos raiz essenciais]
```

---

## 🔧 Ações a Executar

1. Remover arquivos obsoletos
2. Mover documentação para `docs/`
3. Limpar `package.json` (remover scripts obsoletos)
4. Atualizar `.gitignore`
5. Verificar dependências não usadas
