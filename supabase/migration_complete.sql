-- ============================================
-- Migração Completa: Neon → Supabase
-- Schema completo para TakePips
-- ============================================
-- 
-- Execute este arquivo no SQL Editor do Supabase
-- Dashboard → SQL Editor → New Query → Cole este conteúdo → Run
--

-- ============================================
-- Tabela de Sinais
-- ============================================
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(4) NOT NULL CHECK (type IN ('BUY', 'SELL')),
  symbol VARCHAR(20) NOT NULL,
  entry DECIMAL(20, 5) NOT NULL,
  stop_loss DECIMAL(20, 5) NOT NULL,
  take1 DECIMAL(20, 5) NOT NULL,
  take2 DECIMAL(20, 5) NOT NULL,
  take3 DECIMAL(20, 5) NOT NULL,
  stop_ticks INTEGER NOT NULL,
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'EM_OPERACAO', 'STOP_LOSS', 'TAKE1', 'TAKE2', 'TAKE3', 'ENCERRADO')),
  stop_hit_at TIMESTAMP WITH TIME ZONE,
  take1_hit_at TIMESTAMP WITH TIME ZONE,
  take2_hit_at TIMESTAMP WITH TIME ZONE,
  take3_hit_at TIMESTAMP WITH TIME ZONE,
  stop_hit_price DECIMAL(20, 5),
  take1_hit_price DECIMAL(20, 5),
  take2_hit_price DECIMAL(20, 5),
  take3_hit_price DECIMAL(20, 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================
-- Tabela de Push Subscriptions (Web Push)
-- ============================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================
-- Tabela de Tokens Expo Push (React Native)
-- ============================================
CREATE TABLE IF NOT EXISTS expo_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  platform TEXT,
  device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================
-- Índices para Signals
-- ============================================
CREATE INDEX IF NOT EXISTS idx_signals_symbol ON signals(symbol);
CREATE INDEX IF NOT EXISTS idx_signals_type ON signals(type);
CREATE INDEX IF NOT EXISTS idx_signals_time ON signals(time DESC);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_symbol_time ON signals(symbol, time DESC);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_pending ON signals(status) WHERE status = 'PENDING';

-- ============================================
-- Índices para Push Subscriptions
-- ============================================
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_expo_push_tokens_token ON expo_push_tokens(token);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
-- Habilitar RLS (opcional, mas recomendado)
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expo_push_tokens ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso via service role (backend)
-- Em produção, você pode criar políticas mais específicas baseadas em usuários
CREATE POLICY "Allow all for service role" ON signals
  FOR ALL USING (true);
  
CREATE POLICY "Allow all for service role" ON push_subscriptions
  FOR ALL USING (true);
  
CREATE POLICY "Allow all for service role" ON expo_push_tokens
  FOR ALL USING (true);

-- ============================================
-- Função para atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_signals_updated_at 
  BEFORE UPDATE ON signals 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at 
  BEFORE UPDATE ON push_subscriptions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expo_push_tokens_updated_at 
  BEFORE UPDATE ON expo_push_tokens 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Verificação
-- ============================================
-- Execute para verificar se tudo foi criado:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
