# ---- Backend Dockerfile ----
FROM node:20-alpine AS base
WORKDIR /app

# Instala dependencias
COPY package*.json ./
RUN npm install --omit=dev

# Copia el resto del código
COPY . .

# Expone el puerto (usa variable de entorno)
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]
