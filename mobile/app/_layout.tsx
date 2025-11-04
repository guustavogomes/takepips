/**
 * Root Layout - Expo Router
 *
 * Configuração principal do app e providers
 */

import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import { usePushNotifications } from '@/presentation/hooks/usePushNotifications';
import { supabase } from '@/infrastructure/services/supabaseClient';

// Previne que a splash screen esconda automaticamente
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
    },
  },
});

function RootLayoutContent() {
  const [appIsReady, setAppIsReady] = useState(false);
  const router = useRouter();

  // Registrar push notifications automaticamente
  usePushNotifications();

  // Listener para mudanças de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[RootLayout] Auth state changed:', event);

      if (event === 'SIGNED_OUT') {
        // Redirecionar para login quando fizer logout
        router.replace('/(auth)/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        // Tempo mínimo para splash screen (2.5 segundos)
        const minimumSplashTime = 3500;
        const startTime = Date.now();

        // Aqui você pode carregar recursos, fontes, etc
        // Por exemplo: await Font.loadAsync({ ... });
        await new Promise(resolve => setTimeout(resolve, 100));

        // Garante tempo mínimo de splash
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minimumSplashTime - elapsedTime);

        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        setAppIsReady(true);
      } catch (error) {
        console.warn('Erro ao preparar app:', error);
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // Esconde a splash screen com animação suave
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 100);
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // Mantém splash screen visível
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <Toast />
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutContent />
    </QueryClientProvider>
  );
}
