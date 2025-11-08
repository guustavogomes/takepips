/**
 * Domain Layer - Signal Entity
 * 
 * Esta camada define a entidade Signal sem dependências de frameworks
 * Seguindo o princípio SRP: apenas define a estrutura de dados
 */

export type SignalType = 'BUY' | 'SELL';
export type SignalStatus = 'PENDING' | 'EM_OPERACAO' | 'STOP_LOSS' | 'TAKE1' | 'TAKE2' | 'TAKE3' | 'ENCERRADO' | 'CANCELADO';

export interface Signal {
  id: string;
  name: string;
  type: SignalType;
  symbol: string;
  entry: number;
  stopLoss: number;
  take1: number;
  take2: number;
  take3: number;
  stopTicks: number;
  time: Date;
  status: SignalStatus;
  stopHitAt?: Date;
  take1HitAt?: Date;
  take2HitAt?: Date;
  take3HitAt?: Date;
  stopHitPrice?: number;
  take1HitPrice?: number;
  take2HitPrice?: number;
  take3HitPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignalDTO {
  id: string;
  name: string;
  type: SignalType;
  symbol: string;
  entry: number;
  stopLoss: number;
  take1: number;
  take2: number;
  take3: number;
  stopTicks: number;
  time: string;
  status: SignalStatus;
  stopHitAt?: string;
  take1HitAt?: string;
  take2HitAt?: string;
  take3HitAt?: string;
  stopHitPrice?: number;
  take1HitPrice?: number;
  take2HitPrice?: number;
  take3HitPrice?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Converte DTO para entidade Signal
 */
export function signalFromDTO(dto: SignalDTO): Signal {
  return {
    ...dto,
    time: new Date(dto.time),
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
    stopHitAt: dto.stopHitAt ? new Date(dto.stopHitAt) : undefined,
    take1HitAt: dto.take1HitAt ? new Date(dto.take1HitAt) : undefined,
    take2HitAt: dto.take2HitAt ? new Date(dto.take2HitAt) : undefined,
    take3HitAt: dto.take3HitAt ? new Date(dto.take3HitAt) : undefined,
  };
}
