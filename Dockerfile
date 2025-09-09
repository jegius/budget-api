# Этап сборки
FROM node:22 AS builder
WORKDIR /usr/src/app
# Отключаем SSL (если это действительно необходимо для вашего окружения)
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN npm config set strict-ssl false
# Устанавливаем системные зависимости для node-gyp
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*
# Копируем и устанавливаем зависимости
COPY package*.json ./
RUN npm ci
# Копируем весь исходный код
COPY . .
# Собираем приложение
RUN npm run build
# Проверяем, что сборка прошла успешно
RUN ls -la dist/ && test -f dist/main.js

# Финальный образ
FROM node:22 AS production
WORKDIR /usr/src/app
# Копируем необходимые файлы
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
# --- ВАЖНОЕ ИЗМЕНЕНИЕ: Копируем исходный код для работы Swagger ---
COPY --from=builder /usr/src/app/src ./src
# --- Конец изменения ---
COPY .env ./
# Экспонируем порт
EXPOSE 3000
# Запускаем приложение напрямую через node (рекомендуемый способ)
CMD ["node", "dist/main.js"]