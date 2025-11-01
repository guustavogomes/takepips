# 🚀 Setup Local - TakePips Backend

Guia completo para configurar e testar o backend localmente.

## 📋 Pré-requisitos

1. Node.js 18+ instalado
2. Conta no [Neon](https://neon.tech) (gratuito)
3. npm ou yarn instalado

## 🔧 Passo a Passo

### 1. Instalar Dependências

```bash
npm install
```

### 2. Criar Projeto no Neon

1. Acesse [https://console.neon.tech](https://console.neon.tech)
2. Faça login ou crie uma conta
3. Clique em "Create a project"
4. Escolha um nome para o projeto (ex: "takepips")
5. Selecione a região mais próxima
6. Clique em "Create project"

### 3. Obter Connection String

1. No dashboard do Neon, clique em "Connection Details"
2. Copie a connection string (formato: `postgresql://user:password@host/database`)
3. **Importante**: Adicione `?sslmode=require` no final se não estiver presente
   - Exemplo completo: `postgresql://user:pass@host.neon.tech/db?sslmode=require`

### 4. Executar Schema no Banco

**Opção A: Via SQL Editor do Neon**

1. No console do Neon, vá em "SQL Editor"
2. Abra o arquivo `src/infrastructure/database/schema.sql`
3. Copie todo o conteúdo
4. Cole no SQL Editor
5. Clique em "Run"

**Opção B: Via linha de comando**

```bash
# Instalar psql se não tiver
# Windows: Baixe do site oficial do PostgreSQL
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql-client

# Execute o schema
psql "SUA_CONNECTION_STRING_AQUI" -f src/infrastructure/database/schema.sql
```

### 5. Configurar Arquivo .env

1. Copie a connection string do Neon
2. Abra o arquivo `.env` na raiz do projeto
3. Cole a connection string no campo `DATABASE_URL`:

```env
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require
NODE_ENV=development
```

**⚠️ IMPORTANTE**: 
- Substitua `user`, `password`, `host`, `database` pelos valores reais do Neon
- Mantenha `?sslmode=require` no final
- O arquivo `.env` já está no `.gitignore`, então não será commitado

### 6. Testar Localmente

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### 7. Testar o Endpoint

**Usando cURL:**

```bash
curl -X POST http://localhost:3000/api/signals \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TakePips",
    "type": "BUY",
    "symbol": "XAUUSD",
    "entry": 2385.15,
    "stopLoss": 2380.00,
    "take1": 2395.00,
    "take2": 2395.00,
    "take3": 2395.00,
    "stopTicks": 515,
    "time": "2025.10.31 22:40:02"
  }'
```

**Usando Postman ou Insomnia:**

- URL: `POST http://localhost:3000/api/signals`
- Headers: `Content-Type: application/json`
- Body (JSON):
```json
{
  "name": "TakePips",
  "type": "BUY",
  "symbol": "XAUUSD",
  "entry": 2385.15,
  "stopLoss": 2380.00,
  "take1": 2395.00,
  "take2": 2395.00,
  "take3": 2395.00,
  "stopTicks": 515,
  "time": "2025.10.31 22:40:02"
}
```

**Resposta esperada (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-aqui",
    "name": "TakePips",
    "type": "BUY",
    "symbol": "XAUUSD",
    "entry": 2385.15,
    "stopLoss": 2380.00,
    "take1": 2395.00,
    "take2": 2395.00,
    "take3": 2395.00,
    "stopTicks": 515,
    "time": "2025-10-31T22:40:02.000Z",
    "createdAt": "2025-10-31T22:40:02.000Z"
  }
}
```

### 8. Verificar no Banco

No console do Neon:
1. Vá em "SQL Editor"
2. Execute:
```sql
SELECT * FROM signals ORDER BY created_at DESC LIMIT 10;
```

Você deve ver os sinais que foram criados!

## 🔍 Solução de Problemas

### Erro: "DATABASE_URL não está configurada"

- Verifique se o arquivo `.env` existe na raiz do projeto
- Verifique se a variável está escrita corretamente: `DATABASE_URL=...`
- Reinicie o servidor após criar/editar o `.env`

### Erro de conexão com o banco

- Verifique se a connection string está correta
- Verifique se adicionou `?sslmode=require` no final
- Verifique se o projeto Neon está ativo (não pausado)
- Verifique se o schema foi executado corretamente

### Erro 404 na rota

- Certifique-se de que o servidor está rodando (`npm run dev`)
- Verifique se está usando a URL correta: `http://localhost:3000/api/signals`
- Verifique se o método é POST

### Erro de validação

- Verifique se todos os campos obrigatórios estão presentes
- Verifique os tipos de dados (números devem ser números, não strings)
- Verifique o formato da data: `YYYY.MM.DD HH:MM:SS`

## ✅ Checklist de Setup

- [ ] Node.js 18+ instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Projeto criado no Neon
- [ ] Schema executado no banco
- [ ] Arquivo `.env` configurado com `DATABASE_URL`
- [ ] Servidor rodando (`npm run dev`)
- [ ] Teste do endpoint funcionando
- [ ] Dados aparecendo no banco

## 📝 Próximos Passos

Após testar localmente:
1. Configure a variável `DATABASE_URL` na Vercel
2. Faça o deploy
3. Atualize a URL no indicador MT5

