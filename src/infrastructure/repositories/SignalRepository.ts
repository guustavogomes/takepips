import { ISignalRepository } from '../../domain/repositories/ISignalRepository';
import { Signal, CreateSignalData } from '../../domain/entities/Signal';
import { dbConnection } from '../database/connection';
import { parseMT5DateTime } from '../../shared/utils/dateUtils';
import { generateUUID } from '../../shared/utils/uuid';

/**
 * Implementação concreta do repositório de sinais usando Neon
 * Segue o princípio de Single Responsibility (SOLID)
 * Responsável apenas pela persistência de dados
 */
export class SignalRepository implements ISignalRepository {
  private readonly sql = dbConnection.getConnection();

  async create(data: CreateSignalData): Promise<Signal> {
    const id = generateUUID();
    const now = new Date();
    
    // Converter time string do formato MT5 para Date
    const signalTime = parseMT5DateTime(data.time);

    const query = `
      INSERT INTO signals (
        id, name, type, symbol, entry, stop_loss, 
        take1, take2, take3, stop_ticks, time, 
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )
      RETURNING *
    `;

    const result = await this.sql(query, [
      id,
      data.name,
      data.type,
      data.symbol,
      data.entry.toString(),
      data.stopLoss.toString(),
      data.take1.toString(),
      data.take2.toString(),
      data.take3.toString(),
      data.stopTicks,
      signalTime.toISOString(),
      now.toISOString(),
      now.toISOString(),
    ]);

    if (!result || result.length === 0) {
      throw new Error('Falha ao criar sinal no banco de dados');
    }

    return this.mapRowToSignal(result[0]);
  }

  async findById(id: string): Promise<Signal | null> {
    const query = 'SELECT * FROM signals WHERE id = $1';
    const result = await this.sql(query, [id]);

    if (!result || result.length === 0) {
      return null;
    }

    return this.mapRowToSignal(result[0]);
  }

  async findAll(limit = 100, offset = 0): Promise<Signal[]> {
    const query = 'SELECT * FROM signals ORDER BY created_at DESC LIMIT $1 OFFSET $2';
    const result = await this.sql(query, [limit, offset]);

    if (!result) {
      return [];
    }

    return result.map((row: unknown) => this.mapRowToSignal(row));
  }

  async findBySymbol(symbol: string, limit = 100): Promise<Signal[]> {
    const query = 'SELECT * FROM signals WHERE symbol = $1 ORDER BY created_at DESC LIMIT $2';
    const result = await this.sql(query, [symbol, limit]);

    if (!result) {
      return [];
    }

    return result.map((row: unknown) => this.mapRowToSignal(row));
  }

  /**
   * Mapeia uma linha do banco para a entidade Signal
   * @param row Linha do banco de dados
   * @returns Entidade Signal
   */
  private mapRowToSignal(row: any): Signal {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      symbol: row.symbol,
      entry: parseFloat(row.entry),
      stopLoss: parseFloat(row.stop_loss),
      take1: parseFloat(row.take1),
      take2: parseFloat(row.take2),
      take3: parseFloat(row.take3),
      stopTicks: parseInt(row.stop_ticks, 10),
      time: new Date(row.time),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

