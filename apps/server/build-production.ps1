# Script para preparar el build de producción en Windows
Write-Host "Preparando build de producción..." -ForegroundColor Green

# Copiar esquema de producción
Copy-Item "prisma\schema.production.prisma" "prisma\schema.prisma" -Force
Write-Host "✓ Esquema de producción copiado" -ForegroundColor Green

# Eliminar migraciones de SQLite
if (Test-Path "prisma\migrations") {
    Remove-Item "prisma\migrations" -Recurse -Force
    Write-Host "✓ Migraciones de SQLite eliminadas" -ForegroundColor Green
}

# Copiar migraciones de PostgreSQL
Copy-Item "prisma\migrations-postgresql" "prisma\migrations" -Recurse -Force
Write-Host "✓ Migraciones de PostgreSQL copiadas" -ForegroundColor Green

# Generar cliente Prisma
npx prisma generate
Write-Host "✓ Cliente Prisma generado" -ForegroundColor Green

Write-Host "Build de producción preparado exitosamente!" -ForegroundColor Green
