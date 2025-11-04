/**
 * Root Index - Redireciona sempre para splash
 * 
 * O splash screen é responsável por verificar autenticação e redirecionar
 */

import { Redirect } from 'expo-router';

export default function Index() {
  // Sempre redirecionar para splash, que gerencia a lógica de autenticação
  return <Redirect href="/(auth)/splash" />;
}
