/**
 * Application Layer - Register Use Case
 * 
 * Seguindo SRP: Apenas registra usuário
 * Seguindo DIP: Depende de abstração (IAuthRepository)
 */

import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { RegisterData, AuthResponse } from '@/domain/models/User';

export class RegisterUseCase {
  constructor(
    private authRepository: IAuthRepository
  ) {}

  async execute(data: RegisterData): Promise<AuthResponse> {
    // Validações básicas
    if (!data.fullName || !data.fullName.trim()) {
      throw new Error('Nome completo é obrigatório');
    }

    if (!data.email || !data.email.trim()) {
      throw new Error('Email é obrigatório');
    }

    if (!data.email.includes('@')) {
      throw new Error('Email inválido');
    }

    if (!data.password || data.password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    return this.authRepository.register(data);
  }
}
