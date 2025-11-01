# Script para liberar porta 3000 no Windows Firewall
Write-Host "Liberando porta 3000 no Windows Firewall..." -ForegroundColor Cyan
Write-Host ""

# Verificar se esta executando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "AVISO: Este script precisa ser executado como Administrador!" -ForegroundColor Yellow
    Write-Host "Clique com botao direito e selecione 'Executar como administrador'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ou execute manualmente:" -ForegroundColor White
    Write-Host "  netsh advfirewall firewall add rule name='TakePips Backend' dir=in action=allow protocol=TCP localport=3000" -ForegroundColor Cyan
    exit 1
}

try {
    # Adicionar regra de entrada para porta 3000
    Write-Host "Adicionando regra de entrada..." -ForegroundColor Yellow
    netsh advfirewall firewall add rule name="TakePips Backend" dir=in action=allow protocol=TCP localport=3000
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK - Porta 3000 liberada no firewall!" -ForegroundColor Green
    } else {
        Write-Host "Tentando com comando alternativo..." -ForegroundColor Yellow
        New-NetFirewallRule -DisplayName "TakePips Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
        Write-Host "OK - Porta 3000 liberada no firewall!" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Verificando regras criadas..." -ForegroundColor Yellow
    netsh advfirewall firewall show rule name="TakePips Backend"
    
} catch {
    Write-Host "ERRO ao criar regra: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Tente executar manualmente como Administrador:" -ForegroundColor Yellow
    Write-Host "  netsh advfirewall firewall add rule name='TakePips Backend' dir=in action=allow protocol=TCP localport=3000" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Importante: Reinicie o servidor (npm run dev) apos liberar a porta!" -ForegroundColor Yellow

