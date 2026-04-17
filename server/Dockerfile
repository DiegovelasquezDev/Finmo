# ---- Backend Dockerfile ----
FROM node:20-alpine AS base
WORKDIR /app

# Copia package.json y la carpeta prisma antes de instalar dependencias
COPY package*.json ./
COPY prisma ./prisma

RUN npm install --omit=dev

# Copia el resto del código
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
