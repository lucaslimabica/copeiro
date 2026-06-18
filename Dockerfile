FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ENV VITE_PUBLIC_SUPABASE_URL=$VITE_SUVITE_PUBLIC_SUPABASE_URLPABASE_URL
ENV VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Configuração para evitar erro 404 ao atualizar rotas do React Router
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html index.htm; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]