/**
 * Loading Chart Component
 *
 * Animação profissional de loading com tema GOLD/Trading
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function LoadingChart() {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Rotação contínua
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse do logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeValue }]}>
      {/* Círculo externo girando */}
      <Animated.View
        style={[
          styles.spinnerOuter,
          {
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <View style={styles.arc} />
      </Animated.View>

      {/* Logo/Ícone central com pulse */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: pulseValue }],
          },
        ]}
      >
        <MaterialCommunityIcons name="chart-line" size={40} color="#FFD700" />
      </Animated.View>

      {/* Texto */}
      <Animated.Text style={styles.loadingText}>TakePips</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 14, 39, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  spinnerOuter: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arc: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#FFD700',
    borderRightColor: '#FFD700',
  },
  iconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 80,
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
