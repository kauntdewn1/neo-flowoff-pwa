# Dockerfile para NEØ.FLOWOFF PWA
FROM nginx:alpine

# Copia os arquivos do projeto
COPY . /usr/share/nginx/html/

# Configuração do Nginx para SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Headers para PWA \
    add_header Cache-Control "no-cache, no-store, must-revalidate" always; \
    add_header Pragma "no-cache" always; \
    add_header Expires "0" always; \
    \
    # Headers para Service Worker \
    location /sw.js { \
        add_header Cache-Control "no-cache, no-store, must-revalidate" always; \
        add_header Pragma "no-cache" always; \
        add_header Expires "0" always; \
    } \
    \
    # Headers para CSS e JS \
    location ~* \.(css|js)$ { \
        add_header Cache-Control "no-cache, no-store, must-revalidate" always; \
        add_header Pragma "no-cache" always; \
        add_header Expires "0" always; \
    } \
    \
    # Fallback para SPA \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
