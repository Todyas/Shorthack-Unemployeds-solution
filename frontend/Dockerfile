FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Пустая строка = относительные пути (/api/..., /health) — их проксирует nginx
# на backend внутри compose-сети, поэтому фронтенд открывается на http://localhost
# без отдельного порта для бэкенда.
ENV VITE_API_BASE_URL=""
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
