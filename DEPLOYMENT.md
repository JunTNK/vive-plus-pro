# 🏥 Vive Plus Pro

**Sistema de Evaluación Funcional ECOSAFE PIVE 2020 para Adultos Mayores**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat)](https://web.dev/progressive-web-apps/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker)](https://www.docker.com/)

## 📱 Características

- ✅ **Evaluación Funcional ECOSAFE PIVE 2020** - 7 pruebas físicas completas
- ✅ **Gestión de Participantes** - Registro completo de adultos mayores
- ✅ **20 Condiciones Geriátricas** - Categorización especializada
- ✅ **26 Programas Terapéuticos** - Basados en evidencia científica
- ✅ **Citas con WhatsApp** - Recordatorios automáticos
- ✅ **PWA Instalable** - Funciona offline en cualquier dispositivo
- ✅ **Multiplataforma** - Docker, Vercel, Netlify, Railway, Heroku
- ✅ **Asistente IA** - Análisis integral y generación de informes

## 🚀 Deployment Rápido

### Docker (Recomendado)

```bash
# Construir y ejecutar
docker-compose up -d

# La app estará disponible en http://localhost:3000
```

### Vercel

```bash
# Instalar CLI
npm i -g vercel

# Desplegar
vercel --prod
```

### Netlify

```bash
# Instalar CLI
npm i -g netlify-cli

# Construir y desplegar
bun run build
netlify deploy --prod
```

### Railway

```bash
# Instalar CLI
npm i -g @railway/cli

# Desplegar
railway up
```

## 🛠️ Instalación Local

### Requisitos

- Node.js 22+ o Bun
- SQLite (incluido)

### Pasos

```bash
# Clonar repositorio
git clone <repo-url>
cd vive-plus-pro

# Instalar dependencias
bun install

# Configurar base de datos
bun run db:push

# Cargar programas especializados
bun run db:seed

# Iniciar desarrollo
bun run dev
```

## 📋 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Servidor de desarrollo |
| `bun run build` | Construir para producción |
| `bun run start` | Iniciar servidor producción |
| `bun run lint` | Verificar código |
| `bun run db:push` | Sincronizar base de datos |
| `bun run db:studio` | Abrir Prisma Studio |
| `bun run docker:up` | Iniciar con Docker |
| `bun run docker:down` | Detener Docker |

## 🎨 Colores del Tema

| Color | Hex | Uso |
|-------|-----|-----|
| Primary | `#00C6D7` | Turquesa principal |
| Secondary | `#92D700` | Verde lima |
| Background | `#F1F5F7` | Fondo claro |

## 📁 Estructura del Proyecto

```
vive-plus-pro/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Componente principal
│   │   ├── layout.tsx        # Layout con PWA
│   │   ├── globals.css       # Estilos globales
│   │   └── api/              # API Routes
│   └── components/
│       ├── ui/               # shadcn/ui components
│       └── asistente/        # Asistente IA
├── prisma/
│   └── schema.prisma         # Esquema de BD
├── public/
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service Worker
│   └── icons/                # Iconos PWA
├── Dockerfile                # Docker multi-stage
├── docker-compose.yml        # Orquestación
├── vercel.json               # Config Vercel
├── netlify.toml              # Config Netlify
└── railway.toml              # Config Railway
```

## 🔐 Variables de Entorno

```env
# Base de datos
DATABASE_URL=file:/app/db/custom.db

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_API_KEY=tu-api-key

# NextAuth
NEXTAUTH_SECRET=vive-plus-pro-secret-key-2024
NEXTAUTH_URL=https://tu-dominio.com
```

## 📱 PWA

La aplicación es una **Progressive Web App** que se puede instalar en:

- 📱 Android (Chrome, Firefox)
- 🍎 iOS (Safari)
- 💻 Windows (Chrome, Edge)
- 🍎 macOS (Chrome, Safari)
- 🐧 Linux (Chrome, Firefox)

### Instalación

1. Abrir la app en el navegador
2. Buscar el botón "Instalar" en la barra de direcciones
3. Confirmar instalación

## 🐳 Docker

### Construcción manual

```bash
# Construir imagen
docker build -t vive-plus-pro:latest .

# Ejecutar contenedor
docker run -p 3000:3000 -v vive-db:/app/db vive-plus-pro:latest
```

### Con docker-compose

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## 🏥 Metodología ECOSAFE PIVE 2020

### 7 Pruebas de Evaluación Funcional

1. **Equilibrio Estático** - Test de pierna única
2. **Levantarse y Sentarse** - 30 segundos
3. **Flexión de Tronco** - Movilidad columna
4. **Flexiones de Brazo** - Fuerza superior
5. **Juntar Manos Espalda** - Flexibilidad hombros
6. **Levantarse y Caminar** - Agilidad funcional
7. **Marcha 2 Minutos** - Resistencia

### Índice de Barthel
Evaluación de independencia en actividades de la vida diaria.

### Mini-Mental
Evaluación del estado cognitivo.

## 📞 Soporte

Para soporte técnico o consultas:
- 📧 Email: soporte@vivepluspro.com
- 📚 Documentación: [docs.vivepluspro.com]

## 📄 Licencia

MIT License - Vive Plus Pro © 2024

---

**Hecho con ❤️ para adultos mayores de Puerto Rico**
