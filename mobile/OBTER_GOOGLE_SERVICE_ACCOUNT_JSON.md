# 🔑 Como Obter Google Service Account JSON para FCM V1

## 🎯 Situação

O EAS está pedindo um arquivo JSON do Google Service Account. Você precisa criar esse arquivo no Firebase Console.

---

## 🚀 Passo a Passo Completo

### Passo 1: Acessar Firebase Console

1. Acesse: https://console.firebase.google.com/
2. **Selecione seu projeto** (ou crie um novo se não tiver)

### Passo 2: Ir para Configurações do Projeto

1. Clique no **ícone de engrenagem** ⚙️ ao lado de "Visão geral do projeto"
2. Ou clique em **"Configurações do projeto"**

### Passo 3: Ir para Contas de Serviço

1. Na página de configurações, vá na aba **"Contas de serviço"** (Service accounts)
2. Se não aparecer, procure por **"Service accounts"** ou **"IAM & Admin"**

### Passo 4: Criar Conta de Serviço

1. Clique em **"Gerar nova chave privada"** (Generate new private key)
   - Ou **"Criar conta de serviço"** se não tiver nenhuma
2. Se pedir nome da conta: use `takepips-fcm` ou qualquer nome
3. Se pedir função: escolha **"Editor"** ou **"Firebase Cloud Messaging Admin"**
4. Clique em **"Criar"** ou **"Gerar chave"**

### Passo 5: Baixar Arquivo JSON

1. O navegador vai **baixar automaticamente** um arquivo JSON
2. O arquivo terá um nome como: `takepips-xxxxx-xxxxx.json`
3. **Anote onde o arquivo foi salvo** (geralmente na pasta Downloads)

### Passo 6: Voltar ao EAS

1. **Volte ao terminal** onde está rodando `eas credentials`
2. **Digite o caminho completo** do arquivo JSON

**Exemplos de caminho:**
- Windows: `C:\Users\gusta\Downloads\takepips-xxxxx-xxxxx.json`
- Ou arraste o arquivo para o terminal (alguns terminais copiam o caminho)

---

## 📋 Caminho Alternativo (Se Não Encontrar)

### Opção A: Via Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. **Selecione o projeto Firebase** (ou crie um)
3. Vá em **IAM & Admin** > **Service Accounts**
4. Clique em **"Criar conta de serviço"**
5. Nome: `takepips-fcm`
6. Função: **"Firebase Cloud Messaging Admin"** ou **"Editor"**
7. Clique em **"Criar e continuar"**
8. Clique em **"Concluir"**
9. Clique na conta criada
10. Vá na aba **"Chaves"**
11. Clique em **"Adicionar chave"** > **"Criar nova chave"**
12. Escolha **JSON**
13. Clique em **"Criar"**
14. O arquivo será baixado

### Opção B: Usar Caminho Relativo

Se o arquivo estiver na pasta do projeto:

1. **Mova o arquivo JSON** para a pasta `mobile/`
2. **Digite apenas o nome do arquivo** no EAS:
   ```
   takepips-xxxxx-xxxxx.json
   ```

---

## ✅ Após Inserir o Caminho

O EAS vai:
- ✅ Validar o arquivo
- ✅ Fazer upload das credenciais
- ✅ Configurar FCM V1 automaticamente

Você verá mensagens como:
```
✓ Google Service Account key validated
✓ Uploaded credentials to EAS
✓ FCM V1 credentials configured successfully
```

---

## 🎯 Resumo Rápido

1. ✅ Acesse: https://console.firebase.google.com/
2. ✅ Vá em **Configurações** > **Contas de serviço**
3. ✅ Clique em **"Gerar nova chave privada"**
4. ✅ Baixe o arquivo JSON
5. ✅ Volte ao terminal e digite o caminho completo do arquivo
6. ✅ Pressione Enter

---

## 💡 Dica: Encontrar o Arquivo Baixado

Se não souber onde o arquivo foi salvo:

1. **Abra o navegador** (Chrome/Edge)
2. Pressione **Ctrl+J** para ver downloads
3. **Clique com botão direito** no arquivo JSON
4. **Escolha "Mostrar na pasta"** ou "Abrir local do arquivo"
5. **Copie o caminho completo** da barra de endereços

---

## 📝 Exemplo de Caminho Completo

**Windows:**
```
C:\Users\gusta\Downloads\takepips-xxxxx-xxxxx.json
```

**No terminal do EAS, digite:**
```
C:\Users\gusta\Downloads\takepips-xxxxx-xxxxx.json
```

---

Boa sorte! 🚀

