// Registro do SW
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}

// Router super simples (hashless)
const routes = ['home','projects','start','ecosystem'];
const buttons = document.querySelectorAll('.tabbar button');
const sections = [...document.querySelectorAll('.route')];

function go(route){
  routes.forEach(r => document.getElementById(r).classList.toggle('active', r===route));
  buttons.forEach(b => b.classList.toggle('active', b.dataset.route===route));
  // atualiza título grande
  const large = document.querySelector('.large-title');
  large.textContent = route === 'home' ? 'NEØ.FLOWOFF' :
    route === 'projects' ? 'Projetos' :
    route === 'start' ? 'Iniciar' : 'Ecossistema';
  window.scrollTo({top:0, behavior:'smooth'});
}

buttons.forEach(b => b.addEventListener('click', () => go(b.dataset.route)));
go('home');

// Sheet modal
document.querySelectorAll('[data-open]').forEach(el=>{
  el.addEventListener('click', ()=> document.getElementById(el.dataset.open).showModal());
});

// Offline UI
function setOffline(flag){
  const el = document.getElementById('offline');
  el.style.display = flag ? 'block' : 'none';
}
window.addEventListener('online', ()=>setOffline(false));
window.addEventListener('offline', ()=>setOffline(true));
setOffline(!navigator.onLine);

// Lead form (mock; substitua pelo seu endpoint)
const leadForm = document.getElementById('lead-form');
if (leadForm){
  leadForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(leadForm));
    const status = document.getElementById('lead-status');
    status.textContent = 'Enviando...';
    try{
      // fetch('https://seu-endpoint/lead', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)})
      await new Promise(r=>setTimeout(r,800)); // demo
      status.textContent = 'Recebido. Te chamo no Whats.';
      leadForm.reset();
      navigator.vibrate?.(10);
    }catch(err){
      status.textContent = 'Falha ao enviar. Tente novamente.';
    }
  });
}
