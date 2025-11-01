# Script para descobrir o IP da maquina
Write-Host "Descobrindo IP da maquina..." -ForegroundColor Cyan
Write-Host ""

# Filtrar IPs relevantes (ignorar interfaces virtuais como Default Switch)
$networkInterfaces = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -notlike "127.*" -and 
    $_.IPAddress -notlike "169.254.*" -and
    $_.InterfaceAlias -notlike "*Default Switch*" -and
    $_.InterfaceAlias -notlike "*vEthernet*"
} | Sort-Object InterfaceAlias

if ($networkInterfaces) {
    Write-Host "IPs encontrados:" -ForegroundColor Green
    $wifiIP = $null
    $mainIP = $null
    
    foreach ($iface in $networkInterfaces) {
        Write-Host "  IP: $($iface.IPAddress)" -ForegroundColor White
        Write-Host "  Interface: $($iface.InterfaceAlias)" -ForegroundColor Gray
        Write-Host ""
        
        # Priorizar Wi-Fi ou Ethernet
        if ($iface.InterfaceAlias -like "*Wi-Fi*" -or $iface.InterfaceAlias -like "*Ethernet*") {
            if (-not $wifiIP) {
                $wifiIP = $iface.IPAddress
                $mainIP = $iface.IPAddress
            }
        } elseif (-not $mainIP) {
            $mainIP = $iface.IPAddress
        }
    }
    
    # Se encontrou Wi-Fi, usar ele; senão usar o primeiro
    if ($wifiIP) {
        $mainIP = $wifiIP
        Write-Host "Usando IP da Wi-Fi/Ethernet: $mainIP" -ForegroundColor Green
    } else {
        $mainIP = $networkInterfaces[0].IPAddress
        Write-Host "Usando primeiro IP encontrado: $mainIP" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "URL para usar no MT5 (URLs permitidas):" -ForegroundColor Yellow
    Write-Host "  http://$mainIP:3000/*" -ForegroundColor Green
    Write-Host ""
    Write-Host "URL para usar no indicador (EndpointURL):" -ForegroundColor Yellow
    Write-Host "  http://$mainIP:3000/api/signals" -ForegroundColor Green
    Write-Host ""
    Write-Host "Copie essas URLs acima!" -ForegroundColor Cyan
} else {
    Write-Host "Nenhum IP encontrado!" -ForegroundColor Red
    Write-Host "Execute: ipconfig" -ForegroundColor Yellow
}
