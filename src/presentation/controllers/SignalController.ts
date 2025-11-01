import { VercelRequest, VercelResponse } from '@vercel/node';
import { CreateSignalUseCase } from '../../application/useCases/CreateSignalUseCase';
import { validateSignalData } from '../../shared/validators/signalValidator';
import { handleError } from '../../shared/utils/errorHandler';
import { ApiResponse } from '../../shared/types/ApiResponse';
import { CreateSignalData } from '../../domain/entities/Signal';

/**
 * Controller para gerenciar requisições relacionadas a sinais
 * Segue o princípio de Single Responsibility (SOLID)
 * Responsável apenas por lidar com requisições HTTP
 */
export class SignalController {
  constructor(private readonly createSignalUseCase: CreateSignalUseCase) {
    // Dependency Injection - Dependency Inversion Principle (SOLID)
  }

  /**
   * Cria um novo sinal
   * @param req Request do Vercel
   * @param res Response do Vercel
   */
  async create(req: VercelRequest, res: VercelResponse): Promise<void> {
    try {
      // Validar dados da requisição
      const validatedData = validateSignalData(req.body);

      // Executar use case
      const signal = await this.createSignalUseCase.execute(validatedData as CreateSignalData);

      // Retornar resposta de sucesso
      const response: ApiResponse = {
        success: true,
        data: {
          id: signal.id,
          name: signal.name,
          type: signal.type,
          symbol: signal.symbol,
          entry: signal.entry,
          stopLoss: signal.stopLoss,
          take1: signal.take1,
          take2: signal.take2,
          take3: signal.take3,
          stopTicks: signal.stopTicks,
          time: signal.time.toISOString(),
          createdAt: signal.createdAt.toISOString(),
        },
      };

      res.status(201).json(response);
    } catch (error) {
      handleError(error, res);
    }
  }
}

