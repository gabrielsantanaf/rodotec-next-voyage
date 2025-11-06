-- Seed data for RODOTEC Admin

-- Inserir categorias
INSERT INTO public.categories (name, slug) VALUES
  ('Carrocerias', 'carrocerias'),
  ('Reboques', 'reboques'),
  ('Implementos Especiais', 'implementos-especiais'),
  ('Acessórios', 'acessorios')
ON CONFLICT (slug) DO NOTHING;

-- Inserir coleções
INSERT INTO public.collections (name, description, slug) VALUES
  ('Linha Frigorífica', 'Implementos para transporte refrigerado', 'linha-frigorifica'),
  ('Linha Carga Seca', 'Carrocerias para carga seca', 'linha-carga-seca'),
  ('Linha Graneleira', 'Carrocerias para transporte de grãos', 'linha-graneleira')
ON CONFLICT (slug) DO NOTHING;

-- Inserir produtos de exemplo
WITH cat_carrocerias AS (
  SELECT id FROM public.categories WHERE slug = 'carrocerias' LIMIT 1
),
cat_reboques AS (
  SELECT id FROM public.categories WHERE slug = 'reboques' LIMIT 1
)

INSERT INTO public.products (
  title,
  slug,
  description,
  status,
  price,
  sku,
  stock_qty,
  weight_kg,
  country_of_origin,
  type,
  manufacturer,
  category_id,
  seo_title,
  seo_description,
  tags,
  published
) VALUES
(
  'Carroceria Baú Frigorífico 8m',
  'carroceria-bau-frigorifico-8m',
  'Carroceria baú frigorífico com isolamento térmico em poliuretano injetado. Ideal para transporte de alimentos perecíveis. Capacidade para até 15 toneladas.',
  'ACTIVE',
  85000.00,
  'CBF-8M-001',
  5,
  1200.00,
  'Brasil',
  'Carroceria Frigorífica',
  'RODOTEC',
  (SELECT id FROM cat_carrocerias),
  'Carroceria Baú Frigorífico 8m - RODOTEC',
  'Carroceria baú frigorífico de 8 metros com isolamento térmico. Ideal para transporte refrigerado.',
  ARRAY['frigorifico', 'bau', 'transporte-refrigerado'],
  true
),
(
  'Reboque Graneleiro Basculante',
  'reboque-graneleiro-basculante',
  'Reboque graneleiro com sistema basculante hidráulico. Ideal para transporte de grãos, cereais e produtos agrícolas. Capacidade de 30m³.',
  'ACTIVE',
  95000.00,
  'RGB-30-001',
  3,
  2100.00,
  'Brasil',
  'Reboque Graneleiro',
  'RODOTEC',
  (SELECT id FROM cat_reboques),
  'Reboque Graneleiro Basculante - RODOTEC',
  'Reboque graneleiro basculante com capacidade de 30m³. Sistema hidráulico de alta performance.',
  ARRAY['graneleiro', 'basculante', 'agricola'],
  true
),
(
  'Carroceria Sider Curtain Side',
  'carroceria-sider-curtain-side',
  'Carroceria tipo sider com abertura lateral por cortina deslizante. Facilita o carregamento e descarregamento lateral. Estrutura em aço de alta resistência.',
  'ACTIVE',
  72000.00,
  'CS-001',
  8,
  980.00,
  'Brasil',
  'Carroceria Sider',
  'RODOTEC',
  (SELECT id FROM cat_carrocerias),
  'Carroceria Sider Curtain Side - RODOTEC',
  'Carroceria sider com abertura lateral facilitada. Ideal para carga e descarga ágil.',
  ARRAY['sider', 'cortina', 'abertura-lateral'],
  true
),
(
  'Carroceria Baú Carga Seca 7m',
  'carroceria-bau-carga-seca-7m',
  'Carroceria baú para carga seca com 7 metros de comprimento. Estrutura em alumínio, leve e resistente. Ideal para entregas urbanas.',
  'ACTIVE',
  58000.00,
  'CBCS-7M-001',
  6,
  850.00,
  'Brasil',
  'Carroceria Baú',
  'RODOTEC',
  (SELECT id FROM cat_carrocerias),
  'Carroceria Baú Carga Seca 7m - RODOTEC',
  'Carroceria baú de alumínio para carga seca. Leve e resistente.',
  ARRAY['bau', 'carga-seca', 'aluminio'],
  true
),
(
  'Implemento Porta Contêiner 20 pés',
  'implemento-porta-container-20-pes',
  'Implemento especializado para transporte de contêineres de 20 pés. Sistema de travamento automático e estrutura reforçada.',
  'ACTIVE',
  45000.00,
  'IPC-20-001',
  4,
  1500.00,
  'Brasil',
  'Porta Contêiner',
  'RODOTEC',
  (SELECT id FROM cat_reboques),
  'Implemento Porta Contêiner 20 pés - RODOTEC',
  'Implemento porta contêiner com sistema de travamento automático.',
  ARRAY['container', 'porta-container', '20-pes'],
  true
),
(
  'Carroceria Boiadeiro',
  'carroceria-boiadeiro',
  'Carroceria boiadeiro para transporte de gado. Estrutura em tubos de aço com grades laterais ventiladas. Piso antiderrapante.',
  'DRAFT',
  68000.00,
  'CB-001',
  2,
  1100.00,
  'Brasil',
  'Carroceria Boiadeiro',
  'RODOTEC',
  (SELECT id FROM cat_carrocerias),
  'Carroceria Boiadeiro - RODOTEC',
  'Carroceria para transporte de gado com estrutura ventilada e piso antiderrapante.',
  ARRAY['boiadeiro', 'gado', 'pecuaria'],
  false
);

-- Inserir orçamentos de exemplo
INSERT INTO public.quote_requests (
  name,
  company,
  email,
  phone,
  product_name,
  message,
  consent_lgpd,
  status,
  assignee,
  notes,
  source,
  created_at
) VALUES
(
  'João Silva',
  'Transportadora Silva & Cia',
  'joao@silvatransportes.com.br',
  '(11) 98765-4321',
  'Carroceria Baú Frigorífico 8m',
  'Gostaria de orçamento para 3 unidades. Preciso de entrega em até 60 dias.',
  true,
  'NEW',
  NULL,
  NULL,
  'SITE_FORM',
  NOW() - INTERVAL '2 hours'
),
(
  'Maria Santos',
  'Agrícola Santos',
  'maria@agricolasantos.com.br',
  '(19) 99876-5432',
  'Reboque Graneleiro Basculante',
  'Necessito de um reboque para transportar soja. Qual o prazo de entrega?',
  true,
  'IN_PROGRESS',
  'Carlos Mendes',
  'Cliente ligou dia 05/11. Interessado em financiamento.',
  'SITE_FORM',
  NOW() - INTERVAL '1 day'
),
(
  'Pedro Oliveira',
  'LogMaster Transportes',
  'pedro@logmaster.com.br',
  '(11) 97654-3210',
  'Carroceria Sider Curtain Side',
  'Preciso de 2 carrocerias sider. Gostaria de visitar a fábrica.',
  true,
  'CONTACTED',
  'Ana Paula',
  'Agendada visita para 10/11 às 14h. Cliente muito interessado.',
  'SITE_FORM',
  NOW() - INTERVAL '3 days'
),
(
  'Fernanda Costa',
  'FreteRápido Logística',
  'fernanda@freterapido.com.br',
  '(21) 98123-4567',
  'Carroceria Baú Carga Seca 7m',
  'Orçamento para 5 unidades. Preciso de financiamento.',
  true,
  'WON',
  'Carlos Mendes',
  'Negócio fechado! Pagamento em 12x. Previsão de entrega: 15/12.',
  'SITE_FORM',
  NOW() - INTERVAL '5 days'
),
(
  'Ricardo Almeida',
  NULL,
  'ricardo.almeida@email.com',
  '(11) 99999-8888',
  'Implemento Porta Contêiner 20 pés',
  'Quanto custa?',
  false,
  'LOST',
  'Ana Paula',
  'Cliente desistiu por questão de preço. Optou por implemento usado.',
  'SITE_FORM',
  NOW() - INTERVAL '1 week'
);

-- Criar um usuário admin de exemplo (senha: admin123)
-- NOTA: Este usuário deve ser criado via Supabase Auth UI ou API
-- Aqui apenas documentamos como criar:
--
-- 1. Criar usuário via Supabase Auth
-- 2. Adicionar role de admin:
--
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('<user_id_do_supabase_auth>', 'admin');
