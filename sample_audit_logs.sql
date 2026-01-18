-- Script para crear datos de muestra en audit_logs para probar la actividad reciente

-- Insertar algunos registros de audit_logs de ejemplo
-- Nota: Los UUIDs y datos deben coincidir con registros reales en las tablas
-- Usar el tenant_id DEMO para pruebas

INSERT INTO audit_logs (
  tenant_id,
  user_id,
  action,
  resource_type,
  resource_id,
  old_values,
  new_values,
  created_at
) VALUES
-- Creación de marca
(
  (SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1),
  (SELECT user_id FROM user_profiles WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1) LIMIT 1),
  'CREATE',
  'brands',
  gen_random_uuid(),
  NULL,
  '{"name": "Nueva Marca Demo", "slug": "nueva-marca-demo"}'::jsonb,
  NOW() - INTERVAL '2 hours'
),

-- Actualización de marca
(
  (SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1),
  (SELECT user_id FROM user_profiles WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1) LIMIT 1),
  'UPDATE',
  'brands',
  gen_random_uuid(),
  '{"name": "Marca Demo"}'::jsonb,
  '{"name": "Marca Demo Actualizada"}'::jsonb,
  NOW() - INTERVAL '1 hour'
),

-- Creación de cliente
(
  (SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1),
  (SELECT user_id FROM user_profiles WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1) LIMIT 1),
  'CREATE',
  'clients',
  gen_random_uuid(),
  NULL,
  '{"business_name": "Tienda El Éxito", "client_code": "CLI-001"}'::jsonb,
  NOW() - INTERVAL '30 minutes'
),

-- Creación de usuario
(
  (SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1),
  (SELECT user_id FROM user_profiles WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1) LIMIT 1),
  'CREATE',
  'users',
  gen_random_uuid(),
  NULL,
  '{"first_name": "Juan", "last_name": "Pérez"}'::jsonb,
  NOW() - INTERVAL '15 minutes'
),

-- Creación de visita
(
  (SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1),
  (SELECT user_id FROM user_profiles WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1) LIMIT 1),
  'CREATE',
  'visits',
  gen_random_uuid(),
  NULL,
  '{"client_id": "some-client-id", "visit_type": "regular"}'::jsonb,
  NOW() - INTERVAL '5 minutes'
);

-- Verificar los datos insertados
SELECT
  al.action,
  al.resource_type,
  al.new_values->>'name' as entity_name,
  al.new_values->>'business_name' as client_name,
  al.new_values->>'first_name' as user_first_name,
  al.created_at,
  up.first_name || ' ' || up.last_name as user_name
FROM audit_logs al
LEFT JOIN user_profiles up ON al.user_id = up.user_id
WHERE al.tenant_id = (SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1)
ORDER BY al.created_at DESC
LIMIT 10;
