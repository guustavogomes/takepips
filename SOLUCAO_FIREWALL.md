# 🔥 Solução: Liberar Porta no Firewall

O erro 4014 pode ser causado pelo **Windows Firewall bloqueando a porta 3000**.

## ✅ Solução Rápida (Automática)

Execute o script como **Administrador**:

1. Clique com botão direito em `scripts\liberar-porta-firewall.ps1`
2. Selecione **"Executar como administrador"**
3. Aguarde a confirmação

## 🔧 Solução Manual

Se preferir fazer manualmente:

### Método 1: PowerShell (como Administrador)

```powershell
netsh advfirewall firewall add rule name="TakePips Backend" dir=in action=allow protocol=TCP localport=3000
```

### Método 2: Interface Gráfica

1. Pressione `Win + R`
2. Digite: `wf.msc` e pressione Enter
3. Clique em **"Regras de Entrada"** (Inbound Rules)
4. Clique em **"Nova Regra..."** (New Rule...)
5. Selecione **"Porta"** → **Próximo**
6. Selecione **TCP** e digite `3000` → **Próximo**
7. Selecione **"Permitir a conexão"** → **Próximo**
8. Marque todas as opções (Domain, Private, Public) → **Próximo**
9. Nome: `TakePips Backend` → **Finalizar**

## 🧪 Testar Após Liberar

Depois de liberar a porta, teste se o servidor está acessível pelo IP:

```powershell
.\scripts\test-conexao-ip.ps1
```

Ou teste manualmente:
```powershell
Invoke-RestMethod -Uri "http://192.168.15.8:3000/health" -Method GET
```

**Se funcionar:** O firewall estava bloqueando, agora deve funcionar no MT5!

**Se não funcionar:** Verifique se:
- Servidor está rodando (`npm run dev`)
- O IP está correto

## 📋 Checklist Completo

- [ ] Porta 3000 liberada no firewall
- [ ] Servidor rodando (`npm run dev`)
- [ ] Teste manual funciona (PowerShell)
- [ ] URL adicionada no MT5: `http://192.168.15.8:3000/*`
- [ ] Indicador configurado: `http://192.168.15.8:3000/api/signals`
- [ ] MT5 reiniciado

## ⚠️ Importante

Após liberar a porta, **reinicie o servidor**:
```powershell
# Pare o servidor (Ctrl+C) e inicie novamente
npm run dev
```

## 🔍 Verificar se a Regra Foi Criada

```powershell
netsh advfirewall firewall show rule name="TakePips Backend"
```

Você deve ver a regra listada com status "Enabled".

