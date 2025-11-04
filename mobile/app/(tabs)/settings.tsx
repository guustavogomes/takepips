/**
 * Settings Screen - Configurações de Notificações
 * 
 * Tela para gerenciar preferências de notificações
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNotificationPreferences, useSaveNotificationPreferences } from '@/presentation/hooks/useNotifications';
import { LoadingSpinner } from '@/presentation/components/LoadingSpinner';
import { ErrorView } from '@/presentation/components/ErrorView';
import { NotificationPreferences } from '@/domain/models/NotificationPreferences';
import { authRepository } from '@/shared/config/dependencies';

export default function SettingsScreen() {
  const router = useRouter();
  const { data: preferences, isLoading, error, refetch } = useNotificationPreferences();
  const saveMutation = useSaveNotificationPreferences();

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (!preferences) return;

    const updated: NotificationPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };

    // Se desabilitar notificações, desabilitar tudo
    if (key === 'enabled' && !updated.enabled) {
      updated.newSignals = false;
      updated.entryHit = false;
      updated.take1 = false;
      updated.take2 = false;
      updated.take3 = false;
      updated.stopLoss = false;
    }

    saveMutation.mutate(updated);
  };

  const handleLogout = async () => {
    await authRepository.logout();
    router.replace('/(auth)/splash');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !preferences) {
    return <ErrorView message={error?.message || 'Erro ao carregar preferências'} onRetry={refetch} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Notificações</Text>
        <Text style={styles.sectionDescription}>
          Configure quando você deseja receber notificações sobre seus sinais
        </Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Ativar Notificações</Text>
            <Text style={styles.settingDescription}>
              Permite receber notificações push
            </Text>
          </View>
          <Switch
            value={preferences.enabled}
            onValueChange={() => handleToggle('enabled')}
            trackColor={{ false: '#3A3F5A', true: '#4A90E2' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {preferences.enabled && (
          <>
            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Novos Sinais</Text>
                <Text style={styles.settingDescription}>
                  Notificar quando um novo sinal for criado
                </Text>
              </View>
              <Switch
                value={preferences.newSignals}
                onValueChange={() => handleToggle('newSignals')}
                trackColor={{ false: '#3A3F5A', true: '#4A90E2' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Entrada Atingida</Text>
                <Text style={styles.settingDescription}>
                  Notificar quando o sinal entrar em operação
                </Text>
              </View>
              <Switch
                value={preferences.entryHit}
                onValueChange={() => handleToggle('entryHit')}
                trackColor={{ false: '#3A3F5A', true: '#4A90E2' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Take 1</Text>
                <Text style={styles.settingDescription}>
                  Notificar quando Take 1 for atingido
                </Text>
              </View>
              <Switch
                value={preferences.take1}
                onValueChange={() => handleToggle('take1')}
                trackColor={{ false: '#3A3F5A', true: '#4A90E2' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Take 2</Text>
                <Text style={styles.settingDescription}>
                  Notificar quando Take 2 for atingido
                </Text>
              </View>
              <Switch
                value={preferences.take2}
                onValueChange={() => handleToggle('take2')}
                trackColor={{ false: '#3A3F5A', true: '#4A90E2' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Take 3</Text>
                <Text style={styles.settingDescription}>
                  Notificar quando Take 3 for atingido
                </Text>
              </View>
              <Switch
                value={preferences.take3}
                onValueChange={() => handleToggle('take3')}
                trackColor={{ false: '#3A3F5A', true: '#4A90E2' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Stop Loss</Text>
                <Text style={styles.settingDescription}>
                  Notificar quando Stop Loss for atingido
                </Text>
              </View>
              <Switch
                value={preferences.stopLoss}
                onValueChange={() => handleToggle('stopLoss')}
                trackColor={{ false: '#3A3F5A', true: '#4A90E2' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Som</Text>
                <Text style={styles.settingDescription}>
                  Reproduzir som nas notificações
                </Text>
              </View>
              <Switch
                value={preferences.soundEnabled}
                onValueChange={() => handleToggle('soundEnabled')}
                trackColor={{ false: '#3A3F5A', true: '#4A90E2' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Vibração</Text>
                <Text style={styles.settingDescription}>
                  Vibração ao receber notificações
                </Text>
              </View>
              <Switch
                value={preferences.vibrationEnabled}
                onValueChange={() => handleToggle('vibrationEnabled')}
                trackColor={{ false: '#3A3F5A', true: '#4A90E2' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {saveMutation.isPending && (
        <View style={styles.savingContainer}>
          <Text style={styles.savingText}>Salvando...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#1A1F3A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 24,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2F4A',
    marginVertical: 8,
  },
  savingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  savingText: {
    color: '#4A90E2',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
