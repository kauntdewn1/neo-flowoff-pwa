// Registro do Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      
      // Verificar se há atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nova versão disponível - será notificado pelo sistema de atualização
          }
        });
      });
    } catch (error) {
      window.Logger?.error('Erro ao registrar Service Worker:', error);
    }
  });
}

// Router super simples (hashless) - Compatível com Glass Morphism Bottom Bar
const routes = ['home','projects','start','chat','ecosystem'];
const buttons = document.querySelectorAll('.glass-nav-item');
const sections = [...document.querySelectorAll('.route')];

function go(route){
  routes.forEach(r => {
    const element = document.getElementById(r);
    const isActive = r === route;
    element.classList.toggle('active', isActive);
  });
  buttons.forEach(b => b.classList.toggle('active', b.dataset.route===route));
  window.scrollTo({top:0, behavior:'smooth'});
}

// Tornar função go() disponível globalmente para testes
window.go = go;


buttons.forEach(b => b.addEventListener('click', () => go(b.dataset.route)));
go('home');

// Sheet modal
document.querySelectorAll('[data-open]').forEach(el=>{
  el.addEventListener('click', ()=> document.getElementById(el.dataset.open).showModal());
});

// Offline UI
function setOffline(flag){
  const el = document.getElementById('offline');
  if (el) {
    el.style.display = flag ? 'block' : 'none';
  }
  
  // Notificar validador de formulário sobre mudança de status
  if (window.FormValidator) {
    window.FormValidator.isOnline = !flag;
  }
}
window.addEventListener('online', ()=>{
  setOffline(false);
  // Processar fila quando voltar online
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      if ('sync' in registration) {
        registration.sync.register('form-submission').catch(() => {});
      }
    });
  }
});
window.addEventListener('offline', ()=>setOffline(true));
setOffline(!navigator.onLine);

// Escutar mensagens do Service Worker sobre sincronização
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'FORM_SYNC_SUCCESS') {
      // Notificar usuário sobre sincronização bem-sucedida
      const statusEl = document.getElementById('lead-status');
      if (statusEl) {
        statusEl.textContent = '✓ Formulário sincronizado com sucesso!';
        statusEl.style.color = '#4ade80';
        setTimeout(() => {
          if (statusEl.textContent.includes('sincronizado')) {
            statusEl.textContent = '';
          }
        }, 3000);
      }
    }
  });
}

// Formulário agora é gerenciado por js/form-validator.js
