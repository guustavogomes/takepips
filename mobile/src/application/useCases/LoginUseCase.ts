/**
 * Application Layer - Login Use Case
 * 
 * Seguindo SRP: Apenas faz login
 */

import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { LoginData, AuthResponse } from '@/domain/models/User';

export class LoginUseCase {
  constructor(
    private authRepository: IAuthRepository
  ) {}

  async execute(data: LoginData): Promise<AuthResponse> {
    if (!data.email || !data.email.trim()) {
      throw new Error('Email é obrigatório');
    }

    if (!data.password || !data.password.trim()) {
      throw new Error('Senha é obrigatória');
    }

    return this.authRepository.login(data);
  }
}
