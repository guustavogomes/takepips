/**
 * Application Layer - Get Active Signals Use Case
 * 
 * Seguindo SRP: Apenas busca sinais ativos
 */

import { ISignalRepository } from '@/domain/repositories/ISignalRepository';
import { Signal } from '@/domain/models/Signal';

export class GetActiveSignalsUseCase {
  constructor(
    private signalRepository: ISignalRepository
  ) {}

  async execute(): Promise<Signal[]> {
    return this.signalRepository.getActiveSignals();
  }
}
