/**
 * Presentation Layer - useSignals Hook
 * 
 * Hook customizado para buscar sinais usando React Query
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getSignalsUseCase, getActiveSignalsUseCase } from '@/shared/config/dependencies';
import { Signal } from '@/domain/models/Signal';

export const signalsKeys = {
  all: ['signals'] as const,
  lists: () => [...signalsKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...signalsKeys.lists(), page, limit] as const,
  active: () => [...signalsKeys.all, 'active'] as const,
  detail: (id: string) => [...signalsKeys.all, 'detail', id] as const,
};

/**
 * Hook para buscar sinais com paginação
 */
export function useSignals(page: number = 1, limit: number = 20) {
  return useQuery<Signal[], Error>({
    queryKey: signalsKeys.list(page, limit),
    queryFn: () => getSignalsUseCase.execute(page, limit),
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // Atualiza a cada minuto
    retry: 1, // Reduzir tentativas para não poluir logs
    retryOnMount: false, // Não tentar novamente ao montar se já falhou
  });
}

/**
 * Hook para buscar sinais com infinite scroll
 */
export function useInfiniteSignals(limit: number = 20) {
  return useInfiniteQuery<Signal[], Error>({
    queryKey: [...signalsKeys.lists(), 'infinite'],
    queryFn: ({ pageParam = 1 }) => getSignalsUseCase.execute(pageParam as number, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < limit) {
        return undefined;
      }
      return allPages.length + 1;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

/**
 * Hook para buscar sinais ativos
 */
export function useActiveSignals() {
  return useQuery<Signal[], Error>({
    queryKey: signalsKeys.active(),
    queryFn: () => getActiveSignalsUseCase.execute(),
    staleTime: 10000, // 10 segundos (mais frequente para sinais ativos)
    refetchInterval: 30000, // Atualiza a cada 30 segundos
    retry: 1, // Reduzir tentativas
    retryOnMount: false,
  });
}
