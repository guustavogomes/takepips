/**
 * Home Screen - Lista de Sinais
 * 
 * Tela principal que exibe a lista de sinais
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Text,
} from 'react-native';
import { useSignals, useActiveSignals } from '@/presentation/hooks/useSignals';
import { SignalCard } from '@/presentation/components/SignalCard';
import { LoadingSpinner } from '@/presentation/components/LoadingSpinner';
import { ErrorView } from '@/presentation/components/ErrorView';
import { Signal } from '@/domain/models/Signal';

export default function HomeScreen() {
  const [page, setPage] = useState(1);
  const { data: signals, isLoading, error, refetch, isRefetching } = useSignals(page, 20);
  const { data: activeSignals } = useActiveSignals();

  const handleRefresh = () => {
    refetch();
  };

  const handleSignalPress = (signal: Signal) => {
    // Navegar para detalhes do sinal se necessário
    console.log('Signal pressed:', signal.id);
  };

  if (isLoading && !signals) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorView message={error.message} onRetry={refetch} />;
  }

  return (
    <View style={styles.container}>
      {activeSignals && activeSignals.length > 0 && (
        <View style={styles.activeSignalsContainer}>
          <Text style={styles.activeSignalsTitle}>
            🎯 Sinais Ativos ({activeSignals.length})
          </Text>
        </View>
      )}

      <FlatList
        data={signals || []}
        renderItem={({ item }) => (
          <SignalCard signal={item} onPress={handleSignalPress} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor="#4A90E2"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyText}>Nenhum sinal encontrado</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  activeSignalsContainer: {
    backgroundColor: '#1A1F3A',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  activeSignalsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 64,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
});
