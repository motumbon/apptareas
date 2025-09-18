# Guía de Despliegue - App de Tareas

## Configuración Completada ✅

- ✅ SQLite para desarrollo local
- ✅ PostgreSQL para producción (Railway)
- ✅ Archivos de configuración creados
- ✅ Scripts de build actualizados

## Estructura de Archivos de Configuración

```
apps/
├── server/
│   ├── .env                    # Desarrollo (SQLite)
│   ├── .env.production        # Producción (PostgreSQL)
│   └── prisma/
│       ├── schema.prisma      # Esquema para desarrollo (SQLite)
│       └── schema.production.prisma # Esquema para producción (PostgreSQL)
└── web/
    ├── .env.production.example
    └── .env.production        # Variables para la web en producción
```

## Variables de Entorno Necesarias en Railway

Cuando configures tu proyecto en Railway, necesitas estas variables:

### Para el Backend (Servidor):
- `DATABASE_URL` - Railway la proporciona automáticamente
- `JWT_SECRET` - Genera una clave secreta fuerte
- `NODE_ENV=production`

### Para el Frontend (Web):
- `VITE_API_URL` - URL de tu API desplegada (ej: https://tu-api.up.railway.app/api)

## Notas Importantes

1. **Desarrollo Local**: Usa SQLite (ya configurado)
2. **Producción**: Usa PostgreSQL en Railway
3. **El build automáticamente cambia el esquema** de SQLite a PostgreSQL durante el despliegue
