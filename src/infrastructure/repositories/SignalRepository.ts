import { ISignalRepository } from '../../domain/repositories/ISignalRepository';
import { Signal, CreateSignalData, SignalStatus } from '../../domain/entities/Signal';
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
        status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
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
      'PENDING', // Status inicial
      now.toISOString(),
      now.toISOString(),
    ]) as Record<string, any>[];

    if (!result || result.length === 0) {
      throw new Error('Falha ao criar sinal no banco de dados');
    }

    return this.mapRowToSignal(result[0]);
  }

  async findById(id: string): Promise<Signal | null> {
    const query = 'SELECT * FROM signals WHERE id = $1';
    const result = await this.sql(query, [id]) as Record<string, any>[];

    if (!result || result.length === 0) {
      return null;
    }

    return this.mapRowToSignal(result[0]);
  }

  async findAll(limit = 100, offset = 0): Promise<Signal[]> {
    const query = 'SELECT * FROM signals ORDER BY created_at DESC LIMIT $1 OFFSET $2';
    const result = await this.sql(query, [limit, offset]) as Record<string, any>[];

    if (!result) {
      return [];
    }

    return result.map((row) => this.mapRowToSignal(row));
  }

  async findBySymbol(symbol: string, limit = 100): Promise<Signal[]> {
    const query = 'SELECT * FROM signals WHERE symbol = $1 ORDER BY created_at DESC LIMIT $2';
    const result = await this.sql(query, [symbol, limit]) as Record<string, any>[];

    if (!result) {
      return [];
    }

    return result.map((row) => this.mapRowToSignal(row));
  }

  async updateStatus(id: string, status: SignalStatus, hitPrice: number): Promise<Signal> {
    const now = new Date();
    let query = '';
    let params: any[] = [];
    
    // Determinar qual campo atualizar baseado no status
    if (status === 'EM_OPERACAO') {
      // Quando entrada é atingida, apenas atualiza o status (não precisa de campos específicos)
      query = `
        UPDATE signals 
        SET status = $1, 
            updated_at = $2
        WHERE id = $3
        RETURNING *
      `;
      params = [status, now.toISOString(), id];
    } else if (status === 'STOP_LOSS') {
      query = `
        UPDATE signals 
        SET status = $1, 
            stop_hit_at = $2, 
            stop_hit_price = $3, 
            updated_at = $4
        WHERE id = $5
        RETURNING *
      `;
      params = [status, now.toISOString(), hitPrice.toString(), now.toISOString(), id];
    } else if (status === 'TAKE1') {
      query = `
        UPDATE signals 
        SET status = $1, 
            take1_hit_at = $2, 
            take1_hit_price = $3, 
            updated_at = $4
        WHERE id = $5
        RETURNING *
      `;
      params = [status, now.toISOString(), hitPrice.toString(), now.toISOString(), id];
    } else if (status === 'TAKE2') {
      query = `
        UPDATE signals 
        SET status = $1, 
            take2_hit_at = $2, 
            take2_hit_price = $3, 
            updated_at = $4
        WHERE id = $5
        RETURNING *
      `;
      params = [status, now.toISOString(), hitPrice.toString(), now.toISOString(), id];
    } else if (status === 'TAKE3') {
      // Quando Take 3 é atingido, marcar automaticamente como ENCERRADO
      query = `
        UPDATE signals 
        SET status = 'ENCERRADO',
            take3_hit_at = $1, 
            take3_hit_price = $2, 
            updated_at = $3
        WHERE id = $4
        RETURNING *
      `;
      params = [now.toISOString(), hitPrice.toString(), now.toISOString(), id];
    } else if (status === 'ENCERRADO') {
      // Para status ENCERRADO, apenas atualiza o status (não precisa de hitPrice)
      query = `
        UPDATE signals 
        SET status = $1, 
            updated_at = $2
        WHERE id = $3
        RETURNING *
      `;
      params = [status, now.toISOString(), id];
    } else {
      throw new Error(`Status inválido para atualização: ${status}`);
    }

    const result = await this.sql(query, params) as Record<string, any>[];

    if (!result || result.length === 0) {
      throw new Error('Sinal não encontrado ou falha ao atualizar status');
    }

    return this.mapRowToSignal(result[0]);
  }

  async update(
    id: string,
    data: {
      entry?: number;
      stopLoss?: number;
      take1?: number;
      take2?: number;
      take3?: number;
      stopTicks?: number;
    }
  ): Promise<Signal> {
    const now = new Date();
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.entry !== undefined) {
      updates.push(`entry = $${paramIndex}`);
      params.push(data.entry.toString());
      paramIndex++;
    }

    if (data.stopLoss !== undefined) {
      updates.push(`stop_loss = $${paramIndex}`);
      params.push(data.stopLoss.toString());
      paramIndex++;
    }

    if (data.take1 !== undefined) {
      updates.push(`take1 = $${paramIndex}`);
      params.push(data.take1.toString());
      paramIndex++;
    }

    if (data.take2 !== undefined) {
      updates.push(`take2 = $${paramIndex}`);
      params.push(data.take2.toString());
      paramIndex++;
    }

    if (data.take3 !== undefined) {
      updates.push(`take3 = $${paramIndex}`);
      params.push(data.take3.toString());
      paramIndex++;
    }

    if (data.stopTicks !== undefined) {
      updates.push(`stop_ticks = $${paramIndex}`);
      params.push(data.stopTicks);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw new Error('Nenhum campo fornecido para atualização');
    }

    updates.push(`updated_at = $${paramIndex}`);
    params.push(now.toISOString());
    paramIndex++;

    params.push(id);

    const query = `
      UPDATE signals 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.sql(query, params) as Record<string, any>[];

    if (!result || result.length === 0) {
      throw new Error('Sinal não encontrado ou falha ao atualizar');
    }

    return this.mapRowToSignal(result[0]);
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
      status: (row.status || 'PENDING') as SignalStatus,
      stopHitAt: row.stop_hit_at ? new Date(row.stop_hit_at) : undefined,
      take1HitAt: row.take1_hit_at ? new Date(row.take1_hit_at) : undefined,
      take2HitAt: row.take2_hit_at ? new Date(row.take2_hit_at) : undefined,
      take3HitAt: row.take3_hit_at ? new Date(row.take3_hit_at) : undefined,
      stopHitPrice: row.stop_hit_price ? parseFloat(row.stop_hit_price) : undefined,
      take1HitPrice: row.take1_hit_price ? parseFloat(row.take1_hit_price) : undefined,
      take2HitPrice: row.take2_hit_price ? parseFloat(row.take2_hit_price) : undefined,
      take3HitPrice: row.take3_hit_price ? parseFloat(row.take3_hit_price) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

