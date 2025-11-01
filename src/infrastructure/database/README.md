# Configuração do Banco de Dados

## Setup no Neon

1. Acesse [Neon Console](https://console.neon.tech)
2. Crie um novo projeto
3. Copie a connection string
4. Configure a variável de ambiente `DATABASE_URL` na Vercel ou no `.env.local`

## Executar Schema

1. Acesse o SQL Editor no console do Neon
2. Copie o conteúdo do arquivo `schema.sql`
3. Execute no SQL Editor

Ou use a connection string diretamente:

```bash
psql $DATABASE_URL -f src/infrastructure/database/schema.sql
```

## Estrutura da Tabela

A tabela `signals` armazena:
- Informações do sinal (nome, tipo, símbolo)
- Preços (entry, stop loss, takes)
- Metadados (timestamps, stop ticks)

Índices foram criados para otimizar consultas por:
- Símbolo
- Tipo
- Data/hora
- Combinação símbolo + data

