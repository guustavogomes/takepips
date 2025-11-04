# TakePips Mobile - React Native App

Aplicativo React Native elegante e inovador para receber notificações de sinais de trading em tempo real, com foco especial em notificações push para iOS.

## 🏗️ Arquitetura

Este projeto segue os **princípios SOLID** e uma arquitetura em camadas (Clean Architecture):

```
┌─────────────────────────────────────────────┐
│         Presentation Layer (UI)             │
│  • Screens, Components, Hooks               │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│         Application Layer (Use Cases)       │
│  • Business Logic                           │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│         Domain Layer (Entities)             │
│  • Models, Repositories Interfaces          │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│    Infrastructure Layer (Data & External)   │
│  • API, NotificationService, Repositories    │
└─────────────────────────────────────────────┘
```

## 🚀 Tecnologias

- **React Native** com **Expo** - Framework mobile
- **TypeScript** - Tipagem estática
- **Expo Router** - Navegação baseada em arquivos
- **TanStack Query** - Gerenciamento de estado servidor
- **Expo Notifications** - Notificações push nativas
- **Axios** - Cliente HTTP
- **Zod** - Validação de schemas

## 📋 Pré-requisitos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (para Mac) ou dispositivo físico
- Conta no [Expo](https://expo.dev) (opcional, para EAS Build)

## 🔧 Instalação

1. **Instalar dependências:**

```bash
cd mobile
npm install
```

2. **Configurar variáveis de ambiente:**

Crie um arquivo `app.config.js` ou configure no `app.json`:

```javascript
export default {
  expo: {
    // ... outras configurações
    extra: {
      apiUrl: 'https://your-backend-url.vercel.app',
    },
  },
};
```

3. **Iniciar o app:**

```bash
npm start
```

Depois, pressione:
- `i` para iOS Simulator
- `a` para Android Emulator
- Escaneie o QR code com Expo Go no dispositivo físico

## 📱 Funcionalidades

### ✅ Notificações Push para iOS

- **Registro automático** de dispositivo ao iniciar o app
- **Notificações em tempo real** quando sinais são atualizados
- **Configurações personalizáveis** por tipo de evento:
  - Novos sinais
  - Entrada atingida
  - Take 1, 2, 3
  - Stop Loss
- **Som e vibração** configuráveis

### 📊 Visualização de Sinais

- **Lista de sinais** com paginação
- **Sinais ativos** destacados
- **Cards elegantes** com informações detalhadas
- **Pull-to-refresh** para atualizar dados
- **Atualização automática** a cada minuto

### ⚙️ Configurações

- **Preferências de notificação** por tipo de evento
- **Som e vibração** independentes
- **Interface intuitiva** e moderna

## 🏛️ Estrutura de Pastas

```
mobile/
├── app/                    # Expo Router (telas)
│   ├── _layout.tsx        # Layout raiz
│   ├── index.tsx          # Tela principal
│   └── settings.tsx       # Tela de configurações
├── src/
│   ├── domain/            # Domain Layer
│   │   ├── models/        # Entidades
│   │   └── repositories/  # Interfaces de repositório
│   ├── application/       # Application Layer
│   │   └── useCases/     # Casos de uso
│   ├── infrastructure/    # Infrastructure Layer
│   │   ├── api/          # Cliente API
│   │   ├── repositories/ # Implementações de repositório
│   │   └── services/     # Serviços (NotificationService)
│   ├── presentation/      # Presentation Layer
│   │   ├── components/   # Componentes React
│   │   └── hooks/        # Hooks customizados
│   └── shared/           # Código compartilhado
│       ├── config/       # Configurações (DI)
│       └── constants/    # Constantes (theme)
└── assets/               # Imagens, ícones, etc.
```

## 🎯 Princípios SOLID Aplicados

### 1. Single Responsibility Principle (SRP)
- Cada classe tem uma única responsabilidade
- `SignalCard` apenas renderiza UI
- `SignalRepository` apenas busca dados
- `GetSignalsUseCase` apenas orquestra busca

### 2. Open/Closed Principle (OCP)
- Interfaces (`ISignalRepository`) permitem extensão
- Novas implementações podem ser criadas sem modificar código existente

### 3. Liskov Substitution Principle (LSP)
- Qualquer implementação de `ISignalRepository` pode ser usada
- `SignalRepository` pode ser substituído por `MockSignalRepository` em testes

### 4. Interface Segregation Principle (ISP)
- Interfaces segregadas (`ISignalRepository`, `INotificationRepository`)
- Clientes não dependem de métodos que não usam

### 5. Dependency Inversion Principle (DIP)
- Use cases dependem de abstrações (interfaces)
- Injeção de dependências em `src/shared/config/dependencies.ts`

## 📡 Integração com Backend

O app se conecta ao backend através da API REST:

- `GET /api/signals/list` - Lista sinais
- `GET /api/signals/:id` - Busca sinal por ID
- `POST /api/push/subscribe` - Registra dispositivo para notificações
- `POST /api/push/unsubscribe` - Remove registro do dispositivo

## 🔔 Configuração de Notificações iOS

### 1. Configurar EAS Build (Expo Application Services)

```bash
npm install -g eas-cli
eas login
eas build:configure
```

### 2. Configurar Push Notifications

No `app.json`, configure o `projectId` do EAS:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### 3. Gerar Certificados iOS

```bash
eas credentials
```

### 4. Build e Deploy

```bash
# Build para iOS
eas build --platform ios

# Build para produção
eas build --platform ios --profile production
```

## 🧪 Desenvolvimento

### Scripts Disponíveis

```bash
npm start          # Inicia o servidor de desenvolvimento
npm run ios        # Inicia no iOS Simulator
npm run android    # Inicia no Android Emulator
npm run web        # Inicia no navegador
npm run lint       # Executa linter
npm run type-check # Verifica tipos TypeScript
```

### Testes

Para testar notificações:

1. Execute o app em um dispositivo físico (iOS)
2. Permita notificações quando solicitado
3. O app registrará automaticamente o dispositivo
4. Teste enviando notificações do backend

## 📚 Documentação

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Native](https://reactnative.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- Veja também: `ARQUITETURA.md` e `SETUP.md`

## 🎨 Design

O app usa um tema escuro moderno com:

- **Cores principais**: Azul (#4A90E2) para ações, Verde (#2ECC71) para sucesso
- **Fundo escuro**: (#0A0E27) para reduzir fadiga visual
- **Cards elegantes**: Com bordas arredondadas e sombras sutis
- **Tipografia clara**: Hierarquia visual bem definida

## 📝 Licença

Este projeto faz parte do TakePips e segue a mesma licença do projeto principal.