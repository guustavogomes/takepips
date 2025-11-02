-- Migration para adicionar status 'ENCERRADO'
-- Execute este arquivo no banco de dados

-- Alterar a constraint do status para incluir 'ENCERRADO'
ALTER TABLE signals 
DROP CONSTRAINT IF EXISTS signals_status_check;

ALTER TABLE signals 
ADD CONSTRAINT signals_status_check 
CHECK (status IN ('PENDING', 'STOP_LOSS', 'TAKE1', 'TAKE2', 'TAKE3', 'ENCERRADO'));

