/**
 * Hook para gerenciar loading durante navegação
 */

import { useEffect, useState } from 'react';
import { usePathname } from 'expo-router';

export function useNavigationLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Mostra loading ao mudar de rota
    setIsLoading(true);

    // Esconde após um pequeno delay (transição)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  return isLoading;
}
