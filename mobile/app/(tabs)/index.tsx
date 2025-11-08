/**
 * Home Screen - Lista de Sinais
 *
 * Tela principal com design otimizado para melhor UX
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Text,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSignals, useActiveSignals } from '@/presentation/hooks/useSignals';
import { SignalCard } from '@/presentation/components/SignalCard';
import { LoadingSpinner } from '@/presentation/components/LoadingSpinner';
import { ErrorView } from '@/presentation/components/ErrorView';
import { StatsDashboard } from '@/presentation/components/StatsDashboard';
import { Signal } from '@/domain/models/Signal';
import { showSuccess } from '@/shared/utils/toast';

export default function HomeScreen() {
  const [page, setPage] = useState(1);
  const { data: signals, isLoading, error, refetch, isRefetching } = useSignals(page, 20);
  const { data: activeSignals } = useActiveSignals();

  const handleRefresh = () => {
    refetch();
    showSuccess('Lista atualizada!');
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

  const renderHeader = () => (
    <>
      {/* Dashboard de Performance */}
      <StatsDashboard />

      {/* Indicador de Sinais Ativos */}
      {activeSignals && activeSignals.length > 0 && (
        <View style={styles.activeSignalsHeader}>
          <View style={styles.activeSignalsTitleRow}>
            <MaterialCommunityIcons name="target" size={22} color="#3b82f6" />
            <Text style={styles.activeSignalsTitle}>Sinais Ativos</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>{activeSignals.length}</Text>
            </View>
          </View>
          <Text style={styles.activeSignalsSubtitle}>
            Acompanhe seus sinais em operação
          </Text>
        </View>
      )}

      {/* Título da lista de todos os sinais */}
      <View style={styles.listHeader}>
        <View style={styles.listHeaderRow}>
          <MaterialCommunityIcons name="chart-box" size={22} color="#9CA3AF" />
          <Text style={styles.listHeaderTitle}>Todos os Sinais</Text>
        </View>
      </View>
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons name="chart-line-variant" size={80} color="#374151" />
      </View>
      <Text style={styles.emptyTitle}>Nenhum sinal disponível</Text>
      <Text style={styles.emptySubtitle}>
        Novos sinais aparecerão aqui quando estiverem disponíveis
      </Text>
      <View style={styles.emptyTip}>
        <MaterialCommunityIcons name="lightbulb-outline" size={16} color="#6B7280" />
        <Text style={styles.emptyTipText}>
          Puxe para baixo para atualizar
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={signals || []}
        renderItem={({ item }) => (
          <SignalCard signal={item} onPress={handleSignalPress} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor="#FFD700"
            colors={['#FFD700']}
            progressBackgroundColor="#0f1419"
          />
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  activeSignalsHeader: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#0f1419',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    borderWidth: 1,
    borderColor: '#1a1f2e',
  },
  activeSignalsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  activeSignalsTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  activeBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    minWidth: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  activeSignalsSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginLeft: 32,
  },
  listHeader: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0f1419',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#1a1f2e',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0f1419',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1f2e',
  },
  emptyTipText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
});
