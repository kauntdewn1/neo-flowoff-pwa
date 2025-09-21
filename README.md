# NEØ.FLOWOFF PWA

[![Netlify Status](https://api.netlify.com/api/v1/badges/720bef8f-9a14-4807-ae2f-b41fbdb6cd44/deploy-status)](https://app.netlify.com/projects/flowoff)

**🌐 Domínio Oficial:** [flowoff.xyz](https://flowoff.xyz)

## Agência de Marketing na blockchain

PWA desenvolvido com tecnologias modernas para apresentação da agência NEØ.FLOWOFF.

### Tecnologias

- **PWA**: Progressive Web App instalável
- **Vanilla JS**: JavaScript puro com router hashless
- **CSS**: Design system com glassmorphism
- **Service Worker**: Cache inteligente e offline support
- **Deploy**: Netlify com sistema anti-cache

### Funcionalidades

- ✅ Layout responsivo iOS-like
- ✅ Glassmorphism na header
- ✅ Cards interativos com logos 3D
- ✅ Sistema de navegação sem hash
- ✅ Cache busting para deploys instantâneos
- ✅ Footer com fonte pequena
- ✅ PWA instalável

### Estrutura

```text
├── index.html          # Página principal
├── styles.css          # Design system
├── app.js             # Router e funcionalidades
├── sw.js              # Service Worker
├── manifest.webmanifest # PWA manifest
└── public/            # Assets e logos
```

### Deploy

O projeto é automaticamente deployado no Netlify. O badge acima mostra o status atual do deploy.

### Cache Busting

Sistema implementado para evitar problemas de cache:

- Versão no manifest
- Query strings nos assets
- Service Worker otimizado
- Atualizações instantâneas

### Protocolo NΞØ

Este projeto segue o Protocolo NΞØ para desenvolvimento consistente e eficiente.
