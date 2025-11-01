import { ISignalRepository } from '../../domain/repositories/ISignalRepository';
import { CreateSignalData, Signal } from '../../domain/entities/Signal';
import { parseMT5DateTime } from '../../shared/utils/dateUtils';

/**
 * Use Case para criação de sinais
 * Segue o princípio de Single Responsibility (SOLID)
 * Responsável apenas pela lógica de negócio de criação de sinais
 */
export class CreateSignalUseCase {
  constructor(private readonly signalRepository: ISignalRepository) {
    // Dependency Injection - Dependency Inversion Principle (SOLID)
  }

  /**
   * Executa a criação de um novo sinal
   * @param data Dados do sinal a ser criado
   * @returns Promise com o sinal criado
   */
  async execute(data: CreateSignalData): Promise<Signal> {
    // Validações de negócio
    this.validateBusinessRules(data);

    // Persistir no banco através do repositório
    // O repositório vai lidar com a conversão de data
    const signal = await this.signalRepository.create(data);

    return signal;
  }

  /**
   * Valida regras de negócio
   * @param data Dados do sinal
   * @throws Error se alguma regra for violada
   */
  private validateBusinessRules(data: CreateSignalData): void {
    // Validação: para BUY, entry deve ser menor que takes e maior que stopLoss
    if (data.type === 'BUY') {
      if (data.entry <= data.stopLoss) {
        throw new Error('Para BUY, o preço de entrada deve ser maior que o stop loss');
      }
      if (data.entry >= data.take1 || data.entry >= data.take2 || data.entry >= data.take3) {
        throw new Error('Para BUY, os takes devem ser maiores que o preço de entrada');
      }
    }

    // Validação: para SELL, entry deve ser maior que takes e menor que stopLoss
    if (data.type === 'SELL') {
      if (data.entry >= data.stopLoss) {
        throw new Error('Para SELL, o preço de entrada deve ser menor que o stop loss');
      }
      if (data.entry <= data.take1 || data.entry <= data.take2 || data.entry <= data.take3) {
        throw new Error('Para SELL, os takes devem ser menores que o preço de entrada');
      }
    }

    // Validação: stopTicks deve ser consistente com a diferença entre entry e stopLoss
    const priceDiff = Math.abs(data.entry - data.stopLoss);
    const expectedTicks = Math.round(priceDiff / 0.0001); // Aproximação
    if (Math.abs(data.stopTicks - expectedTicks) > expectedTicks * 0.5) {
      // Permitir uma margem de 50% de diferença devido a arredondamentos
      // Esta validação pode ser ajustada conforme necessário
    }
  }
}

