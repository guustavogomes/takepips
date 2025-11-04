/**
 * Infrastructure Layer - Signal Repository Implementation
 * 
 * Implementação concreta de ISignalRepository
 * Seguindo LSP: Pode ser substituída por qualquer implementação de ISignalRepository
 */

import { ISignalRepository } from '@/domain/repositories/ISignalRepository';
import { Signal, SignalDTO, signalFromDTO } from '@/domain/models/Signal';
import { apiClient } from '../api/apiClient';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code: string;
  };
}

export class SignalRepository implements ISignalRepository {
  async getSignals(page: number, limit: number): Promise<Signal[]> {
    try {
      // Converter page para offset (API espera offset)
      const offset = (page - 1) * limit;
      const response = await apiClient.get<ApiResponse<SignalDTO[]>>(
        '/api/signals/list',
        { limit, offset }
      );

      if (!response.success || !response.data) {
        return [];
      }

      return response.data.map(signalFromDTO);
    } catch (error) {
      console.error('[SignalRepository] Error fetching signals:', error);
      // Retornar array vazio em caso de erro para não quebrar a UI
      return [];
    }
  }

  async getSignalById(id: string): Promise<Signal | null> {
    try {
      const response = await apiClient.get<ApiResponse<SignalDTO>>(
        `/api/signals/${id}`
      );

      if (!response.success || !response.data) {
        return null;
      }

      return signalFromDTO(response.data);
    } catch (error) {
      console.error('[SignalRepository] Error fetching signal by id:', error);
      return null;
    }
  }

  async getActiveSignals(): Promise<Signal[]> {
    try {
      // Buscar todos os sinais e filtrar apenas os ativos
      const response = await apiClient.get<ApiResponse<SignalDTO[]>>(
        '/api/signals/list',
        { limit: 100, offset: 0 }
      );

      if (!response.success || !response.data) {
        return [];
      }

      // Filtrar apenas sinais em operação
      const activeSignals = response.data.filter(
        (signal) => signal.status === 'EM_OPERACAO'
      );

      return activeSignals.map(signalFromDTO);
    } catch (error) {
      console.error('[SignalRepository] Error fetching active signals:', error);
      return [];
    }
  }

  async getRecentSignals(limit: number): Promise<Signal[]> {
    return this.getSignals(1, limit);
  }
}
