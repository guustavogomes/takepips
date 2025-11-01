export type SignalType = 'BUY' | 'SELL';
export type SignalStatus = 'PENDING' | 'STOP_LOSS' | 'TAKE1' | 'TAKE2' | 'TAKE3';

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

export interface CreateSignalData {
  name: string;
  type: SignalType;
  symbol: string;
  entry: number;
  stopLoss: number;
  take1: number;
  take2: number;
  take3: number;
  stopTicks: number;
  time: string; // Formato: "YYYY.MM.DD HH:MM:SS"
}

