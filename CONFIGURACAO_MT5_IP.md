# 🔧 Configuração do MT5 com IP Real

O MT5 não aceita `localhost` ou `127.0.0.1` - precisa usar o IP real da máquina.

## 📍 Passo 1: Descobrir seu IP

Execute este script:
```powershell
.\scripts\get-ip.ps1
```

Ou manualmente:
```powershell
ipconfig | Select-String "IPv4"
```

Procure por um IP como: `192.168.1.100` ou `10.0.0.XXX`

## 📝 Passo 2: Configurar MT5

1. **Tools → Options → Expert Advisors**
2. ✅ Marque **"Allow WebRequest for listed URL"**
3. No campo de URLs, adicione (substitua pelo seu IP):
   ```
   http://192.168.1.100:3000/*
   ```
   *(Use o IP que apareceu no passo 1)*
4. Clique **OK**
5. **REINICIE O MT5** ⚠️

## 🔧 Passo 3: Configurar Indicador

1. Botão direito no indicador → **Propriedades**
2. No campo `EndpointURL`, altere para:
   ```
   http://192.168.1.100:3000/api/signals
   ```
   *(Use o mesmo IP do passo 2)*
3. Clique **OK**

## ✅ Teste

Após reiniciar o MT5 e configurar o indicador, tente enviar um sinal.

## ⚠️ Importante

**Se o IP mudar** (ex: conectou em outra rede Wi-Fi):
- Execute `.\scripts\get-ip.ps1` novamente
- Atualize as URLs no MT5 e no indicador
- Reinicie o MT5

## 💡 Dica

O servidor mostra o IP quando inicia:
```
🚀 Servidor rodando!
📡 Endpoint: http://localhost:3000/api/signals
📡 Endpoint (IP): http://192.168.1.100:3000/api/signals  ← Use este!
```

Copie o IP que aparece na linha "Endpoint (IP)".

