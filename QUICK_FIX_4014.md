# ⚡ Solução Rápida para Erro 4014

## ✅ Checklist Rápido (em ordem)

### 1. Servidor está rodando?

Execute no PowerShell:
```powershell
npm run dev
```

**Você DEVE ver:**
```
🚀 Servidor rodando!
📡 Endpoint: http://localhost:3000/api/signals
```

**Se não aparecer isso, o servidor NÃO está rodando!**

### 2. Teste Rápido do Servidor

Execute o script de teste:
```powershell
cls

```

Ou teste manualmente:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
```

**Se der erro:** O servidor não está rodando ou está em outra porta.

### 3. ⚠️ CONFIGURAÇÃO CRÍTICA DO MT5

**O erro 4014 acontece 99% das vezes porque isso não foi feito:**

1. **Abra o MT5**
2. **Tools → Options**
3. **Aba: Expert Advisors**
4. **✅ Marque: "Allow WebRequest for listed URL"**
5. **No campo de URLs, adicione (uma por linha):**
   ```
   http://localhost:3000/*
   http://127.0.0.1:3000/*
   ```
6. **Clique em OK**
7. **🚨 REINICIE O MT5 COMPLETAMENTE** (feche e abra novamente)

### 4. Verificar se a URL foi adicionada

Após reiniciar:
- Tools → Options → Expert Advisors
- Verifique se as URLs ainda estão lá
- Se sumiram, adicione novamente

### 5. Teste no Indicador

1. Recompile o indicador (F7 no MetaEditor)
2. Abra as propriedades do indicador
3. Verifique se `EndpointURL` está: `http://localhost:3000/api/signals`
3. Tente enviar um sinal

## 🔴 Se AINDA não funcionar:

### Opção A: Usar IP em vez de localhost

1. Quando rodar `npm run dev`, o servidor mostrará seu IP:
   ```
   📡 Endpoint (IP): http://192.168.1.XXX:3000/api/signals
   ```

2. No MT5, adicione também:
   ```
   http://192.168.1.XXX:3000/*
   ```
   (use o IP que apareceu)

3. No indicador, altere a URL para:
   ```
   http://192.168.1.XXX:3000/api/signals
   ```

4. Reinicie o MT5 novamente

### Opção B: Verificar Firewall

1. Windows Defender → Firewall
2. Permitir aplicativo → Adicionar exceção
3. Adicione:
   - Porta 3000
   - Node.js
   - MetaTrader 5

### Opção C: Testar se é problema do MT5

Se o PowerShell funciona mas o MT5 não:
- 100% é problema de configuração do MT5
- Verifique novamente as URLs permitidas
- Certifique-se de ter reiniciado o MT5

## 📊 Diagnóstico

Execute este comando e me diga o resultado:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
```

**Se funcionar:** Servidor OK, problema é MT5
**Se não funcionar:** Servidor não está rodando

## 💡 Dica Final

**A ordem importa:**
1. ✅ Servidor rodando
2. ✅ URLs adicionadas no MT5
3. ✅ MT5 reiniciado
4. ✅ Testar

**Pular qualquer passo = erro 4014 garantido!**

