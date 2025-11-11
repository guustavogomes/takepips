-- Migration: Adicionar coluna 'sessao' na tabela signals
-- Data: 2025-11-09
-- Objetivo: Permitir análise estatística por sessão de trading

-- Adicionar coluna sessao (nullable para não quebrar dados existentes)
ALTER TABLE signals
ADD COLUMN IF NOT EXISTS sessao VARCHAR(50);

-- Criar índices para consultas de estatísticas por sessão
CREATE INDEX IF NOT EXISTS idx_signals_sessao ON signals(sessao);
CREATE INDEX IF NOT EXISTS idx_signals_sessao_status ON signals(sessao, status);

-- Comentário na coluna
COMMENT ON COLUMN signals.sessao IS 'Nome da sessão de trading (ex: SESSAO 15:35) para análise estatística';
