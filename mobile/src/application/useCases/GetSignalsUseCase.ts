/**
 * Application Layer - Get Signals Use Case
 * 
 * Seguindo SRP: Apenas busca sinais
 * Seguindo DIP: Depende de abstração (ISignalRepository)
 */

import { ISignalRepository } from '@/domain/repositories/ISignalRepository';
import { Signal } from '@/domain/models/Signal';

export class GetSignalsUseCase {
  constructor(
    private signalRepository: ISignalRepository
  ) {}

  /**
   * Executa a busca de sinais com paginação
   */
  async execute(page: number = 1, limit: number = 20): Promise<Signal[]> {
    if (page < 1) {
      throw new Error('Page must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    return this.signalRepository.getSignals(page, limit);
  }
}
