export type SignalType = 'BUY' | 'SELL';

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

