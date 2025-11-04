/**
 * Utility para exibir toasts no app
 * 
 * Wrapper para react-native-toast-message com configurações padrão
 */

import Toast from 'react-native-toast-message';

/**
 * Mostra toast de sucesso
 */
export const showSuccess = (message: string, title?: string) => {
  Toast.show({
    type: 'success',
    text1: title || 'Sucesso',
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

/**
 * Mostra toast de erro
 */
export const showError = (message: string, title?: string) => {
  Toast.show({
    type: 'error',
    text1: title || 'Erro',
    text2: message,
    position: 'top',
    visibilityTime: 4000,
  });
};

/**
 * Mostra toast de informação
 */
export const showInfo = (message: string, title?: string) => {
  Toast.show({
    type: 'info',
    text1: title || 'Informação',
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

/**
 * Mostra toast de aviso
 */
export const showWarning = (message: string, title?: string) => {
  Toast.show({
    type: 'error', // Usar error como base para warning
    text1: title || 'Atenção',
    text2: message,
    position: 'top',
    visibilityTime: 3500,
  });
};
