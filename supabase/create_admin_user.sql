-- Script para criar um usuário Admin no RODOTEC

-- PASSO 1: Criar usuário via Supabase Dashboard
-- Vá em: Authentication > Users > Add User
-- Preencha: email e senha
-- Anote o User ID que foi criado

-- PASSO 2: Adicionar role de admin ao usuário
-- Substitua 'SEU_USER_ID_AQUI' pelo ID do usuário criado no passo 1

INSERT INTO public.user_roles (user_id, role)
VALUES ('SEU_USER_ID_AQUI', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Verificar se o usuário foi criado com sucesso
SELECT
  ur.user_id,
  ur.role,
  ap.name,
  ap.created_at
FROM public.user_roles ur
LEFT JOIN public.admin_profiles ap ON ap.id = ur.user_id
WHERE ur.user_id = 'SEU_USER_ID_AQUI';

-- Se quiser ver todos os usuários admin:
SELECT
  ur.user_id,
  ur.role,
  ap.name,
  ap.created_at
FROM public.user_roles ur
LEFT JOIN public.admin_profiles ap ON ap.id = ur.user_id
ORDER BY ap.created_at DESC;
