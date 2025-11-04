/**
 * Tela Ferramentas - Calculadoras e Utilitários
 *
 * Ferramentas úteis para traders
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const TOOLS: Tool[] = [
  {
    id: 'lot-calculator',
    title: 'Calculadora de Lote',
    description: 'Calcule o tamanho ideal do lote baseado no seu risco',
    icon: 'calculator',
    color: '#10b981',
  },
  {
    id: 'profit-calculator',
    title: 'Calculadora de Lucro',
    description: 'Calcule seus lucros e perdas potenciais',
    icon: 'trending-up',
    color: '#FFD700',
  },
  {
    id: 'pip-calculator',
    title: 'Calculadora de Pip',
    description: 'Converta pips em valor monetário',
    icon: 'swap-horizontal',
    color: '#6366f1',
  },
  {
    id: 'margin-calculator',
    title: 'Calculadora de Margem',
    description: 'Calcule a margem necessária para suas operações',
    icon: 'cash',
    color: '#ef4444',
  },
  {
    id: 'fibonacci',
    title: 'Fibonacci Retracement',
    description: 'Calcule níveis de Fibonacci automaticamente',
    icon: 'stats-chart',
    color: '#8b5cf6',
  },
  {
    id: 'pivot-points',
    title: 'Pontos de Pivot',
    description: 'Calcule pontos de pivot, suporte e resistência',
    icon: 'analytics',
    color: '#14b8a6',
  },
];

export default function ToolsScreen() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // Estados para a calculadora de lote (exemplo)
  const [accountBalance, setAccountBalance] = useState('');
  const [riskPercentage, setRiskPercentage] = useState('');
  const [stopLossPips, setStopLossPips] = useState('');

  const handleToolPress = (toolId: string) => {
    setSelectedTool(toolId);
  };

  const calculateLotSize = () => {
    const balance = parseFloat(accountBalance);
    const risk = parseFloat(riskPercentage);
    const slPips = parseFloat(stopLossPips);

    if (!balance || !risk || !slPips) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    // Cálculo simplificado (GOLD = 1 pip = $0.10 por 0.01 lote)
    const riskAmount = (balance * risk) / 100;
    const pipValue = 0.10; // Valor aproximado do pip para GOLD
    const lotSize = (riskAmount / (slPips * pipValue)).toFixed(2);

    Alert.alert(
      'Resultado',
      `Tamanho do lote recomendado: ${lotSize}\n\nRisco: $${riskAmount.toFixed(2)}\nBalance: $${balance.toFixed(2)}\nStop Loss: ${slPips} pips`
    );
  };

  const renderCalculator = () => {
    if (selectedTool !== 'lot-calculator') return null;

    return (
      <View style={styles.calculatorCard}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedTool(null)}
        >
          <Ionicons name="arrow-back" size={20} color="#FFD700" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.calculatorTitle}>📊 Calculadora de Lote</Text>
        <Text style={styles.calculatorSubtitle}>
          Calcule o tamanho ideal do lote baseado no seu risco
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Saldo da Conta (USD)</Text>
          <TextInput
            style={styles.input}
            value={accountBalance}
            onChangeText={setAccountBalance}
            keyboardType="numeric"
            placeholder="Ex: 1000"
            placeholderTextColor="#4B5563"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Risco por Operação (%)</Text>
          <TextInput
            style={styles.input}
            value={riskPercentage}
            onChangeText={setRiskPercentage}
            keyboardType="numeric"
            placeholder="Ex: 2"
            placeholderTextColor="#4B5563"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Stop Loss (pips)</Text>
          <TextInput
            style={styles.input}
            value={stopLossPips}
            onChangeText={setStopLossPips}
            keyboardType="numeric"
            placeholder="Ex: 50"
            placeholderTextColor="#4B5563"
          />
        </View>

        <TouchableOpacity
          style={styles.calculateButton}
          onPress={calculateLotSize}
        >
          <Text style={styles.calculateButtonText}>Calcular</Text>
          <Ionicons name="calculator" size={20} color="#0A0E27" />
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#6366f1" />
          <Text style={styles.infoText}>
            Esta calculadora usa valores aproximados. Sempre verifique com sua
            corretora.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ferramentas de Trading 🛠️</Text>
        <Text style={styles.headerSubtitle}>
          Calculadoras e utilitários para otimizar suas operações
        </Text>
      </View>

      {selectedTool ? (
        renderCalculator()
      ) : (
        <>
          {/* Grid de Ferramentas */}
          <View style={styles.toolsGrid}>
            {TOOLS.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={styles.toolCard}
                activeOpacity={0.7}
                onPress={() => handleToolPress(tool.id)}
              >
                <View
                  style={[styles.toolIconContainer, { backgroundColor: tool.color + '20' }]}
                >
                  <Ionicons name={tool.icon} size={32} color={tool.color} />
                </View>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolDescription}>{tool.description}</Text>
                <View style={styles.toolFooter}>
                  <Text style={[styles.toolTag, { color: tool.color }]}>Grátis</Text>
                  <Ionicons name="arrow-forward" size={16} color="#6B7280" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recursos Adicionais */}
          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>📌 Recursos Adicionais</Text>

            <View style={styles.featureCard}>
              <MaterialCommunityIcons name="calendar-clock" size={24} color="#FFD700" />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>Calendário Econômico</Text>
                <Text style={styles.featureDescription}>
                  Acompanhe eventos que impactam o mercado GOLD
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </View>

            <View style={styles.featureCard}>
              <MaterialCommunityIcons name="clock-alert" size={24} color="#6366f1" />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>Melhores Horários</Text>
                <Text style={styles.featureDescription}>
                  Veja quando operar GOLD com mais volatilidade
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </View>

            <View style={styles.featureCard}>
              <MaterialCommunityIcons name="currency-usd" size={24} color="#10b981" />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>Conversor de Moedas</Text>
                <Text style={styles.featureDescription}>
                  Converta entre diferentes moedas instantaneamente
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </View>
          </View>
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  toolCard: {
    backgroundColor: '#0f1419',
    borderRadius: 16,
    padding: 16,
    width: '47%',
    borderWidth: 1,
    borderColor: '#1a1f2e',
  },
  toolIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  toolDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
    marginBottom: 12,
    height: 32,
  },
  toolFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toolTag: {
    fontSize: 11,
    fontWeight: '600',
  },
  calculatorCard: {
    backgroundColor: '#0f1419',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#1a1f2e',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  backButtonText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  calculatorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  calculatorSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 24,
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2A2F4A',
  },
  calculateButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A0E27',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#6366f1' + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  featuresContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f1419',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1a1f2e',
    gap: 12,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
});
