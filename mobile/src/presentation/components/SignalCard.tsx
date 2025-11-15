/**
 * Presentation Layer - Signal Card Component
 *
 * Card de sinal com design moderno e indicadores de atualização
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Signal, SignalStatus } from '@/domain/models/Signal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para escalar fontes baseado no tamanho da tela
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; // 375 é a largura de referência (iPhone X)

function normalize(size: number): number {
  const newSize = size * scale;
  return Math.round(newSize);
}

interface SignalCardProps {
  signal: Signal;
  onPress?: (signal: Signal) => void;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal, onPress }) => {
  const getStatusInfo = (status: SignalStatus) => {
    switch (status) {
      case 'PENDING':
        return { label: 'PENDENTE', color: '#f59e0b', icon: 'clock-outline' };
      case 'EM_OPERACAO':
        return { label: 'EM OPERAÇÃO', color: '#3b82f6', icon: 'chart-line' };
      case 'STOP_LOSS':
        return { label: 'STOP LOSS', color: '#ef4444', icon: 'close-circle' };
      case 'TAKE1':
        return { label: 'TAKE 1', color: '#10b981', icon: 'check-circle' };
      case 'TAKE2':
        return { label: 'TAKE 2', color: '#10b981', icon: 'check-circle' };
      case 'TAKE3':
        return { label: 'TAKE 3', color: '#10b981', icon: 'check-circle' };
      case 'ENCERRADO':
        return { label: 'ENCERRADO', color: '#6b7280', icon: 'flag-checkered' };
      case 'CANCELADO':
        return { label: 'CANCELADO', color: '#9333ea', icon: 'cancel' };
      default:
        return { label: status, color: '#6b7280', icon: 'information' };
    }
  };

  const getTypeInfo = (type: string) => {
    if (type === 'BUY') {
      return { label: 'COMPRA', color: '#10b981', icon: 'arrow-up-bold' };
    }
    return { label: 'VENDA', color: '#ef4444', icon: 'arrow-down-bold' };
  };

  // Verificar se foi atualizado recentemente (últimos 10 segundos)
  const isRecentlyUpdated = () => {
    const now = new Date();
    const diff = now.getTime() - signal.updatedAt.getTime();
    return diff < 10000; // 10 segundos
  };

  const statusInfo = getStatusInfo(signal.status);
  const typeInfo = getTypeInfo(signal.type);
  const formattedTime = format(signal.time, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  const wasRecentlyUpdated = isRecentlyUpdated();

  // Verificar takes/stop atingidos
  const hasTake1Hit = signal.take1HitPrice;
  const hasTake2Hit = signal.take2HitPrice;
  const hasTake3Hit = signal.take3HitPrice;
  const hasStopHit = signal.stopHitPrice;

  // Renderizar badge de atualização
  const renderUpdateBadge = () => {
    if (!wasRecentlyUpdated) return null;
    
    return (
      <View style={styles.updateBadge}>
        <MaterialCommunityIcons name="update" size={10} color="#FFFFFF" />
        <Text style={styles.updateBadgeText}>ATUALIZADO</Text>
      </View>
    );
  };

  const CardContent = (
    <View style={[
      styles.container,
      hasStopHit && styles.stopHitCard,
      (hasTake1Hit || hasTake2Hit || hasTake3Hit) && !hasStopHit && styles.takeHitCard,
      wasRecentlyUpdated && styles.recentlyUpdatedCard,
    ]}>
      {/* Header: Símbolo e Status */}
      <View style={styles.header}>
        <View style={styles.symbolSection}>
          <View style={[styles.typeIndicator, { backgroundColor: typeInfo.color }]}>
            <MaterialCommunityIcons 
              name={typeInfo.icon as any} 
              size={20} 
              color="#FFFFFF" 
            />
          </View>
          <View>
            <Text style={styles.symbol}>{signal.symbol}</Text>
            <Text style={[styles.type, { color: typeInfo.color }]}>
              {typeInfo.label}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          {wasRecentlyUpdated && (
            <View style={styles.updateIndicator}>
              <MaterialCommunityIcons name="circle" size={8} color="#f59e0b" />
              <Text style={styles.updateIndicatorText}>NOVO</Text>
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <MaterialCommunityIcons
              name={statusInfo.icon as any}
              size={normalize(14)}
              color="#FFFFFF"
            />
            <Text
              style={styles.statusText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {statusInfo.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Linha divisória decorativa */}
      <View style={styles.divider} />

      {/* Seção Entry e Stop Loss */}
      <View style={styles.mainPrices}>
        <View style={[
          styles.priceBox,
          wasRecentlyUpdated && styles.priceBoxUpdated,
        ]}>
          <View style={styles.priceLabelRow}>
            <Text style={styles.priceLabel}>Entry</Text>
            {wasRecentlyUpdated && renderUpdateBadge()}
          </View>
          <Text style={styles.priceValue}>{signal.entry.toFixed(2)}</Text>
        </View>

        <View style={styles.arrowContainer}>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#4B5563" />
        </View>

        <View style={[
          styles.priceBox,
          hasStopHit && styles.priceBoxHit,
          hasStopHit && { borderColor: '#ef4444', backgroundColor: '#ef444410' },
          wasRecentlyUpdated && !hasStopHit && styles.priceBoxUpdated,
        ]}>
          <View style={styles.priceLabelRow}>
            <Text style={styles.priceLabel}>Stop Loss</Text>
            {wasRecentlyUpdated && !hasStopHit && renderUpdateBadge()}
          </View>
          <Text style={[styles.priceValue, { color: '#ef4444' }]}>
            {signal.stopLoss.toFixed(2)}
          </Text>
          {hasStopHit && (
            <View style={styles.hitIndicator}>
              <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
      </View>

      {/* Seção Takes */}
      <View style={styles.takesSection}>
        <Text style={styles.takesTitle}>Take Profits</Text>
        <View style={styles.takesRow}>
          {[
            { value: signal.take1, hit: hasTake1Hit, label: 'T1' },
            { value: signal.take2, hit: hasTake2Hit, label: 'T2' },
            { value: signal.take3, hit: hasTake3Hit, label: 'T3' },
          ].map((take, index) => (
            <View
              key={index}
              style={[
                styles.takeBox,
                take.hit && styles.takeBoxHit,
                wasRecentlyUpdated && !take.hit && styles.takeBoxUpdated,
              ]}
            >
              <View style={styles.takeLabelRow}>
                <Text style={styles.takeLabel}>{take.label}</Text>
                {wasRecentlyUpdated && !take.hit && (
                  <View style={styles.updateDot}>
                    <MaterialCommunityIcons name="circle" size={6} color="#f59e0b" />
                  </View>
                )}
              </View>
              <Text style={styles.takeValue}>{take.value.toFixed(2)}</Text>
              {take.hit && (
                <View style={styles.takeCheckmark}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#10b981" />
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Footer: Data/Hora e Nome */}
      <View style={styles.footer}>
        <View style={[styles.footerItem, { flex: 1, marginRight: 8 }]}>
          <MaterialCommunityIcons name="clock-outline" size={normalize(14)} color="#6B7280" />
          <Text
            style={styles.footerText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {formattedTime}
          </Text>
        </View>
        {signal.name && (
          <View style={[styles.footerItem, { flex: 1 }]}>
            <MaterialCommunityIcons name="account" size={normalize(14)} color="#6B7280" />
            <Text
              style={styles.footerText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {signal.name}
            </Text>
          </View>
        )}
      </View>

      {/* Indicador global de atualização recente */}
      {wasRecentlyUpdated && (
        <View style={styles.recentUpdateOverlay}>
          <MaterialCommunityIcons name="refresh" size={12} color="#f59e0b" />
          <Text style={styles.recentUpdateText}>
            Atualizado há poucos segundos
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={() => onPress(signal)}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f1419',
    borderRadius: 20,
    padding: 18,
    marginVertical: 8,
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: '#1a1f2e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
  },
  stopHitCard: {
    borderColor: '#ef4444',
    backgroundColor: '#1a0f0f',
  },
  takeHitCard: {
    borderColor: '#10b981',
    backgroundColor: '#0f1a14',
  },
  recentlyUpdatedCard: {
    borderColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOpacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  symbolSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeIndicator: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbol: {
    fontSize: normalize(22),
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  type: {
    fontSize: normalize(12),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 1,
    maxWidth: '50%',
  },
  updateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f59e0b20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  updateIndicatorText: {
    fontSize: normalize(9),
    fontWeight: 'bold',
    color: '#f59e0b',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 5,
    maxWidth: '100%',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: normalize(11),
    fontWeight: 'bold',
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#1a1f2e',
    marginBottom: 16,
  },
  mainPrices: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  priceBox: {
    flex: 1,
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  priceBoxHit: {
    borderWidth: 2,
  },
  priceBoxUpdated: {
    borderColor: '#f59e0b30',
    backgroundColor: '#f59e0b10',
  },
  priceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: normalize(11),
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  updateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  updateBadgeText: {
    fontSize: normalize(7),
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  hitIndicator: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowContainer: {
    paddingHorizontal: 8,
  },
  takesSection: {
    marginBottom: 16,
  },
  takesTitle: {
    fontSize: normalize(12),
    color: '#9CA3AF',
    marginBottom: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  takesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  takeBox: {
    flex: 1,
    backgroundColor: '#1a1f2e',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  takeBoxHit: {
    borderColor: '#10b981',
    backgroundColor: '#10b98110',
  },
  takeBoxUpdated: {
    borderColor: '#f59e0b30',
    backgroundColor: '#f59e0b10',
  },
  takeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  takeLabel: {
    fontSize: normalize(10),
    color: '#9CA3AF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  updateDot: {
    width: 8,
    height: 8,
  },
  takeValue: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    color: '#10b981',
    letterSpacing: 0.2,
  },
  takeCheckmark: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1a1f2e',
    gap: 8,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  footerText: {
    fontSize: normalize(11),
    color: '#6B7280',
    fontWeight: '500',
    flexShrink: 1,
  },
  recentUpdateOverlay: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    backgroundColor: '#f59e0b20',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#f59e0b30',
  },
  recentUpdateText: {
    fontSize: normalize(10),
    color: '#f59e0b',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
