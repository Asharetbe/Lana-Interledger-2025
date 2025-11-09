# Script de Recuperación Automática para Windows
# Guarda este archivo como: fix-windows.ps1
# Ejecuta como: .\fix-windows.ps1

Write-Host @"
╔═══════════════════════════════════════════════════════════╗
║  🔧 LANA - Script de Recuperación para Windows           ║
║     Arreglando problemas comunes de Node.js y npm        ║
╚═══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Función para imprimir con color
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Paso 1: Verificar Node.js
Write-Host "`n[1/7] 📋 Verificando instalación de Node.js..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version 2>&1
    $npmVersion = npm --version 2>&1
    
    if ($nodeVersion -match "v\d+") {
        Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor Green
        Write-Host "  ✅ npm: $npmVersion" -ForegroundColor Green
    } else {
        throw "Node no encontrado"
    }
} catch {
    Write-Host "  ❌ ERROR: Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "`n  Por favor:" -ForegroundColor Yellow
    Write-Host "  1. Ve a https://nodejs.org/" -ForegroundColor Cyan
    Write-Host "  2. Descarga la versión LTS (recomendada)" -ForegroundColor Cyan
    Write-Host "  3. Instala con las opciones por defecto" -ForegroundColor Cyan
    Write-Host "  4. Reinicia PowerShell y ejecuta este script de nuevo" -ForegroundColor Cyan
    Write-Host "`n  Presiona cualquier tecla para salir..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    exit 1
}

# Paso 2: Verificar que estamos en el directorio correcto
Write-Host "`n[2/7] 📁 Verificando directorio del proyecto..." -ForegroundColor Yellow

if (-not (Test-Path ".\package.json")) {
    Write-Host "  ❌ ERROR: No se encontró package.json" -ForegroundColor Red
    Write-Host "  Asegúrate de estar en el directorio raíz de tu proyecto React Native" -ForegroundColor Yellow
    Write-Host "  Ejemplo: cd C:\Hack\MiApp" -ForegroundColor Cyan
    exit 1
}

$packageJson = Get-Content ".\package.json" | ConvertFrom-Json
$projectName = $packageJson.name
Write-Host "  ✅ Proyecto encontrado: $projectName" -ForegroundColor Green

# Paso 3: Matar procesos de Node
Write-Host "`n[3/7] 🔪 Deteniendo procesos de Node.js y Expo..." -ForegroundColor Yellow

$processes = @('node.exe', 'expo.exe', 'react-native.exe')
$killed = $false

foreach ($process in $processes) {
    try {
        $running = Get-Process -Name $process.Replace('.exe', '') -ErrorAction SilentlyContinue
        if ($running) {
            Stop-Process -Name $process.Replace('.exe', '') -Force -ErrorAction SilentlyContinue
            Write-Host "  ✅ $process detenido" -ForegroundColor Green
            $killed = $true
        }
    } catch {
        # Proceso no existe, ignorar
    }
}

if (-not $killed) {
    Write-Host "  ℹ️  No había procesos ejecutándose" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# Paso 4: Eliminar node_modules
Write-Host "`n[4/7] 🗑️  Eliminando node_modules..." -ForegroundColor Yellow

if (Test-Path ".\node_modules") {
    Write-Host "  ⏳ Esto puede tardar varios minutos..." -ForegroundColor Gray
    
    try {
        Remove-Item -Path .\node_modules -Recurse -Force -ErrorAction Stop
        Write-Host "  ✅ node_modules eliminado" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Algunos archivos no se pudieron eliminar (permisos)" -ForegroundColor Yellow
        Write-Host "  💡 Intentando con método alternativo..." -ForegroundColor Cyan
        
        # Intentar con cmd
        cmd /c "rd /s /q node_modules" 2>$null
        
        if (Test-Path ".\node_modules") {
            Write-Host "  ❌ ERROR: No se pudo eliminar node_modules" -ForegroundColor Red
            Write-Host "  Solución manual:" -ForegroundColor Yellow
            Write-Host "  1. Cierra TODAS las ventanas de VS Code, PowerShell, etc." -ForegroundColor Cyan
            Write-Host "  2. Elimina manualmente la carpeta node_modules" -ForegroundColor Cyan
            Write-Host "  3. Ejecuta este script de nuevo" -ForegroundColor Cyan
            exit 1
        } else {
            Write-Host "  ✅ node_modules eliminado (método alternativo)" -ForegroundColor Green
        }
    }
} else {
    Write-Host "  ℹ️  node_modules no existe (ok)" -ForegroundColor Gray
}

# Paso 5: Eliminar package-lock.json
Write-Host "`n[5/7] 🗑️  Eliminando package-lock.json..." -ForegroundColor Yellow

if (Test-Path ".\package-lock.json") {
    Remove-Item -Path .\package-lock.json -Force
    Write-Host "  ✅ package-lock.json eliminado" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  package-lock.json no existe (ok)" -ForegroundColor Gray
}

# Paso 6: Limpiar caché
Write-Host "`n[6/7] 🧹 Limpiando caché de npm..." -ForegroundColor Yellow

npm cache clean --force 2>&1 | Out-Null
Write-Host "  ✅ Caché de npm limpiado" -ForegroundColor Green

# Paso 7: Reinstalar dependencias
Write-Host "`n[7/7] 📦 Instalando dependencias..." -ForegroundColor Yellow
Write-Host "  ⏳ Esto puede tardar varios minutos..." -ForegroundColor Gray

# Ejecutar npm install
$installOutput = npm install 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  ✅ ¡ÉXITO! Proyecto recuperado correctamente            ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
    
    Write-Host "`n📱 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "  1. Para iniciar el proyecto, ejecuta:" -ForegroundColor White
    Write-Host "     npx expo start" -ForegroundColor Yellow
    Write-Host "`n  2. Presiona:" -ForegroundColor White
    Write-Host "     i - Para iOS Simulator" -ForegroundColor Gray
    Write-Host "     a - Para Android Emulator" -ForegroundColor Gray
    Write-Host "     w - Para Web Browser" -ForegroundColor Gray
    
} else {
    Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║  ❌ ERROR durante la instalación                         ║" -ForegroundColor Red
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Red
    
    Write-Host "`n📋 Revisa los errores arriba. Problemas comunes:" -ForegroundColor Yellow
    Write-Host "`n1. Si ves 'EPERM' o 'permission denied':" -ForegroundColor Cyan
    Write-Host "   - Cierra VS Code, PowerShell, y cualquier editor" -ForegroundColor White
    Write-Host "   - Ejecuta PowerShell como Administrador" -ForegroundColor White
    Write-Host "   - Ejecuta este script de nuevo" -ForegroundColor White
    
    Write-Host "`n2. Si ves errores de 'node' no reconocido:" -ForegroundColor Cyan
    Write-Host "   - Reinstala Node.js desde https://nodejs.org/" -ForegroundColor White
    Write-Host "   - Reinicia la computadora" -ForegroundColor White
    Write-Host "   - Ejecuta este script de nuevo" -ForegroundColor White
    
    Write-Host "`n3. Si ves errores de timeout o red:" -ForegroundColor Cyan
    Write-Host "   - Verifica tu conexión a internet" -ForegroundColor White
    Write-Host "   - Intenta de nuevo en unos minutos" -ForegroundColor White
    
    Write-Host "`n💡 Para más ayuda, revisa:" -ForegroundColor Yellow
    Write-Host "   TROUBLESHOOTING_WINDOWS.md" -ForegroundColor Cyan
    
    exit 1
}

Write-Host "`n✨ Script completado. Presiona cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
