# 📱 Guia do Menu Sofisticado - TakePips Mobile

## 🎯 Visão Geral

O TakePips Mobile possui um menu de navegação sofisticado com 5 tabs principais, cada uma com funcionalidades específicas focadas em trading de GOLD.

## 📋 Estrutura das Tabs

### 1️⃣ Home (🏠)
**Arquivo**: `app/(tabs)/home.tsx`

**Funcionalidades**:
- Vídeos educacionais do YouTube
- Estatísticas rápidas (vídeos, precisão, alunos)
- Cards de vídeos categorizados
- Pull to refresh

**Como personalizar**:
```typescript
// Adicione seus próprios vídeos do YouTube
const VIDEOS: VideoData[] = [
  {
    id: 'SEU_VIDEO_ID_AQUI', // ID do vídeo do YouTube
    title: 'Título do vídeo',
    description: 'Descrição...',
    category: 'tutorial', // 'tutorial' | 'analysis' | 'strategy'
  },
];
```

**Obter ID do vídeo do YouTube**:
- URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- ID: `dQw4w9WgXcQ` (parte após `v=`)

---

### 2️⃣ Educação (📚)
**Arquivo**: `app/(tabs)/education.tsx`

**Funcionalidades**:
- Biblioteca de e-books sobre Forex
- Filtros por nível (Iniciante/Intermediário/Avançado)
- Sistema de conteúdo gratuito e premium
- Download de materiais

**Como adicionar e-books**:
```typescript
const EBOOKS: Ebook[] = [
  {
    id: 1,
    title: 'Nome do E-book',
    author: 'Autor',
    description: 'Descrição detalhada...',
    pages: 120,
    level: 'beginner', // 'beginner' | 'intermediate' | 'advanced'
    category: 'Categoria',
    downloadUrl: 'https://...', // URL opcional para download
    isPremium: false, // true para conteúdo premium
  },
];
```

**Implementar download real**:
```typescript
// Em handleDownload(), adicione:
if (ebook.downloadUrl) {
  Linking.openURL(ebook.downloadUrl);
}
```

---

### 3️⃣ Sinais (📊) - Tab Central
**Arquivo**: `app/(tabs)/index.tsx`

**Posição**: Centro da tab bar (destacada)
**Ícone**: Maior que os outros
**Funcionalidade**: Tela principal de sinais de trading

Esta é a tela existente que você já tinha. Mantive como está.

---

### 4️⃣ Ferramentas (🛠️)
**Arquivo**: `app/(tabs)/tools.tsx`

**Funcionalidades**:
- Calculadora de Lote (funcional)
- Calculadora de Lucro
- Calculadora de Pip
- Calculadora de Margem
- Fibonacci Retracement
- Pontos de Pivot
- Recursos adicionais (Calendário, Horários, Conversor)

**Calculadora de Lote**:
Já está funcional! Usa a fórmula:
```
Tamanho do Lote = (Saldo × Risco%) / (Stop Loss em pips × Valor do pip)
```

**Adicionar mais calculadoras**:
```typescript
// Adicione ao array TOOLS
{
  id: 'nova-calculadora',
  title: 'Nova Calculadora',
  description: 'Descrição...',
  icon: 'calculator', // Nome do ícone do Ionicons
  color: '#10b981',
}

// Crie o renderizador correspondente
const renderNovaCalculadora = () => {
  // Implementação...
};
```

---

### 5️⃣ Perfil (👤)
**Arquivo**: `app/(tabs)/profile.tsx`

**Funcionalidades**:
- Avatar customizável
- Estatísticas do trader (taxa de acerto, ROI, sinais)
- Configurações (Notificações, Tema, Idioma, Sons)
- Suporte e ajuda
- Logout

**Como conectar com dados reais**:
```typescript
// Use React Query ou Context para dados do usuário
import { useUser } from '@/hooks/useUser';

const { user, stats } = useUser();

<Text>{user.name}</Text>
<Text>{stats.winRate}%</Text>
```

---

## 🎨 Personalização de Cores

Todas as telas usam o tema GOLD consistente:

```typescript
const COLORS = {
  gold: '#FFD700',        // Dourado principal
  goldMedium: '#FDB931',  // Dourado médio
  goldDark: '#DAA520',    // Dourado escuro
  
  bgPrimary: '#0A0E27',   // Background principal
  bgSecondary: '#0f1419', // Cards e containers
  bgTertiary: '#1a1f2e',  // Borders
  
  textPrimary: '#FFFFFF', // Texto principal
  textSecondary: '#9CA3AF', // Texto secundário
  textTertiary: '#6B7280',  // Texto terciário
  
  success: '#10b981',     // Verde (lucro)
  danger: '#ef4444',      // Vermelho (perda)
  info: '#6366f1',        // Azul (info)
};
```

---

## 🔧 Configuração da Tab Bar

**Arquivo**: `app/(tabs)/_layout.tsx`

**Alterar ícones**:
```typescript
<Tabs.Screen
  name="home"
  options={{
    tabBarIcon: ({ color, focused }) => (
      <Ionicons 
        name={focused ? 'home' : 'home-outline'} 
        size={24} 
        color={color} 
      />
    ),
  }}
/>
```

**Ícones disponíveis**:
- Procure em: https://icons.expo.fyi/
- Bibliotecas: Ionicons, MaterialCommunityIcons, FontAwesome5

**Alterar cores**:
```typescript
tabBarActiveTintColor: '#FFD700',    // Cor quando ativo
tabBarInactiveTintColor: '#6B7280',  // Cor quando inativo
```

---

## 📦 Dependências Necessárias

```bash
# Já instaladas:
npm install react-native-youtube-iframe

# Para adicionar mais recursos:
npm install react-native-webview  # Necessário para YouTube
npm install @react-native-async-storage/async-storage  # Cache local
```

---

## 🚀 Executar o App

```bash
cd mobile
npx expo start --clear

# Opções:
# - Pressione 'a' para Android
# - Pressione 'i' para iOS
# - Escaneie QR code com Expo Go
```

---

## 💡 Dicas de Desenvolvimento

### Pull to Refresh
Já implementado na Home. Para adicionar em outras telas:
```typescript
const [refreshing, setRefreshing] = useState(false);

<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="#FFD700"
    />
  }
>
```

### Navegação Programática
```typescript
import { router } from 'expo-router';

router.push('/profile');
router.replace('/home');
router.back();
```

### Estado Global
Considere usar React Context ou Zustand para estado compartilhado:
```typescript
// hooks/useTheme.ts
export const useTheme = () => {
  const [theme, setTheme] = useState('dark');
  return { theme, setTheme };
};
```

---

## 🐛 Troubleshooting

### Vídeos do YouTube não carregam
- Certifique-se de que o ID do vídeo está correto
- Verifique se `react-native-webview` está instalado
- Em iOS, adicione permissões no Info.plist

### Ícones não aparecem
- Verifique se `@expo/vector-icons` está instalado
- Use nomes corretos: https://icons.expo.fyi/

### Tabs não aparecem
- Limpe o cache: `npx expo start --clear`
- Verifique erros no console
- Certifique-se de que todos os arquivos estão em `app/(tabs)/`

---

## 📚 Recursos Adicionais

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [React Navigation](https://reactnavigation.org/docs/tab-based-navigation)
- [Expo Vector Icons](https://icons.expo.fyi/)
- [React Native YouTube iframe](https://www.npmjs.com/package/react-native-youtube-iframe)

---

**Última atualização**: 2025-11-03
**Versão**: 1.0.0
