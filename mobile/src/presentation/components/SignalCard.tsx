/**
 * Presentation Layer - Signal Card Component
 * 
 * Componente elegante para exibir um sinal
 * Seguindo SRP: Apenas renderiza um sinal
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Signal, SignalStatus } from '@/domain/models/Signal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SignalCardProps {
  signal: Signal;
  onPress?: (signal: Signal) => void;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal, onPress }) => {
  const getStatusColor = (status: SignalStatus): string => {
    switch (status) {
      case 'PENDING':
        return '#FFA500';
      case 'EM_OPERACAO':
        return '#4A90E2';
      case 'STOP_LOSS':
        return '#E74C3C';
      case 'TAKE1':
      case 'TAKE2':
      case 'TAKE3':
        return '#2ECC71';
      case 'ENCERRADO':
        return '#95A5A6';
      default:
        return '#34495E';
    }
  };

  const getStatusLabel = (status: SignalStatus): string => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'EM_OPERACAO':
        return 'Em Operação';
      case 'STOP_LOSS':
        return 'Stop Loss';
      case 'TAKE1':
        return 'Take 1';
      case 'TAKE2':
        return 'Take 2';
      case 'TAKE3':
        return 'Take 3';
      case 'ENCERRADO':
        return 'Encerrado';
      default:
        return status;
    }
  };

  const getSignalTypeEmoji = (type: string): string => {
    return type === 'BUY' ? '📈' : '📉';
  };

  const statusColor = getStatusColor(signal.status);
  const formattedTime = format(signal.time, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  const CardContent = (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.symbolContainer}>
          <Text style={styles.emoji}>{getSignalTypeEmoji(signal.type)}</Text>
          <View>
            <Text style={styles.symbol}>{signal.symbol}</Text>
            <Text style={styles.type}>{signal.type}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{getStatusLabel(signal.status)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.valueContainer}>
            <Text style={styles.label}>Entry</Text>
            <Text style={styles.value}>{signal.entry.toFixed(2)}</Text>
          </View>
          <View style={styles.valueContainer}>
            <Text style={styles.label}>Stop Loss</Text>
            <Text style={[styles.value, { color: '#E74C3C' }]}>
              {signal.stopLoss.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.valueContainer}>
            <Text style={styles.label}>Take 1</Text>
            <Text style={[styles.value, { color: '#2ECC71' }]}>
              {signal.take1.toFixed(2)}
            </Text>
          </View>
          <View style={styles.valueContainer}>
            <Text style={styles.label}>Take 2</Text>
            <Text style={[styles.value, { color: '#2ECC71' }]}>
              {signal.take2.toFixed(2)}
            </Text>
          </View>
          <View style={styles.valueContainer}>
            <Text style={styles.label}>Take 3</Text>
            <Text style={[styles.value, { color: '#2ECC71' }]}>
              {signal.take3.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.timeText}>{formattedTime}</Text>
        <Text style={styles.nameText}>{signal.name}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => onPress(signal)}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1F3A',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#2A2F4A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 32,
  },
  symbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  type: {
    fontSize: 14,
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  content: {
    gap: 12,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  valueContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2F4A',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  nameText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});
