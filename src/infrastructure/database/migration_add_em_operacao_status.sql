-- Migração para adicionar status 'EM_OPERACAO' ao CHECK constraint
-- Este status é usado quando a entrada do sinal é atingida (sinal entra em operação)

-- Remover o CHECK constraint antigo
ALTER TABLE signals DROP CONSTRAINT IF EXISTS signals_status_check;

-- Adicionar o novo CHECK constraint com 'EM_OPERACAO' e 'ENCERRADO'
ALTER TABLE signals 
ADD CONSTRAINT signals_status_check 
CHECK (status IN ('PENDING', 'EM_OPERACAO', 'STOP_LOSS', 'TAKE1', 'TAKE2', 'TAKE3', 'ENCERRADO'));

