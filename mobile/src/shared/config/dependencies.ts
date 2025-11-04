/**
 * Shared - Dependency Injection Container
 * 
 * Centraliza a criação e injeção de dependências
 * Seguindo DIP: Dependências são abstrações
 */

import { ISignalRepository } from '@/domain/repositories/ISignalRepository';
import { INotificationRepository } from '@/domain/repositories/INotificationRepository';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { SignalRepository } from '@/infrastructure/repositories/SignalRepository';
import { NotificationRepository } from '@/infrastructure/repositories/NotificationRepository';
import { AuthRepositorySupabase } from '@/infrastructure/repositories/AuthRepositorySupabase';
import { GetSignalsUseCase } from '@/application/useCases/GetSignalsUseCase';
import { GetActiveSignalsUseCase } from '@/application/useCases/GetActiveSignalsUseCase';
import { RegisterNotificationUseCase } from '@/application/useCases/RegisterNotificationUseCase';
import { GetNotificationPreferencesUseCase } from '@/application/useCases/GetNotificationPreferencesUseCase';
import { SaveNotificationPreferencesUseCase } from '@/application/useCases/SaveNotificationPreferencesUseCase';
import { RegisterUseCase } from '@/application/useCases/RegisterUseCase';
import { LoginUseCase } from '@/application/useCases/LoginUseCase';

// Repositórios (singletons)
const signalRepository: ISignalRepository = new SignalRepository();
const notificationRepository: INotificationRepository = new NotificationRepository();
export const authRepository: IAuthRepository = new AuthRepositorySupabase();

// Use Cases
export const getSignalsUseCase = new GetSignalsUseCase(signalRepository);
export const getActiveSignalsUseCase = new GetActiveSignalsUseCase(signalRepository);
export const registerNotificationUseCase = new RegisterNotificationUseCase(notificationRepository);
export const getNotificationPreferencesUseCase = new GetNotificationPreferencesUseCase(notificationRepository);
export const saveNotificationPreferencesUseCase = new SaveNotificationPreferencesUseCase(notificationRepository);
export const registerUseCase = new RegisterUseCase(authRepository);
export const loginUseCase = new LoginUseCase(authRepository);

// Repositórios (caso necessário acesso direto)
export { signalRepository, notificationRepository };
