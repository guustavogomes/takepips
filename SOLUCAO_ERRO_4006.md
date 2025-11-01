# 🔧 Solução para Erro 4006 no MT5 (SSL/TLS HTTPS)

## ❌ O que é o Erro 4006?

O erro **4006** no MetaTrader 5 indica um problema com **SSL/TLS** ao tentar fazer requisições HTTPS. Este erro é comum quando o MT5 tenta acessar URLs seguras (HTTPS).

## ✅ Soluções Passo a Passo

### Passo 1: Adicionar URL nas URLs Permitidas

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
   *(Adicione ambas para garantir compatibilidade)*
6. **Clique em OK**
7. **🚨 REINICIE O MT5 COMPLETAMENTE** (feche completamente e abra novamente)

### Passo 2: Verificar Versão do MT5

1. **Help → About**
2. Verifique se está na versão mais recente
3. Se não estiver, atualize o MT5

### Passo 3: Testar Novamente

1. Após reiniciar, teste novamente o botão "Testar Conexão"
2. Se ainda der erro 4006, vá para o Passo 4

### Passo 4: Tentar URL Específica

Se o wildcard `*` não funcionar, tente adicionar URLs mais específicas:

```
https://takepips.vercel.app/api/signals
https://takepips.vercel.app/*
https://takepips-*.vercel.app/*
```

### Passo 5: Verificar Certificado SSL

O erro 4006 pode ocorrer se:
- O certificado SSL do servidor não é confiável
- O MT5 não consegue validar o certificado

**Verificação:**
1. Teste a URL no navegador (deve abrir normalmente)
2. Verifique se não há avisos de certificado inválido
3. Se houver avisos, o problema é no certificado, não no MT5

## 🔍 Alternativas se HTTPS Não Funcionar

### Opção A: Usar Servidor Local (HTTP)

Se o HTTPS não funcionar, você pode usar o servidor local:

1. Execute localmente: `npm run dev`
2. Configure a URL no indicador: `http://localhost:3000/api/signals`
3. Adicione nas URLs permitidas: `http://localhost:3000/*`

### Opção B: Usar Túnel HTTPS (ngrok)

Se precisar de HTTPS, use ngrok:

1. Instale ngrok: https://ngrok.com
2. Execute: `ngrok http 3000`
3. Use a URL HTTPS fornecida pelo ngrok
4. Adicione nas URLs permitidas do MT5

## ⚠️ Limitações Conhecidas do MT5

- Algumas versões antigas do MT5 têm problemas com certificados SSL modernos
- O MT5 pode não confiar em certificados de Let's Encrypt (usado pela Vercel)
- Certificados com SAN (Subject Alternative Names) podem causar problemas

## ✅ Checklist de Resolução

- [ ] URL HTTPS adicionada nas URLs permitidas
- [ ] MT5 reiniciado COMPLETAMENTE após adicionar URL
- [ ] MT5 está na versão mais recente
- [ ] URL testada no navegador (funciona?)
- [ ] Tentou ambas as URLs: `https://takepips.vercel.app/*` e `https://*.vercel.app/*`
- [ ] Se ainda não funcionar, tentou servidor local (HTTP)

## 🆘 Se Nada Funcionar

O erro 4006 pode indicar uma limitação do MT5 com certificados SSL específicos. Nesse caso:

1. **Use servidor local com HTTP** (mais confiável)
2. **Ou use um túnel HTTPS** como ngrok
3. **Ou considere usar um domínio próprio** com certificado SSL confiável pelo MT5

## 📝 Notas Técnicas

- O erro 4006 é específico do MT5, não do servidor
- A API do Vercel está funcionando corretamente (testado)
- O problema é na validação SSL do lado do MT5
- Alguns certificados modernos não são aceitos por versões antigas do MT5

