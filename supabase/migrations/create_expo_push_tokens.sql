-- Criar tabela para armazenar Expo Push Tokens (React Native)
CREATE TABLE IF NOT EXISTS expo_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL DEFAULT 'unknown',
  device_id TEXT NOT NULL DEFAULT 'unknown',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca rápida por token
CREATE INDEX IF NOT EXISTS idx_expo_push_tokens_token ON expo_push_tokens(token);

-- Criar índice para busca por plataforma
CREATE INDEX IF NOT EXISTS idx_expo_push_tokens_platform ON expo_push_tokens(platform);

-- Comentários
COMMENT ON TABLE expo_push_tokens IS 'Armazena tokens de push notification do Expo para apps React Native';
COMMENT ON COLUMN expo_push_tokens.token IS 'Expo Push Token (formato: ExponentPushToken[xxx])';
COMMENT ON COLUMN expo_push_tokens.platform IS 'Plataforma do dispositivo (ios, android)';
COMMENT ON COLUMN expo_push_tokens.device_id IS 'ID ou modelo do dispositivo';
