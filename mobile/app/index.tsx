/**
 * Root Index - Verifica autenticação e redireciona
 *
 * Verifica sessão persistida do Supabase antes de redirecionar
 */

import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { supabase } from '@/infrastructure/services/supabaseClient';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Verificar sessão persistida do Supabase
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        console.log('[Index] Sessão encontrada, usuário autenticado');
        setIsAuthenticated(true);
      } else {
        console.log('[Index] Nenhuma sessão encontrada');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('[Index] Erro ao verificar sessão:', error);
      setIsAuthenticated(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Mostrar loading enquanto verifica
  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  // Redirecionar baseado na autenticação
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/splash" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
