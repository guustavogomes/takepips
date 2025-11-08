# 🔍 Como Filtrar Logs no Logcat

## 🎯 Problema

Você está vendo logs de **todo o telefone**, mas precisa ver apenas os logs do app TakePips.

---

## 🚀 Solução: Aplicar Filtros

### Método 1: Filtrar por Package (Mais Fácil)

1. **No Logcat**, procure pelo campo de **filtro** (geralmente no topo)
2. **Digite:**
   ```
   package:com.takepips.mobile
   ```
3. **Pressione Enter**

Agora você verá **apenas os logs do app TakePips**!

---

### Método 2: Filtrar por Tags Específicas

1. **No campo de filtro do Logcat**, digite:
   ```
   RootLayout|usePushNotifications|NotificationService
   ```
2. **Pressione Enter**

Isso mostra apenas os logs que contêm essas tags.

---

### Método 3: Combinar Filtros

Para ver apenas logs do app E com tags específicas:

1. **No campo de filtro**, digite:
   ```
   package:com.takepips.mobile tag:NotificationService
   ```
2. **Pressione Enter**

---

## 📊 Filtros Úteis

### Ver Apenas Erros do App

```
package:com.takepips.mobile level:error
```

### Ver Apenas Logs de Notificações

```
package:com.takepips.mobile tag:NotificationService
```

### Ver Logs Específicos do App

```
package:com.takepips.mobile RootLayout|usePushNotifications|NotificationService
```

---

## 🎯 O Que Você Deve Ver Após Filtrar

Quando aplicar o filtro `package:com.takepips.mobile`, você deve ver apenas:

```
[RootLayout] ✅ RootLayoutContent renderizado
[usePushNotifications] 🚀 Iniciando registro...
[NotificationService] getExpoPushToken chamado
[NotificationService] Constants.appOwnership: standalone
[NotificationService] ✅ Push token obtido com sucesso
[NotificationService] 📤 Registrando dispositivo no backend...
```

**E NÃO deve ver mais logs de outros apps do sistema!**

---

## 💡 Dicas

1. **Salvar Filtro:**
   - Após criar um filtro, você pode salvá-lo clicando no ícone de **estrela** ao lado do campo de filtro
   - Isso permite reutilizar o filtro facilmente

2. **Limpar Filtro:**
   - Clique no **X** ao lado do campo de filtro para remover o filtro

3. **Múltiplos Filtros:**
   - Você pode combinar filtros usando espaços ou operadores lógicos

---

## 📋 Checklist

- [ ] Logcat aberto
- [ ] Dispositivo selecionado
- [ ] Filtro aplicado: `package:com.takepips.mobile`
- [ ] Apenas logs do app aparecendo
- [ ] App aberto no celular
- [ ] Logs relevantes aparecendo

---

## 🎯 Filtro Recomendado

**Use este filtro para ver tudo do app:**
```
package:com.takepips.mobile
```

**Ou este para ver apenas notificações:**
```
package:com.takepips.mobile RootLayout|usePushNotifications|NotificationService
```

---

Boa sorte! 🚀

