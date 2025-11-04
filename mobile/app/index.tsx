/**
 * Root Index - Redireciona baseado no estado de autenticação
 */

import { Redirect } from 'expo-router';
import { useCurrentUser } from '@/presentation/hooks/useAuth';

export default function Index() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return null; // Mostrar splash enquanto carrega
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/splash" />;
}
