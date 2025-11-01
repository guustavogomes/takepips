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
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'STOP_LOSS', 'TAKE1', 'TAKE2', 'TAKE3')),
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

-- Índices para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_signals_symbol ON signals(symbol);
CREATE INDEX IF NOT EXISTS idx_signals_type ON signals(type);
CREATE INDEX IF NOT EXISTS idx_signals_time ON signals(time DESC);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);

-- Índice composto para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_signals_symbol_time ON signals(symbol, time DESC);

-- Índices para rastreamento de status
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_pending ON signals(status) WHERE status = 'PENDING';

