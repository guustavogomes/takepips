/**
 * Presentation Layer - useAuth Hook
 * 
 * Hook para gerenciar autenticação
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RegisterData, LoginData, AuthResponse } from '@/domain/models/User';
import { authRepository, registerUseCase, loginUseCase } from '@/shared/config/dependencies';

export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

/**
 * Hook para fazer login
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, LoginData>({
    mutationFn: (data) => loginUseCase.execute(data),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user(), data.user);
    },
  });
}

/**
 * Hook para registrar usuário
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, RegisterData>({
    mutationFn: (data) => registerUseCase.execute(data),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user(), data.user);
    },
  });
}

/**
 * Hook para obter usuário atual
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      try {
        return await authRepository.getCurrentUser();
      } catch (error) {
        console.error('[useCurrentUser] Error:', error);
        return null; // Retornar null em caso de erro para não travar
      }
    },
    staleTime: Infinity,
    retry: 1, // Apenas 1 tentativa
    retryDelay: 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
