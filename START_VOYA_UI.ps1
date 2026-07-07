$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Url = "http://127.0.0.1:5173/results/demo"

function Test-VoyaServer {
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:5173" -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -lt 500
    } catch {
        return $false
    }
}

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    Write-Host "Nie znaleziono npm.cmd. Zainstaluj Node.js i sprobuj ponownie."
    exit 1
}

$nodeModules = Join-Path $Root "ui\node_modules"
if (-not (Test-Path $nodeModules)) {
    Write-Host "Instaluje zaleznosci UI..."
    & npm.cmd --prefix (Join-Path $Root "ui") install
}

if (-not (Test-VoyaServer)) {
    Write-Host "Odpalam dev server Voya UI..."
    $command = "cd /d `"$Root`" && npm --prefix ui run dev -- --host 127.0.0.1 --port 5173"
    Start-Process -FilePath "cmd.exe" -ArgumentList @("/k", $command) -WorkingDirectory $Root

    for ($i = 0; $i -lt 45; $i += 1) {
        if (Test-VoyaServer) {
            break
        }
        Start-Sleep -Seconds 1
    }
}

if (Test-VoyaServer) {
    Start-Process $Url
    Write-Host "Otworzono: $Url"
} else {
    Write-Host "Dev server nie odpowiedzial na porcie 5173. Uruchom recznie:"
    Write-Host "cd `"$Root`""
    Write-Host "npm run ui:dev"
}
