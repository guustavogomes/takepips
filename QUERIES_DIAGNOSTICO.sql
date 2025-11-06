-- ============================================
-- QUERIES PARA DIAGNÓSTICO DE NOTIFICAÇÕES
-- ============================================

-- 1. Ver todos os tokens Expo registrados
SELECT 
  id,
  token,
  platform,
  device_id,
  created_at,
  updated_at
FROM expo_push_tokens
ORDER BY created_at DESC;

-- 2. Contar tokens por plataforma
SELECT 
  platform,
  COUNT(*) as total_tokens,
  MAX(created_at) as ultimo_registro
FROM expo_push_tokens
GROUP BY platform;

-- 3. Ver tokens recentes (últimas 24 horas)
SELECT 
  token,
  platform,
  device_id,
  created_at,
  updated_at,
  EXTRACT(EPOCH FROM (NOW() - created_at))/3600 as horas_desde_criacao
FROM expo_push_tokens
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 4. Verificar se há tokens duplicados
SELECT 
  token,
  COUNT(*) as quantidade,
  array_agg(platform) as plataformas,
  array_agg(device_id) as dispositivos
FROM expo_push_tokens
GROUP BY token
HAVING COUNT(*) > 1;

-- 5. Ver tokens Android especificamente
SELECT 
  id,
  token,
  device_id,
  created_at,
  updated_at
FROM expo_push_tokens
WHERE platform = 'android'
ORDER BY created_at DESC;

-- 6. Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'expo_push_tokens'
ORDER BY ordinal_position;

-- 7. Limpar tokens antigos (se necessário - CUIDADO!)
-- DELETE FROM expo_push_tokens WHERE created_at < NOW() - INTERVAL '30 days';

-- 8. Verificar última vez que um token foi atualizado
SELECT 
  token,
  platform,
  device_id,
  created_at,
  updated_at,
  CASE 
    WHEN updated_at = created_at THEN 'Nunca atualizado'
    ELSE 'Atualizado após criação'
  END as status_atualizacao
FROM expo_push_tokens
ORDER BY updated_at DESC
LIMIT 10;

