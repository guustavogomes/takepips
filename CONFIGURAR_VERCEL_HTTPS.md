# 🔧 Configurar MT5 para usar Vercel HTTPS

## ⚠️ IMPORTANTE: Erro 4014 com HTTPS

O erro 4014 pode ocorrer quando o MT5 tenta acessar URLs HTTPS. Siga estes passos:

## ✅ Passo 1: Adicionar URL HTTPS nas URLs Permitidas do MT5

**CRÍTICO:** O MT5 exige que você adicione manualmente a URL HTTPS!

1. **Abra o MetaTrader 5**
2. **Tools → Options**
3. Aba **Expert Advisors**
4. ✅ **Marque:** "Allow WebRequest for listed URL"
5. **No campo de URLs, adicione (uma por linha):**
   ```
   https://takepips.vercel.app/*
   https://*.vercel.app/*
   ```
   *(Adicione ambas para garantir que funcione com diferentes domínios do Vercel)*
6. **Clique em OK**
7. **🚨 REINICIE O MT5 COMPLETAMENTE** (feche e abra novamente)

## ✅ Passo 2: Configurar URL no Indicador

1. **Botão direito no indicador TakePips → Propriedades**
2. No campo `EndpointURL`, configure:
   ```
   https://takepips.vercel.app/api/signals
   ```
3. **Clique em OK**

## ✅ Passo 3: Verificar se a API está funcionando

Antes de testar no MT5, verifique se a API responde:

**PowerShell:**
```powershell
$body = @{
    name = "TakePips"
    type = "BUY"
    symbol = "BTCUSD"
    entry = 50000.00
    stopLoss = 49900.00
    take1 = 50100.00
    take2 = 50200.00
    take3 = 50300.00
    stopTicks = 100
    time = "2025.11.01 10:53:00"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://takepips.vercel.app/api/signals" -Method POST -Body $body -ContentType "application/json"
```

**Se funcionar:** A API está OK, o problema é configuração do MT5.
**Se não funcionar:** Verifique os logs do Vercel.

## ✅ Passo 4: Possíveis Problemas e Soluções

### Problema 1: MT5 não aceita certificados SSL

Se o MT5 rejeitar certificados SSL do Vercel:

**Solução A:** Usar domínio personalizado com certificado válido
**Solução B:** Verificar se o MT5 está atualizado para última versão
**Solução C:** Contactar suporte do MT5 sobre certificados SSL

### Problema 2: Firewall bloqueando HTTPS

1. Verifique se o Windows Firewall permite conexões HTTPS
2. Adicione exceção para MetaTrader 5
3. Teste desabilitando temporariamente o firewall (apenas para teste)

### Problema 3: Proxy/VPN interferindo

Se estiver usando VPN ou proxy:
- Tente desabilitar temporariamente
- Configure o MT5 para usar proxy se necessário
- Verifique se o proxy não está bloqueando requisições HTTPS

## ✅ Passo 5: Testar no MT5

Após configurar tudo:

1. **Reinicie o MT5** (OBRIGATÓRIO!)
2. Abra o gráfico com o indicador TakePips
3. Aguarde o sinal ser gerado
4. Verifique nos logs do MT5 (Tools → Options → Expert Advisors → Journal)

**Logs esperados:**
- ✅ `Sinal enviado com sucesso. Resposta: ...`
- ❌ Se aparecer erro 4014, volte ao Passo 1

## 🔍 Verificar Logs do Vercel

Para ver se a requisição chegou ao servidor:

1. Acesse: https://vercel.com/guustavogomes-projects/takepips
2. Vá em **Deployments**
3. Clique no último deploy
4. Veja os **Runtime Logs**

Se não aparecer nenhum log quando você testa, o MT5 não está conseguindo fazer a requisição.

## 💡 Dica: Usar URL de Preview para Teste

Se a produção não funcionar, teste com uma URL de preview:

1. No Vercel, pegue a URL do último deploy (ex: `takepips-xxx.vercel.app`)
2. Adicione nas URLs permitidas:
   ```
   https://takepips-xxx.vercel.app/*
   ```
3. Configure no indicador essa URL
4. Teste novamente

## ⚠️ Checklist Final

- [ ] URL HTTPS adicionada nas URLs permitidas do MT5
- [ ] MT5 reiniciado após adicionar URL
- [ ] URL correta configurada no indicador (`https://takepips.vercel.app/api/signals`)
- [ ] API testada manualmente e funcionando
- [ ] Firewall não está bloqueando
- [ ] MT5 está atualizado para última versão

## 🆘 Se AINDA não funcionar

1. Verifique a versão do MT5 (deve ser a mais recente)
2. Tente usar uma URL HTTP local primeiro para confirmar que o MT5 funciona:
   - Rode `npm run dev` localmente
   - Configure para usar `http://localhost:3000/api/signals`
   - Se funcionar localmente, o problema é específico de HTTPS
3. Verifique logs detalhados do MT5
4. Considere usar ngrok ou outro túnel HTTPS para testar

