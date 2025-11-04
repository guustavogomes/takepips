# 🏗️ Arquitetura do TakePips Mobile

Este documento explica como os princípios SOLID foram aplicados no aplicativo React Native.

## 📐 Visão Geral da Arquitetura

O projeto segue uma **arquitetura em camadas (Clean Architecture)** com separação clara de responsabilidades:

```
┌─────────────────────────────────────────────┐
│         Presentation Layer (UI)             │
│  • Screens, Components, Hooks                 │
│  • app/index.tsx, app/settings.tsx           │
│  • src/presentation/components/             │
│  • src/presentation/hooks/                  │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│         Application Layer (Use Cases)       │
│  • Business Logic                           │
│  • src/application/useCases/                │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│         Domain Layer (Entities)             │
│  • Models, Repositories Interfaces          │
│  • src/domain/models/                       │
│  • src/domain/repositories/                 │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│    Infrastructure Layer (Data & External)   │
│  • API, NotificationService, Repositories    │
│  • src/infrastructure/api/                  │
│  • src/infrastructure/repositories/         │
│  • src/infrastructure/services/            │
└─────────────────────────────────────────────┘
```

## 🎯 Princípios SOLID Aplicados

### 1. Single Responsibility Principle (SRP)

Cada classe/componente tem uma única responsabilidade:

- ✅ `SignalCard` - Apenas renderiza UI de um sinal
- ✅ `SignalRepository` - Apenas busca dados de sinais
- ✅ `GetSignalsUseCase` - Apenas orquestra a busca de sinais
- ✅ `NotificationService` - Apenas gerencia notificações push

### 2. Open/Closed Principle (OCP)

Interfaces permitem extensão sem modificação:

- ✅ `ISignalRepository` - Interface que pode ser implementada de diferentes formas
- ✅ `INotificationRepository` - Nova implementação pode ser criada sem modificar código existente

**Exemplo:**

```typescript
// Interface base (fechada para modificação)
export interface ISignalRepository {
  getSignals(page: number, limit: number): Promise<Signal[]>;
}

// Implementação padrão
export class SignalRepository implements ISignalRepository {
  // Implementação com API
}

// Nova implementação (aberta para extensão)
export class MockSignalRepository implements ISignalRepository {
  // Implementação mock para testes
}
```

### 3. Liskov Substitution Principle (LSP)

Qualquer implementação pode ser substituída:

```typescript
// Use case aceita qualquer implementação
const useCase = new GetSignalsUseCase(
  new SignalRepository() // Pode ser substituído por MockSignalRepository
);
```

### 4. Interface Segregation Principle (ISP)

Interfaces específicas e focadas:

- ✅ `ISignalRepository` - Apenas operações de Signal
- ✅ `INotificationRepository` - Apenas operações de Notificação
- ❌ Não há interface gigante com múltiplas responsabilidades

### 5. Dependency Inversion Principle (DIP)

Dependências são abstrações:

```typescript
// ✅ CORRETO - Dependência de abstração
export class GetSignalsUseCase {
  constructor(
    private signalRepository: ISignalRepository // Interface, não classe concreta
  ) {}
}

// ❌ ERRADO - Dependência de implementação concreta
export class GetSignalsUseCase {
  constructor(
    private signalRepository: SignalRepository // Classe concreta
  ) {}
}
```

**Injeção de Dependências:**

Centralizada em `src/shared/config/dependencies.ts`:

```typescript
// Criar instâncias
const signalRepository: ISignalRepository = new SignalRepository();
const notificationRepository: INotificationRepository = new NotificationRepository();

// Criar use cases com dependências injetadas
export const getSignalsUseCase = new GetSignalsUseCase(signalRepository);
```

## 🏗️ Estrutura de Camadas

### 1. Domain Layer

**Localização**: `src/domain/`

**Responsabilidades:**
- Definir modelos de dados (`Signal`, `NotificationPreferences`)
- Definir interfaces de repositórios (`ISignalRepository`, `INotificationRepository`)
- Regras de negócio puras

**Características:**
- Não depende de nenhuma outra camada
- Não conhece detalhes de implementação
- Define contratos (interfaces)

**Arquivos:**
- `models/Signal.ts` - Entidade Signal
- `models/NotificationPreferences.ts` - Preferências de notificação
- `repositories/ISignalRepository.ts` - Interface do repositório de sinais
- `repositories/INotificationRepository.ts` - Interface do repositório de notificações

### 2. Application Layer

**Localização**: `src/application/useCases/`

**Responsabilidades:**
- Implementar casos de uso
- Orquestrar fluxo de dados
- Aplicar regras de negócio

**Características:**
- Depende apenas do Domain Layer
- Independente de frameworks
- Testável

**Use Cases:**
- `GetSignalsUseCase` - Buscar sinais
- `GetActiveSignalsUseCase` - Buscar sinais ativos
- `RegisterNotificationUseCase` - Registrar dispositivo
- `GetNotificationPreferencesUseCase` - Buscar preferências
- `SaveNotificationPreferencesUseCase` - Salvar preferências

### 3. Infrastructure Layer

**Localização**: `src/infrastructure/`

**Responsabilidades:**
- Implementar repositórios
- Gerenciar comunicação com API
- Serviços externos (NotificationService)

**Características:**
- Implementa interfaces do Domain Layer
- Contém detalhes técnicos
- Pode ser trocada sem afetar o core

**Arquivos:**
- `api/apiClient.ts` - Cliente HTTP
- `repositories/SignalRepository.ts` - Implementação do repositório de sinais
- `repositories/NotificationRepository.ts` - Implementação do repositório de notificações
- `services/NotificationService.ts` - Serviço de notificações push

### 4. Presentation Layer

**Localização**: `app/` e `src/presentation/`

**Responsabilidades:**
- Componentes UI
- Telas
- Hooks customizados (React Query)
- Lógica de apresentação

**Características:**
- Consome a Application Layer
- Específico do framework (React Native)
- Gerencia estado local

**Arquivos:**
- `app/index.tsx` - Tela principal
- `app/settings.tsx` - Tela de configurações
- `app/_layout.tsx` - Layout raiz
- `components/SignalCard.tsx` - Card de sinal
- `components/LoadingSpinner.tsx` - Indicador de carregamento
- `components/ErrorView.tsx` - View de erro
- `hooks/useSignals.ts` - Hook para buscar sinais
- `hooks/useNotifications.ts` - Hook para notificações

## 🔄 Fluxo de Dados

```
User Interaction (UI)
        ↓
  React Component
        ↓
  Custom Hook (Tanstack Query)
        ↓
     Use Case
        ↓
  Repository Interface
        ↓
  Repository Implementation
        ↓
     API Client
        ↓
    Backend API
```

**Exemplo Prático:**

```typescript
// 1. Usuário interage com a tela
<HomeScreen />

// 2. Hook customizado busca dados
const { data } = useSignals(1, 20);

// 3. Hook usa React Query
useQuery({
  queryFn: () => getSignalsUseCase.execute(1, 20)
});

// 4. Use case executa lógica
class GetSignalsUseCase {
  async execute(page, limit) {
    return this.signalRepository.getSignals(page, limit);
  }
}

// 5. Repository implementa busca
class SignalRepository {
  async getSignals(page, limit) {
    return apiClient.get('/api/signals/list', { page, limit });
  }
}

// 6. API Client faz requisição HTTP
// 7. Backend retorna dados
// 8. Dados fluem de volta para a UI
```

## 🧪 Benefícios da Arquitetura

### 1. Testabilidade

```typescript
// Fácil criar mocks para testes
const mockSignalRepo: ISignalRepository = {
  getSignals: jest.fn().mockResolvedValue([mockSignal]),
};

const useCase = new GetSignalsUseCase(mockSignalRepo);
```

### 2. Manutenibilidade

- Mudanças isoladas em camadas específicas
- Código organizado e previsível
- Fácil encontrar onde fazer alterações

### 3. Escalabilidade

- Adicionar features sem quebrar código existente
- Múltiplas implementações de interfaces
- Fácil trocar tecnologias (ex: trocar Axios por Fetch)

### 4. Reusabilidade

- Use cases podem ser reutilizados
- Componentes desacoplados
- Lógica de negócio independente de UI

## 📚 Recursos

- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://www.digitalocean.com/community/conceptual_articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)
- [React Native Best Practices](https://reactnative.dev/docs/performance)

---

**Nota**: Esta arquitetura foi projetada para crescer. À medida que o projeto evolui, novas camadas e padrões podem ser adicionados mantendo os princípios SOLID.
