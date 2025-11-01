# 🔧 Solução para Erro 4014 no MT5

O erro **4014** (`ERR_HTTP_REQUEST_FAILED`) indica que o MT5 não conseguiu fazer a conexão HTTP com o servidor.

## ✅ Checklist de Verificação

### 1. Servidor está rodando?

Verifique se o servidor local está rodando:

```powershell
# No terminal, você deve ver:
🚀 Servidor rodando em http://localhost:3000
📡 Endpoint: http://localhost:3000/api/signals
```

**Se não estiver rodando:**
```powershell
npm run dev
```

### 2. URL configurada corretamente no MT5?

No MetaTrader 5:
1. Botão direito no indicador → **Propriedades**
2. Verifique o campo `EndpointURL`
3. Deve estar: `http://localhost:3000/api/signals`

### 3. URL adicionada nas URLs permitidas?

**IMPORTANTE:** O MT5 exige que você adicione a URL manualmente!

1. Vá em **Tools → Options**
2. Aba **Expert Advisors**
3. Marque **"Allow WebRequest for listed URL"**
4. No campo abaixo, adicione:
   ```
   http://localhost:3000/*
   ```
   OU use o padrão mais amplo:
   ```
   http://127.0.0.1:3000/*
   ```
5. Clique em **OK**
6. **REINICIE O MT5** para aplicar as mudanças

### 4. Teste o servidor manualmente

Antes de testar no MT5, verifique se o servidor responde:

```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
```

Ou use o navegador: `http://localhost:3000/health`

### 5. Problema com localhost? Use o IP da máquina

Se `localhost` não funcionar:

1. Descubra o IP da sua máquina:
```powershell
# PowerShell
ipconfig
# Procure por "IPv4 Address" (ex: 192.168.1.100)
```

2. No MT5, altere a URL para:
```
http://192.168.1.100:3000/api/signals
```
(Substitua pelo IP real da sua máquina)

3. Adicione também nas URLs permitidas:
```
http://192.168.1.100:3000/*
```

### 6. Firewall/Antivírus bloqueando?

1. Verifique se o Windows Defender ou outro antivírus não está bloqueando
2. Tente adicionar exceção para:
   - Porta 3000
   - MetaTrader 5
   - Node.js

### 7. Porta 3000 já em uso?

Verifique se outra aplicação não está usando a porta 3000:

```powershell
netstat -ano | findstr :3000
```

Se encontrar algo, pode mudar a porta no servidor:

No arquivo `.env`, adicione:
```
PORT=3001
```

E atualize a URL no MT5 para: `http://localhost:3001/api/signals`

## 🧪 Teste Completo

1. ✅ Servidor rodando (`npm run dev`)
2. ✅ Health check funcionando (`http://localhost:3000/health`)
3. ✅ URL configurada no indicador MT5
4. ✅ URL adicionada nas URLs permitidas do MT5
5. ✅ MT5 reiniciado após adicionar URL
6. ✅ Firewall não bloqueando

## 🔍 Logs Úteis

No MT5, abra o **Tools → Options → Expert Advisors** e veja os logs na aba **Journal**.

Procure por:
- `WebRequest: -1` (erro)
- `WebRequest: 200` (sucesso)
- Mensagens de erro específicas

## 📝 Teste com cURL (PowerShell)

Se o servidor funcionar com cURL mas não com MT5, o problema é configuração do MT5:

```powershell
$body = @{
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

Invoke-RestMethod -Uri "http://localhost:3000/api/signals" -Method POST -Body $body -ContentType "application/json"
```

Se isso funcionar, o problema é 100% configuração do MT5.

## ⚠️ Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| 4060 | URL não permitida | Adicionar URL nas configurações do MT5 |
| 4014 | Falha na conexão | Verificar servidor, URL, firewall |
| Timeout | Servidor não responde | Verificar se servidor está rodando |

## 💡 Dica Final

**Sempre reinicie o MT5** após alterar as URLs permitidas!

