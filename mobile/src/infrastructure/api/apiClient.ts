/**
 * Infrastructure Layer - API Client
 * 
 * Cliente HTTP para comunicação com o backend
 * Seguindo SRP: Apenas faz requisições HTTP
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'https://your-backend-url.vercel.app';
const TOKEN_KEY = '@takepips:auth_token';

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem(TOKEN_KEY);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('[ApiClient] Error getting token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para tratamento de erros
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response) {
          // Se for erro 401 (não autorizado), remover token
          if (error.response.status === 401) {
            await AsyncStorage.removeItem(TOKEN_KEY);
          }
          // Erro com resposta do servidor
          const errorData = error.response.data as any;
          throw new Error(
            errorData?.message || `Server error: ${error.response.status}`
          );
        } else if (error.request) {
          // Requisição feita mas sem resposta
          throw new Error('Network error: Please check your connection');
        } else {
          // Erro ao configurar requisição
          throw new Error(`Request error: ${error.message}`);
        }
      }
    );
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}

// Instância singleton do cliente API
export const apiClient = new ApiClient();
