-- Migration: Adicionar campos de rastreamento de status (stop loss e takes)
-- Execute este script no SQL Editor do Neon após executar o schema.sql

-- Adicionar coluna de status
ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'PENDING' 
CHECK (status IN ('PENDING', 'STOP_LOSS', 'TAKE1', 'TAKE2', 'TAKE3'));

-- Adicionar colunas de timestamps para quando cada nível foi atingido
ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS stop_hit_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS take1_hit_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS take2_hit_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS take3_hit_at TIMESTAMP WITH TIME ZONE;

-- Adicionar colunas de preços para registrar o preço exato quando cada nível foi atingido
ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS stop_hit_price DECIMAL(20, 5);

ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS take1_hit_price DECIMAL(20, 5);

ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS take2_hit_price DECIMAL(20, 5);

ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS take3_hit_price DECIMAL(20, 5);

-- Índice para consultas por status
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);

-- Índice para consultas de sinais pendentes (mais frequente)
CREATE INDEX IF NOT EXISTS idx_signals_pending ON signals(status) WHERE status = 'PENDING';

