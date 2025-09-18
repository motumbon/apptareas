# App Tareas - Aplicación Completa de Gestión de Tareas

Una aplicación completa de gestión de tareas con:
- **Backend API**: Node.js + Express + Prisma + SQLite/PostgreSQL
- **Aplicación Web**: React + Vite (accesible desde cualquier navegador)
- **Aplicación Móvil**: React Native + Expo (genera APK para Android)

## 🚀 Características

### Funcionalidades Principales
- ✅ **Autenticación completa**: Registro e inicio de sesión
- ✅ **Gestión de tareas**: Crear, editar, completar y visualizar tareas
- ✅ **Interfaz dual**: Tareas pendientes y completadas separadas
- ✅ **Sincronización**: Los datos se comparten entre web y móvil
- ✅ **UI moderna**: Diseño responsive y atractivo

### Flujo de Usuario
1. **Registro/Login**: Usuario, Email, Contraseña, Confirmar Contraseña
2. **Crear tareas**: Botón "Nueva Tarea" → Modal con Nombre y Comentario
3. **Editar tareas**: Doble click en tarea → Modal de edición
4. **Completar tareas**: Check "Completada" → Se mueve a vista de completadas
5. **Visualizar**: Pestañas separadas para pendientes y completadas

## 📁 Estructura del Proyecto

```
App Tareas/
├── apps/
│   ├── server/          # API Backend (Node.js + Express + Prisma)
│   ├── web/             # Frontend Web (React + Vite)
│   └── mobile/          # App Móvil (React Native + Expo)
├── package.json         # Configuración del monorepo
├── pnpm-workspace.yaml  # Workspaces de pnpm
└── README.md
```

## 🛠️ Requisitos

- **Node.js** 18+
- **npm** (incluido con Node.js)
- **Expo CLI** (para la app móvil): `npm install -g @expo/cli`
- **Cuenta en Railway** (para despliegue del backend)
- **Cuenta en GitHub** (para repositorio)
- **Cuenta en Expo** (opcional, para build de APK con EAS)

## 🚀 Instalación y Desarrollo

### 1. Backend (API)
```bash
cd apps/server
npm install
npm run dev  # Inicia en http://localhost:3000
```

### 2. Frontend Web
```bash
cd apps/web
npm install
npm run dev  # Inicia en http://localhost:5173
```

### 3. App Móvil
```bash
cd apps/mobile
npm install
npx expo start  # Abre Expo Dev Tools
```

## 🌐 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión

### Tareas (requieren JWT)
- `GET /api/tasks/pending` - Obtener tareas pendientes
- `GET /api/tasks/completed` - Obtener tareas completadas
- `POST /api/tasks` - Crear nueva tarea
- `GET /api/tasks/:id` - Obtener tarea específica
- `PUT /api/tasks/:id` - Editar tarea
- `PATCH /api/tasks/:id/complete` - Marcar como completada
- `DELETE /api/tasks/:id` - Eliminar tarea

**Autorización**: Incluir `Authorization: Bearer <token>` en headers.

## 🔧 Variables de Entorno

### Backend (apps/server/.env)
```env
DATABASE_URL="file:./dev.db"  # SQLite para desarrollo
JWT_SECRET="tu-secreto-jwt-seguro"
PORT=3000
```

### Para Producción (Railway)
```env
DATABASE_URL="postgresql://usuario:password@host:puerto/database"
JWT_SECRET="secreto-jwt-produccion-seguro"
PORT=3000
```

## 🚀 Despliegue

### Backend en Railway
1. Crea cuenta en [Railway](https://railway.app)
2. En tu proyecto, añade el plugin "PostgreSQL" y copia la "Postgres Connection URL"
3. Importa este repositorio desde GitHub (monorepo soportado por `railway.toml`)
4. En el servicio backend (apps/server), configura variables:
   - `DATABASE_URL`: pega la URL de PostgreSQL
   - `JWT_SECRET`: una cadena segura
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: origen permitido del frontend (ej: `http://localhost:5173` o tu dominio)
5. Deploy: Railway usará Nixpacks → `npm ci` → `npm run build` → `npm start`
   - Antes de iniciar, se ejecuta `prestart: prisma migrate deploy` (migraciones automáticas)
6. Prueba tu API en la URL pública que te da Railway (GET `/` y `/api/...`)

### Frontend Web
- Define `VITE_API_URL` apuntando al backend (por ejemplo: `https://tu-api.up.railway.app/api`).
- Opciones de hosting: GitHub Pages, Netlify, Vercel o Railway.

### App Móvil (APK)
```bash
cd apps/mobile

# Opción 1: Build local (requiere Android Studio)
npx expo run:android

# Opción 2: EAS Build (recomendado)
npm install -g eas-cli
eas login
eas build --platform android
```

## 📱 Cómo Probar la Aplicación

### Web (Navegador)
1. Inicia el backend: `cd apps/server && npm run dev`
2. Inicia el frontend: `cd apps/web && npm run dev`
3. Abre http://localhost:5173
4. Regístrate y prueba crear/editar/completar tareas

### Móvil (Android)
1. Instala Expo Go desde Google Play Store
2. Inicia el backend: `cd apps/server && npm run dev`
3. Inicia la app móvil: `cd apps/mobile && npx expo start`
4. Escanea el QR con Expo Go
5. Prueba las mismas funcionalidades que en web

## 🔄 Sincronización de Datos

Ambas aplicaciones (web y móvil) consumen la misma API, por lo que:
- Las tareas creadas en web aparecen en móvil
- Las tareas completadas en móvil se reflejan en web
- Los usuarios pueden alternar entre plataformas sin perder datos

## 🎯 Próximos Pasos

- [ ] Configurar CI/CD con GitHub Actions
- [ ] Implementar notificaciones push (móvil)
- [ ] Añadir modo offline con sincronización
- [ ] Implementar categorías y etiquetas
- [ ] Añadir fechas de vencimiento
- [ ] Implementar colaboración entre usuarios

## 🐛 Solución de Problemas

### Error de conexión API
- Verifica que el backend esté corriendo en puerto 3000
- Revisa las variables de entorno
- Confirma que CORS esté habilitado

### Problemas con Expo
- Asegúrate de tener Expo CLI instalado globalmente
- Verifica que tu dispositivo y computadora estén en la misma red
- Reinstala Expo Go si hay problemas de conexión

### Base de datos
- Para desarrollo usa SQLite (incluido)
- Para producción configura PostgreSQL en Railway
- Ejecuta migraciones: `npx prisma migrate deploy`
