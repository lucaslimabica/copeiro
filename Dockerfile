# Estágio 1: Build da aplicação
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Recebe os argumentos do yml
ARG VITE_PUBLIC_SUPABASE_URL
ARG VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY

# Transforma em variáveis de ambiente de build
ENV VITE_PUBLIC_SUPABASE_URL=$VITE_PUBLIC_SUPABASE_URL
ENV VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY

# TRAVA DE SEGURANÇA: Se estiver vazio, o build para aqui com erro!
RUN if [ -z "$VITE_PUBLIC_SUPABASE_URL" ] || [ -z "$VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY" ]; then \
      echo "ERRO CRÍTICO: As chaves do Supabase vieram vazias para o Docker! Verifique o .env"; \
      exit 1; \
    fi

RUN npm run build

# Estágio 2: Servidor de Produção
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html index.htm; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]