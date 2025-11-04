/**
 * Tabs Layout - Layout principal com abas
 */

import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0A0E27',
        },
        headerTintColor: '#FFFFFF',
        tabBarStyle: {
          backgroundColor: '#1A1F3A',
          borderTopColor: '#2A2F4A',
        },
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Sinais',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}