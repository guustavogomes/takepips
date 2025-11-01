-- Schema para tabela de sinais
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_signals_symbol ON signals(symbol);
CREATE INDEX IF NOT EXISTS idx_signals_type ON signals(type);
CREATE INDEX IF NOT EXISTS idx_signals_time ON signals(time DESC);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);

-- Índice composto para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_signals_symbol_time ON signals(symbol, time DESC);

