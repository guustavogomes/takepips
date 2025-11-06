import { VercelRequest, VercelResponse } from '@vercel/node';
import { CreateSignalUseCase } from '../../application/useCases/CreateSignalUseCase';
import { validateSignalData } from '../../shared/validators/signalValidator';
import { handleError } from '../../shared/utils/errorHandler';
import { ApiResponse } from '../../shared/types/ApiResponse';
import { CreateSignalData } from '../../domain/entities/Signal';
import { notifyNewSignal } from '../../shared/utils/pushNotifications';

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

      // Enviar notificação push para novo sinal
      console.log('[SIGNAL] Novo sinal criado, enviando notificação push...', {
        id: signal.id,
        type: signal.type,
        symbol: signal.symbol
      });
      
      // IMPORTANTE: Usar await para garantir que a função complete antes de retornar
      // No Vercel, funções assíncronas sem await podem ser interrompidas após retornar a resposta
      // Isso garante que as notificações sejam enviadas antes de retornar
      try {
        await notifyNewSignal(signal.type, signal.symbol, signal.entry, signal.stopLoss, signal.take1);
        console.log('[PUSH] ✅ Notificação de novo sinal enviada com sucesso');
      } catch (error) {
        console.error('[PUSH] ❌ Erro ao enviar notificação de novo sinal:', error);
        console.error('[PUSH] Tipo do erro:', error?.constructor?.name);
        console.error('[PUSH] Stack:', error instanceof Error ? error.stack : 'N/A');
        console.error('[PUSH] Erro completo:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        // Não bloquear a resposta em caso de erro na notificação
      }

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
          status: signal.status,
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

