# 🚀 Usar Servidor Local (Solução para Erro 4006)

## ❓ Por que usar servidor local?

O erro **4006** ocorre porque o MT5 não aceita o certificado SSL da Vercel. Usar servidor local com HTTP resolve isso.

## ✅ Passo a Passo

### 1. Iniciar Servidor Local

Abra o PowerShell na pasta do projeto e execute:

```powershell
npm run dev
```

Você verá algo como:
```
🚀 Servidor rodando!
📡 Endpoint: http://localhost:3000/api/signals
📡 Endpoint (IP): http://192.168.1.XXX:3000/api/signals
```

### 2. Configurar URL no Indicador MT5

1. **Botão direito no indicador → Propriedades**
2. No campo `EndpointURL`, configure:
   ```
   http://localhost:3000/api/signals
   ```
   OU use o IP mostrado pelo servidor:
   ```
   http://192.168.1.XXX:3000/api/signals
   ```
3. **Clique em OK**

### 3. Adicionar URL nas URLs Permitidas do MT5

1. **Tools → Options → Expert Advisors**
2. ✅ **Marque:** "Allow WebRequest for listed URL"
3. **Adicione (uma por linha):**
   ```
   http://localhost:3000/*
   http://127.0.0.1:3000/*
   ```
   
   **Se usar IP, adicione também:**
   ```
   http://192.168.1.XXX:3000/*
   ```
   *(Substitua XXX pelo IP mostrado pelo servidor)*
4. **Clique em OK**
5. **🚨 REINICIE O MT5 COMPLETAMENTE**

### 4. Testar

1. Recompile o indicador (F7 no MetaEditor)
2. Adicione ao gráfico
3. Clique em **"Testar Conexão"**
4. Deve funcionar agora! ✅

## 🔄 Quando mudar para produção

Quando quiser usar a API da Vercel em produção:

1. Use um túnel HTTPS como **ngrok**:
   ```powershell
   ngrok http 3000
   ```
   Use a URL HTTPS fornecida pelo ngrok

2. Ou configure o servidor local para aceitar conexões externas e use o IP real

## 💡 Vantagens do Servidor Local

- ✅ Sem problemas com certificados SSL
- ✅ Mais rápido (sem latência de rede)
- ✅ Funciona sempre que o servidor está rodando
- ✅ Ideal para desenvolvimento e teste

## ⚠️ Importante

- O servidor precisa estar rodando (`npm run dev`) enquanto o MT5 estiver enviando sinais
- Se fechar o terminal, o servidor para
- Para produção, use ngrok ou configure um servidor dedicado

## 📝 Script Rápido

Para facilitar, você pode criar um atalho para iniciar o servidor:

**start-server.ps1:**
```powershell
cd C:\Projetos\takepips
npm run dev
```

Então basta executar:
```powershell
.\start-server.ps1
```

