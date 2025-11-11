import { z } from 'zod';
import { CreateSignalData } from '../../domain/entities/Signal';

/**
 * Schema de validação para criação de sinais
 * Usando Zod para validação type-safe
 */
export const createSignalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['BUY', 'SELL'], {
    errorMap: () => ({ message: 'Tipo deve ser BUY ou SELL' }),
  }),
  symbol: z.string().min(1, 'Símbolo é obrigatório').max(20, 'Símbolo muito longo'),
  entry: z.number().positive('Entry deve ser positivo'),
  stopLoss: z.number().positive('Stop Loss deve ser positivo'),
  take1: z.number().positive('Take 1 deve ser positivo'),
  take2: z.number().positive('Take 2 deve ser positivo'),
  take3: z.number().positive('Take 3 deve ser positivo'),
  stopTicks: z.number().int().positive('Stop Ticks deve ser um inteiro positivo'),
  time: z.string().regex(
    /^\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}:\d{2}$/,
    'Formato de data inválido. Use: YYYY.MM.DD HH:MM:SS'
  ),
  sessao: z.string().max(50, 'Nome da sessão muito longo').optional(),
});

/**
 * Valida os dados de criação de sinal
 * @param data Dados a serem validados
 * @returns Dados validados ou lança erro de validação
 */
export function validateSignalData(data: unknown): CreateSignalData {
  return createSignalSchema.parse(data);
}

