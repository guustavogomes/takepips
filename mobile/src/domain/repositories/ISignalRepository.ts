/**
 * Domain Layer - Signal Repository Interface
 * 
 * Seguindo ISP: Interface segregada apenas para operações de Signal
 * Seguindo DIP: Dependência de abstração, não implementação concreta
 */

import { Signal } from '../models/Signal';

export interface ISignalRepository {
  /**
   * Busca todos os sinais com paginação
   */
  getSignals(page: number, limit: number): Promise<Signal[]>;

  /**
   * Busca um sinal por ID
   */
  getSignalById(id: string): Promise<Signal | null>;

  /**
   * Busca sinais ativos (em operação)
   */
  getActiveSignals(): Promise<Signal[]>;

  /**
   * Busca sinais recentes
   */
  getRecentSignals(limit: number): Promise<Signal[]>;
}
