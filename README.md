# ⚡ NEØ.FLOWOFF — PWA Interface

<https://app.netlify.com/projects/flowoff>

**🌐 Acesse em produção:** [flowoff.xyz](https://flowoff.xyz)

> **A Nova Interface da Revolução Digital Descentralizada.**  
> Uma Progressive Web App projetada para performance, presença e posicionamento no universo blockchain.

---

## 🚀 Sobre o Projeto

**NEØ.FLOWOFF** é a vitrine viva da agência FlowOFF:  
uma **PWA minimalista, brutalmente rápida** e com design emocional, criada para representar uma agência de marketing que já opera no futuro.

Desenvolvida sem frameworks pesados. Sem dependências desnecessárias. Só **código direto ao ponto** — como toda marca com visão 2050 merece.

---

## 🧠 Stack Tecnológica

| Camada | Tecnologia | Finalidade |
|--------|------------|------------|
| 🖥️ UI | `Vanilla JS` + `CSS` | Router leve e design 100% custom |
| 🧊 Design | `Glassmorphism` | Estética emocional, camadas e profundidade |
| 🛜 Offline | `Service Worker` | Cache controlado + suporte offline |
| 📲 App | `Webmanifest` | Instalação como app nativo (PWA) |
| 🚀 Deploy | `Netlify` | Pipeline com cache busting e deploy instantâneo |

---

## ✨ Funcionalidades

- ✅ Navegação sem hash (#)  
- ✅ Header com **glassmorphism suave**  
- ✅ Cards animados com logos em 3D  
- ✅ Layout mobile-first, com vibe iOS  
- ✅ Cache busting real-time para novos deploys  
- ✅ App instalável com experiência nativa  
- ✅ Footer minimal com tipografia reduzida  

---

## 📁 Estrutura do Projeto

```text
.
├── index.html              # Entrada principal
├── styles.css              # Design System & UI
├── app.js                  # Router e scripts dinâmicos
├── sw.js                   # Service Worker customizado
├── manifest.webmanifest    # Configuração PWA
└── public/                 # Assets (imagens, ícones, logos)
````

---

## ⚙️ Deploy Automatizado

> Cada push no repositório dispara um novo build via Netlify com cache invalidado.

**Cache Busting Estratégico**:

* Versões explícitas no `manifest`
* Query strings forçadas nos assets
* Service Worker controlado por timestamp
* Deploy sem delay: o que você vê é o que já subiu

---

## 🧬 Protocolo NΞØ

Este projeto segue a arquitetura e os princípios do **Protocolo NΞØ™**:

* Desenvolvimento **sem gordura técnica**
* Design que **comunica sensações**, não só pixels
* Código que **não trava** e **não mente**

> Porque um site não é só um site. É o **primeiro contato com o seu ecossistema**.

---

## 🧠 Quer usar essa arquitetura na sua marca?

> A NEØ.FLOWOFF desenvolve interfaces ultra-velozes, tokenizáveis, prontas para o mundo on-chain.

Entre em contato direto pelo botão "Falar com MELLØ™" no site — ou nos invoque via protocolo.

---

## 🧾 Sobre o `package-lock.json`

`package-lock.json` é gerado automaticamente pelo npm e contém a árvore de dependências completa (versões resolvidas, `integrity`, sub-subdependências etc.). Esse nível de detalhe resulta em um arquivo extenso (~1.3k linhas), mas garante que todo mundo (local, CI, Netlify) instale exatamente o mesmo conjunto binário. Quebrar esse lockfile em pedaços ou editá-lo manualmente compromete a reprodutibilidade dos deploys, por isso mantemos ele inteiro mesmo sendo maior.

