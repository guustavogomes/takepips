/**
 * Register Screen - Tela de registro com validação
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRegister } from '@/presentation/hooks/useAuth';
import { showError, showSuccess, showInfo } from '@/shared/utils/toast';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { mutate: register, isPending } = useRegister();

  const validateForm = () => {
    if (!fullName.trim()) return 'Nome completo é obrigatório';
    if (!email.trim()) return 'Email é obrigatório';
    if (!email.includes('@')) return 'Email inválido';
    if (password.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    if (password !== confirmPassword) return 'As senhas não coincidem';
    return null;
  };

  const handleRegister = () => {
    const error = validateForm();
    if (error) {
      showError(error);
      return;
    }

    register(
      {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      },
      {
        onSuccess: () => {
          showSuccess('Conta criada com sucesso!');
          router.replace('/(tabs)');
        },
        onError: (error) => {
          console.error('Register error:', error);
          
          // Verificar se é erro de confirmação de email
          if (error.message?.includes('EMAIL_CONFIRMATION_REQUIRED')) {
            const message = error.message.replace('EMAIL_CONFIRMATION_REQUIRED: ', '');
            showInfo(message, 'Verifique seu email');
            // Redirecionar para login após 2 segundos
            setTimeout(() => {
              router.replace('/(auth)/login');
            }, 2000);
          } else {
            showError(error.message || 'Erro ao criar conta. Tente novamente.');
          }
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>← Voltar</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Criar Conta</Text>
              <Text style={styles.subtitle}>Preencha os dados abaixo</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nome Completo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="João Silva"
                  placeholderTextColor="#6B7280"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  editable={!isPending}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isPending}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Senha</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor="#6B7280"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isPending}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Text style={styles.eyeButtonText}>
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmar Senha</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Digite a senha novamente"
                    placeholderTextColor="#6B7280"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isPending}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Text style={styles.eyeButtonText}>
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {password && confirmPassword && password !== confirmPassword && (
                  <Text style={styles.errorText}>As senhas não coincidem</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.registerButton, isPending && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={isPending || !fullName.trim() || !email.trim() || !password || !confirmPassword}
              >
                {isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.registerButtonText}>Criar Conta</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.back()}
                disabled={isPending}
              >
                <Text style={styles.loginButtonText}>
                  Já tem uma conta? <Text style={styles.loginButtonTextBold}>Entrar</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#4A90E2',
    fontSize: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#1A1F3A',
    borderWidth: 1,
    borderColor: '#2A2F4A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    borderWidth: 1,
    borderColor: '#2A2F4A',
    borderRadius: 12,
    paddingRight: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  eyeButton: {
    padding: 8,
  },
  eyeButtonText: {
    fontSize: 20,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 4,
  },
  registerButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  loginButtonTextBold: {
    color: '#4A90E2',
    fontWeight: '600',
  },
});
