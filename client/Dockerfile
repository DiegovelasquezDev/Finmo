# ---- Frontend Dockerfile ----
FROM node:20-alpine AS builder
WORKDIR /app

# Recibe VITE_API_URL como build arg (Railway lo pasa automáticamente)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Instala dependencias y build
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- Static server ----
FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "dist", "-s", "-l", "3000"]
