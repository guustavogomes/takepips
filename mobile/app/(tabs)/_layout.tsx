/**
 * Tabs Layout - Menu Sofisticado TakePips
 *
 * 5 Tabs: Home | Educação | Sinais (Centro) | Ferramentas | Perfil
 */

import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingChart } from '@/presentation/components/LoadingChart';
import { useNavigationLoading } from '@/presentation/hooks/useNavigationLoading';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const isLoading = useNavigationLoading();

  return (
    <>
      {isLoading && <LoadingChart />}
      <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0A0E27',
          borderBottomWidth: 1,
          borderBottomColor: '#FFD700',
        },
        headerTintColor: '#FFD700',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        tabBarStyle: {
          backgroundColor: '#0f1419',
          borderTopWidth: 1,
          borderTopColor: '#1a1f2e',
          height: Platform.OS === 'ios' ? 88 : 65 + insets.bottom,
          paddingBottom: Platform.OS === 'ios' ? 28 : Math.max(insets.bottom, 8),
          paddingTop: 8,
          elevation: 20,
          shadowColor: '#FFD700',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      {/* Home - Vídeos do YouTube */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerTitle: '🏠 TakePips',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Educação - E-books (Desabilitado temporariamente) */}
      <Tabs.Screen
        name="education"
        options={{
          href: null, // Esconde da navegação
        }}
      />

      {/* Sinais - Centro (Principal) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Sinais',
          headerTitle: '📊 Sinais GOLD',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'finance' : 'chart-line'}
              size={28}
              color={color}
            />
          ),
          tabBarIconStyle: {
            marginTop: -5,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: 'bold',
            marginTop: 0,
          },
        }}
      />

      {/* Ferramentas (Desabilitado temporariamente) */}
      <Tabs.Screen
        name="tools"
        options={{
          href: null, // Esconde da navegação
        }}
      />

      {/* Perfil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerTitle: '👤 Meu Perfil',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5
              name="user-circle"
              size={22}
              color={color}
              solid={focused}
            />
          ),
        }}
      />

      {/* Remover settings antiga */}
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // Esconde da navegação
        }}
      />
    </Tabs>
    </>
  );
}