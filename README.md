<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Logo-ITM-01.png/960px-Logo-ITM-01.png" alt="ITM Logo" width="280">
</p>

<h1 align="center">💰 Finmo</h1>

<p align="center">
  <strong>Sistema web inteligente para el monitoreo de comportamientos financieros y generación de alertas preventivas con IA.</strong>
</p>

<p align="center">
  Proyecto de grado — Ingeniería de Sistemas · Instituto Tecnológico Metropolitano (ITM)
</p>

<p align="center">
  Finmo es una plataforma web que combina registro financiero, análisis conductual y predicción automatizada de riesgos, permitiendo a los usuarios gestionar sus finanzas personales de forma consciente y prevenir crisis financieras mediante alertas inteligentes.
</p>

---

## 📋 Tabla de contenido

- [Problema](#-problema)
- [Objetivo](#-objetivo)
- [Funcionalidades](#-funcionalidades)
- [Arquitectura](#-arquitectura)
- [Tech Stack](#-tech-stack)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Requisitos previos](#-requisitos-previos)
- [Instalación y configuración](#-instalación-y-configuración)
- [Scripts disponibles](#-scripts-disponibles)
- [Variables de entorno](#-variables-de-entorno)
- [Base de datos](#-base-de-datos)
- [Equipo](#-equipo)
- [Licencia](#-licencia)

---

## 🔍 Problema

El manejo de las finanzas personales es un desafío tanto técnico como emocional. Estudios demuestran que:

- **43.5%** de las personas siente estrés al pensar en sus finanzas.
- **45%** considera que su situación económica afecta su estado de ánimo.
- **18.3%** evita revisar sus finanzas por incomodidad.

Las herramientas actuales no integran la dimensión emocional y conductual del manejo del dinero, ni ofrecen predicción inteligente o alertas preventivas personalizadas.

---

## 🎯 Objetivo

Desarrollar un sistema web inteligente que permita registrar variables financieras y generar **alertas preventivas automáticas** basadas en el análisis de patrones de comportamiento económico, orientadas a la prevención del riesgo financiero personal.

---

## ✨ Funcionalidades

| Módulo | Descripción |
|---|---|
| **Landing Page** | Presentación del producto, métricas y registro de usuarios |
| **Autenticación** | Registro, login, verificación de email, recuperación de contraseña |
| **Onboarding** | Perfil financiero en 4 pasos: datos personales, ingresos, gastos fijos y comportamiento |
| **Dashboard** | Métricas financieras, gastos mes a mes, gastos hormiga, visualización interactiva |
| **Transacciones** | Registro de ingresos y gastos por categoría, fecha, monto y recurrencia |
| **Presupuestos** | Límites de gasto por categoría con períodos semanales, mensuales o anuales |
| **Metas financieras** | Creación y seguimiento de objetivos de ahorro |
| **Alertas inteligentes** | Alertas automáticas: presupuesto excedido, gastos inusuales, patrones negativos, metas próximas |
| **Notificaciones** | Recordatorios programados vía email e in-app |
| **Análisis con IA** | Identificación de patrones de gasto y predicción de riesgos financieros |
| **Configuración** | Gestión de perfil, preferencias de tema, idioma (ES/EN) |

---

## 🏗 Arquitectura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Server    │────▶│    MySQL    │
│  React+Vite │     │  Express 5  │     │   Prisma    │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │   Redis     │
                    │  (BullMQ)   │
                    └─────────────┘
```

Monorepo con dos aplicaciones principales:

- **`client/`** — SPA con React 19, Vite 8 y TailwindCSS 4
- **`server/`** — API REST con Express 5, Prisma ORM y BullMQ

---

## 🛠 Tech Stack

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | UI Library |
| Vite | 8 | Build tool & dev server |
| TailwindCSS | 4 | Estilos utility-first |
| React Router | 7 | Enrutamiento SPA |
| ApexCharts | 5 | Gráficos y dashboards |
| i18next | 26 | Internacionalización (ES/EN) |
| Lucide React | — | Iconografía |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 22 | Runtime |
| Express | 5 | Framework HTTP |
| Prisma | 6 | ORM y migraciones |
| MySQL | — | Base de datos relacional |
| Redis + BullMQ | — | Colas de trabajo y caché |
| JWT | — | Autenticación stateless |
| Nodemailer | — | Envío de emails |
| Zod | — | Validación de schemas |
| Pino | — | Logging estructurado |
| Helmet + CORS + HPP | — | Seguridad HTTP |

### IA (planeado)
| Tecnología | Uso |
|---|---|
| Python + FastAPI | Microservicio de análisis |
| scikit-learn | Modelos de predicción |

---

## 📁 Estructura del proyecto

```
Finmo/
├── client/                   # Frontend React
│   ├── src/
│   │   ├── app/              # Layout y páginas principales (Dashboard, Transacciones, etc.)
│   │   ├── auth/             # Layout, páginas y componentes de autenticación
│   │   ├── landing/          # Landing page pública
│   │   ├── onboarding/       # Flujo de onboarding en 4 pasos
│   │   ├── config/           # Configuración de tema
│   │   ├── i18n/             # Internacionalización (en.json, es.json)
│   │   ├── router/           # Rutas y guards de navegación
│   │   └── shared/           # Componentes, contextos, hooks y utilidades compartidas
│   └── public/
│
├── server/                   # Backend Node.js
│   ├── prisma/
│   │   ├── schema.prisma     # Modelo de datos
│   │   ├── seed.js           # Datos iniciales
│   │   └── migrations/       # Migraciones SQL
│   └── src/
│       ├── configs/          # Configuraciones (CORS, env, logger, mailer, rate-limit)
│       ├── features/         # Módulos por dominio
│       │   ├── auth/         # Autenticación (controller, routes, schemas, service)
│       │   ├── transactions/ # Gestión de transacciones
│       │   ├── categories/   # Categorías de ingresos/gastos
│       │   ├── goals/        # Metas financieras
│       │   ├── alerts/       # Sistema de alertas
│       │   ├── dashboard/    # Métricas y resúmenes
│       │   ├── onboarding/   # Perfil financiero inicial
│       │   └── users/        # Gestión de usuarios
│       ├── middlewares/      # Auth, validación, error handler
│       └── shared/           # Errores y helpers comunes
│
└── doc/                      # Documentación del proyecto
```

---

## 📦 Requisitos previos

- **Node.js** >= 22 (recomendado con [Volta](https://volta.sh/))
- **MySQL** 8+
- **Redis** 7+
- **npm** o gestor de paquetes compatible

---

## 🚀 Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/Finmo.git
cd Finmo
```

### 2. Instalar dependencias

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configurar variables de entorno

Crear archivos `.env.development` en `server/` y `.env` en `client/` (ver sección [Variables de entorno](#-variables-de-entorno)).

### 4. Ejecutar migraciones y seed

```bash
cd server
npm run migrate
npm run seed
```

### 5. Iniciar en desarrollo

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

---

## 📜 Scripts disponibles

### Server

| Script | Comando | Descripción |
|---|---|---|
| `dev` | `npm run dev` | Inicia el servidor con nodemon y variables de desarrollo |
| `start` | `npm start` | Genera Prisma, migra y arranca en producción |
| `migrate` | `npm run migrate` | Ejecuta migraciones con Prisma |
| `seed` | `npm run seed` | Pobla la base de datos con datos iniciales |
| `test` | `npm test` | Ejecuta tests con Vitest |
| `db:studio` | `npm run db:studio` | Abre Prisma Studio para inspección visual de la BD |
| `lint` | `npm run lint` | Ejecuta ESLint |

### Client

| Script | Comando | Descripción |
|---|---|---|
| `dev` | `npm run dev` | Inicia Vite dev server |
| `build` | `npm run build` | Genera build de producción |
| `preview` | `npm run preview` | Previsualiza el build |
| `start` | `npm start` | Sirve el build estático |
| `lint` | `npm run lint` | Ejecuta ESLint |

---

## 🔐 Variables de entorno

### `server/.env.development`

```env
# Base de datos
DATABASE_URL="mysql://user:password@localhost:3306/finmo"

# JWT
JWT_SECRET="tu-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# Email
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="user@example.com"
SMTP_PASS="password"
MAIL_FROM="Finmo <noreply@finmo.app>"

# App
PORT=3001
NODE_ENV="development"
CLIENT_URL="http://localhost:5173"
```

### `client/.env`

```env
VITE_API_URL="http://localhost:3001/api"
```

> ⚠️ **Nunca** subas archivos `.env` al repositorio. Están incluidos en `.gitignore`.

---

## 🗃 Base de datos

El esquema de Prisma define los siguientes modelos principales:

| Modelo | Descripción |
|---|---|
| `User` | Usuarios con perfil, verificación y onboarding progresivo |
| `UserProfile` | Perfil financiero detallado (ingresos, gastos fijos, comportamiento, features para IA) |
| `Category` | Categorías de transacciones (globales y personalizadas) |
| `Transaction` | Ingresos y gastos con soporte de recurrencia |
| `Budget` | Presupuestos por categoría y período |
| `Goal` | Metas financieras con seguimiento de progreso |
| `Alert` | Alertas inteligentes (presupuesto excedido, gasto inusual, patrón negativo, etc.) |
| `Notification` | Notificaciones programadas vía email e in-app |
| `Token` | Tokens de verificación, reset de password y refresh |

Para explorar la base de datos visualmente:

```bash
cd server
npm run db:studio
```

---

## 👥 Equipo

| Nombre | Rol | Correo |
|---|---|---|
| Diego Alejandro Velásquez Araque | Desarrollador | diegovelasquez256279@correo.itm.edu.co |
| Jhony Andrés Mira Gaviria | Desarrollador | jhonymira90340@correo.itm.edu.co |
| Estefanía Valencia Zapata | Desarrolladora | estefaniavalencia245066@correo.itm.edu.co |

**Asesor:** Jaime Andrés Gutiérrez Monsalve — ITM

**Programa:** Ingeniería de Sistemas — Instituto Tecnológico Metropolitano (ITM)

---

## 📄 Licencia

Proyecto académico de grado. Todos los derechos reservados.
