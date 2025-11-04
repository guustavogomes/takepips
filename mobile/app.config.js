/**
 * Expo App Configuration
 * 
 * Permite configuração dinâmica baseada em variáveis de ambiente
 */

export default {
  expo: {
    name: 'TakePips',
    slug: 'takepips-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#0A0E27',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.takepips.mobile',
      infoPlist: {
        NSUserNotificationsUsageDescription:
          'Precisamos de permissão para enviar notificações sobre sinais de trading em tempo real.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0A0E27',
      },
      package: 'com.takepips.mobile',
      permissions: ['RECEIVE_BOOT_COMPLETED'],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-notifications',
        {
          color: '#4A90E2',
        },
      ],
    ],
    scheme: 'takepips',
    extra: {
      router: {},
      apiUrl: process.env.API_URL || 'https://takepips.vercel.app',
      supabaseUrl: process.env.SUPABASE_URL || 'https://katfvkeirfdboahvogtv.supabase.co',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdGZ2a2VpcmZkYm9haHZvZ3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMTMyMzgsImV4cCI6MjA3Nzc4OTIzOH0.D2EVE9npBhxr5aKqEZ-eb_doEpZIMwjzp5HsZ3a_71Y',
      eas: {
        projectId: 'af3feed4-e3ba-4731-bc6d-50d2bf5dece2',
      },
    },
  },
};
