# Script para configurar Git e fazer primeiro commit
Write-Host "Configurando Git..." -ForegroundColor Cyan
Write-Host ""

# Verificar se já está inicializado
if (-not (Test-Path .git)) {
    Write-Host "Inicializando repositorio Git..." -ForegroundColor Yellow
    git init
}

# Verificar status
Write-Host "Status atual:" -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "Adicionando arquivos..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "Fazendo primeiro commit..." -ForegroundColor Yellow
$commitMessage = "Initial commit: TakePips backend and MT5 indicator"
git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "OK - Commit realizado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos passos:" -ForegroundColor Cyan
    Write-Host "  1. Verifique se o remote esta configurado:" -ForegroundColor White
    Write-Host "     git remote -v" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Se nao estiver, adicione:" -ForegroundColor White
    Write-Host "     git remote add origin https://github.com/guustavogomes/takepips.git" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Crie a branch main (se necessario):" -ForegroundColor White
    Write-Host "     git branch -M main" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  4. Faça o push:" -ForegroundColor White
    Write-Host "     git push -u origin main" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "ERRO ao fazer commit!" -ForegroundColor Red
    Write-Host "Verifique se há arquivos para commitar" -ForegroundColor Yellow
}

