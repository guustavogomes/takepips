# Script de teste rapido do servidor
Write-Host "Testando servidor TakePips..." -ForegroundColor Cyan
Write-Host ""

# Teste 1: Health check
Write-Host "1. Testando Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET -ErrorAction Stop
    Write-Host "   OK - Servidor esta respondendo!" -ForegroundColor Green
    Write-Host "   Resposta: $($health | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "   ERRO - Servidor NAO esta respondendo!" -ForegroundColor Red
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "AVISO - Verifique se o servidor esta rodando:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor White
    exit 1
}

Write-Host ""

# Teste 2: Endpoint de sinais
Write-Host "2. Testando endpoint /api/signals..." -ForegroundColor Yellow
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
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/signals" -Method POST -Body $testBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "   OK - Endpoint funcionando!" -ForegroundColor Green
    Write-Host "   ID criado: $($response.data.id)" -ForegroundColor Gray
} catch {
    Write-Host "   ERRO - Endpoint retornou erro!" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
    Write-Host "   Mensagem: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Teste 3: Verificar porta
Write-Host "3. Verificando porta 3000..." -ForegroundColor Yellow
$port = netstat -ano | findstr ":3000"
if ($port) {
    Write-Host "   OK - Porta 3000 esta em uso (servidor provavelmente rodando)" -ForegroundColor Green
} else {
    Write-Host "   AVISO - Porta 3000 NAO esta em uso!" -ForegroundColor Yellow
    Write-Host "   O servidor pode nao estar rodando" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Proximos passos para MT5:" -ForegroundColor Cyan
Write-Host "   1. Tools -> Options -> Expert Advisors" -ForegroundColor White
Write-Host "   2. Marque 'Allow WebRequest for listed URL'" -ForegroundColor White
Write-Host "   3. Adicione: http://localhost:3000/*" -ForegroundColor White
Write-Host "   4. Adicione: http://127.0.0.1:3000/*" -ForegroundColor White
Write-Host "   5. REINICIE o MT5" -ForegroundColor Yellow
Write-Host ""
