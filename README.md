# TakePips Backend

Backend para receber e armazenar sinais de trading enviados pelo indicador TakePips do MetaTrader 5.

## 🏗️ Arquitetura

Este projeto segue os princípios **SOLID** e uma arquitetura em camadas:

- **Domain**: Entidades e interfaces (regras de negócio)
- **Application**: Use Cases (lógica de aplicação)
- **Infrastructure**: Implementações concretas (banco de dados, repositórios)
- **Presentation**: Controllers e rotas HTTP
- **Shared**: Utilitários, validadores, tipos compartilhados

## 🚀 Tecnologias

- **TypeScript**: Tipagem estática
- **Vercel**: Hospedagem serverless
- **Neon**: Banco de dados PostgreSQL
- **Zod**: Validação de schemas

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta no [Vercel](https://vercel.com)
- Conta no [Neon](https://neon.tech)
- npm ou yarn

## 🔧 Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar banco de dados Neon

1. Crie um projeto no [Neon](https://console.neon.tech)
2. Copie a connection string do banco
3. Execute o schema SQL no banco:

```bash
# Copie o conteúdo de src/infrastructure/database/schema.sql
# E execute no console SQL do Neon
```

### 3. Configurar variáveis de ambiente

Na Vercel:
- Vá em Settings → Environment Variables
- Adicione: `DATABASE_URL` com a connection string do Neon

Para desenvolvimento local, crie um arquivo `.env.local`:

```env
DATABASE_URL=postgresql://user:password@host/database
```

## 🚀 Deploy

### Deploy na Vercel

1. Conecte seu repositório GitHub à Vercel
2. Configure a variável de ambiente `DATABASE_URL`
3. Deploy automático será feito em cada push

### Deploy local (desenvolvimento)

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## 📡 Endpoints

### POST /api/signals

Recebe um sinal de trading do indicador MT5.

**Request Body:**

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

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
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

**Response Error (400 Bad Request):**

```json
{
  "success": false,
  "error": {
    "message": "Mensagem de erro",
    "code": "VALIDATION_ERROR"
  }
}
```

## 🧪 Desenvolvimento

### Scripts disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Compila TypeScript
npm run type-check   # Verifica tipos sem compilar
npm run lint         # Executa linter
```

### Estrutura de pastas

```
takepips/
├── api/                    # Rotas Vercel
│   └── signals.ts
├── src/
│   ├── domain/             # Camada de domínio
│   │   ├── entities/       # Entidades
│   │   └── repositories/   # Interfaces de repositório
│   ├── application/         # Camada de aplicação
│   │   └── useCases/       # Casos de uso
│   ├── infrastructure/      # Camada de infraestrutura
│   │   ├── database/       # Conexão e schema
│   │   └── repositories/   # Implementações de repositório
│   ├── presentation/        # Camada de apresentação
│   │   └── controllers/    # Controllers HTTP
│   └── shared/              # Código compartilhado
│       ├── errors/         # Classes de erro
│       ├── types/          # Tipos TypeScript
│       ├── utils/          # Utilitários
│       └── validators/     # Validadores
├── package.json
├── tsconfig.json
└── vercel.json
```

## 🔒 Princípios SOLID Aplicados

1. **Single Responsibility**: Cada classe tem uma única responsabilidade
2. **Open/Closed**: Extensível sem modificar código existente (via interfaces)
3. **Liskov Substitution**: Implementações podem ser substituídas via interfaces
4. **Interface Segregation**: Interfaces específicas e coesas
5. **Dependency Inversion**: Dependências de abstrações, não de implementações

## 📝 Licença

MIT

