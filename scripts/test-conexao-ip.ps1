# Script para testar se o servidor esta acessivel pelo IP
param(
    [string]$IP = "192.168.15.8"
)

Write-Host "Testando conexao com servidor no IP: $IP" -ForegroundColor Cyan
Write-Host ""

# Teste 1: Health check
Write-Host "1. Testando Health Check em http://${IP}:3000/health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://${IP}:3000/health" -Method GET -ErrorAction Stop -TimeoutSec 5
    Write-Host "   OK - Servidor esta respondendo pelo IP!" -ForegroundColor Green
    Write-Host "   Resposta: $($health | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "   ERRO - Servidor NAO esta respondendo pelo IP!" -ForegroundColor Red
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possiveis causas:" -ForegroundColor Yellow
    Write-Host "  1. Servidor nao esta rodando (execute: npm run dev)" -ForegroundColor White
    Write-Host "  2. Firewall bloqueando (execute: .\scripts\liberar-porta-firewall.ps1 como Admin)" -ForegroundColor White
    Write-Host "  3. Servidor nao esta escutando no IP correto" -ForegroundColor White
    exit 1
}

Write-Host ""

# Teste 2: Endpoint de sinais
Write-Host "2. Testando endpoint /api/signals em http://${IP}:3000/api/signals..." -ForegroundColor Yellow
$testBody = @{
    name = "TakePips"
    type = "BUY"
    symbol = "XAUUSD"
    entry = 2385.15
    stopLoss = 2380.00
    take1 = 2395.00
    take2 = 2395.00
    take3 = 2395.00
    stopTicks = 515
    time = "2025.10.31 22:40:02"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://${IP}:3000/api/signals" -Method POST -Body $testBody -ContentType "application/json" -ErrorAction Stop -TimeoutSec 5
    Write-Host "   OK - Endpoint funcionando pelo IP!" -ForegroundColor Green
    Write-Host "   ID criado: $($response.data.id)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Se funcionou aqui mas nao no MT5:" -ForegroundColor Cyan
    Write-Host "  - Verifique se a URL esta correta no MT5" -ForegroundColor White
    Write-Host "  - Verifique se adicionou a URL nas URLs permitidas" -ForegroundColor White
    Write-Host "  - Verifique se reiniciou o MT5" -ForegroundColor White
} catch {
    Write-Host "   ERRO - Endpoint retornou erro!" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
    Write-Host "   Mensagem: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

