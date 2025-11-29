# 🔄 Automação de Versão do PWA

**Status**: ✅ **Implementado e Funcionando**

---

## 🎯 Objetivo

Automatizar a atualização de versão do PWA em todos os arquivos necessários para garantir que o Service Worker e cache sejam atualizados corretamente.

---

## 📋 Arquivos Atualizados Automaticamente

1. **`package.json`** - Versão do projeto
2. **`src/manifest.webmanifest`** - Versão do manifest
3. **`src/sw.js`** - Versão do cache do Service Worker
4. **`src/index.html`** - Query strings `?v=` em todos os assets

---

## 🚀 Como Usar

### **1. Sincronizar Versões (sem incrementar)**

Sincroniza todas as versões para a versão atual do `package.json`:

```bash
npm run version:sync
# ou
node scripts/update-version.js
```

### **2. Incrementar Versão Automaticamente**

#### **Patch (1.4.6 → 1.4.7)**
```bash
npm run version:patch
# ou
node scripts/update-version.js increment patch
```

#### **Minor (1.4.6 → 1.5.0)**

```bash
npm run version:minor
# ou
node scripts/update-version.js increment minor
```

#### **Major (1.4.6 → 2.0.0)**

```bash
npm run version:major
# ou
node scripts/update-version.js increment major
```

### **3. Definir Versão Específica**

```bash
npm run version:set 1.5.0
# ou
node scripts/update-version.js set 1.5.0
```

---

## 🔄 Integração no Build

O script é executado **automaticamente** no `make build`:

```bash
make build
```

Isso garante que todas as versões estejam sincronizadas antes de cada build.

---

## 📝 O Que É Atualizado

### **package.json**
```json
{
  "version": "1.4.7"
}
```

### **manifest.webmanifest**
```json
{
  "version": "1.4.7"
}
```

### **sw.js**
```javascript
const CACHE = 'neo-flowoff-v1.4.7-clean';
```

### **index.html**
```html
<link rel="stylesheet" href="styles.css?v=1.4.7">
<link rel="stylesheet" href="/css/neo-protocol-ui.css?v=1.4.7">
<script src="app.js?v=1.4.7"></script>
<script src="neo-protocol-init.js?v=1.4.7"></script>
<script src="neo-protocol-ui.js?v=1.4.7"></script>
<script src="p5-background.js?v=1.4.7"></script>
<script src="invertexto-simple.js?v=1.4.7"></script>
<script src="webp-support.js?v=1.4.7"></script>
```

---

## 🎯 Fluxo Recomendado

### **Para Cada Deploy**

```bash
# 1. Incrementar versão (patch para mudanças pequenas)
npm run version:patch

# 2. Build (sincroniza automaticamente se necessário)
make build

# 3. Commit
git add -A
git commit -m "chore: bump version to 1.4.7"

# 4. Push e Deploy
git push
```

### **Para Mudanças Significativas**

```bash
# Incrementar minor ou major
npm run version:minor
# ou
npm run version:major

make build
git add -A
git commit -m "chore: bump version to 1.5.0"
git push
```

---

## ✅ Verificações

Após executar o script, verifique:

- [ ] `package.json` tem a versão correta
- [ ] `manifest.webmanifest` tem a versão correta
- [ ] `sw.js` tem o CACHE atualizado
- [ ] `index.html` tem todos os `?v=` atualizados
- [ ] Build funciona corretamente
- [ ] Service Worker registra nova versão

---

## 🐛 Troubleshooting

### **Erro: "Versão inválida"**

Certifique-se de usar formato semver: `MAJOR.MINOR.PATCH`

Exemplos válidos:
- ✅ `1.4.7`
- ✅ `2.0.0`
- ✅ `1.5.12`

Exemplos inválidos:
- ❌ `1.4` (falta patch)
- ❌ `v1.4.7` (não use prefixo)
- ❌ `1.4.7-beta` (não suportado)

### **Versões não sincronizadas**

Execute manualmente:
```bash
npm run version:sync
```

---

## 📊 Histórico de Versões

| Versão | Data | Mudanças |
|--------|------|----------|
| 1.4.7 | 28/11/2025 | Automação de versão implementada |
| 1.4.6 | - | Versão anterior |

---

**Status**: ✅ **Automação Funcionando**  
**Última atualização**: 28 de Novembro de 2025

