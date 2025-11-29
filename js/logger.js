// Sistema de logging condicional para produção
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('localhost');

const Logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    // Erros sempre são logados, mas podem ser enviados para serviço de monitoramento
    console.error(...args);
    // TODO: Enviar para serviço de monitoramento de erros (Sentry, etc)
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  }
};

// Exportar para uso global
window.Logger = Logger;

