# Guia Rápido: Configurar Acesso Admin

## Problema: Login não redireciona para o dashboard

Isso acontece porque o usuário precisa ter uma **role** configurada no banco de dados.

## Solução Rápida

### Opção 1: Via Supabase Dashboard (Recomendado)

1. **Criar o usuário** (se ainda não existe):
   - Abra o Supabase Dashboard
   - Vá em: `Authentication` → `Users` → `Add User`
   - Preencha:
     - Email: `admin@rodotec.com.br`
     - Password: `admin123` (ou a senha que preferir)
   - Clique em `Create User`
   - **Copie o User ID** que aparece (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

2. **Adicionar role de admin**:
   - No Supabase Dashboard, vá em: `SQL Editor`
   - Cole e execute:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('cole-o-user-id-aqui', 'admin');
   ```

3. **Testar o login**:
   - Acesse: http://localhost:8080/admin/login
   - Entre com o email e senha criados
   - Agora deve redirecionar para `/admin` automaticamente!

### Opção 2: Se o usuário já foi criado via Supabase Auth

Se você já fez login antes e viu a mensagem "Acesso Negado":

1. O sistema mostrará automaticamente o comando SQL com seu User ID
2. Copie o comando exibido na tela
3. Execute no Supabase SQL Editor
4. Faça logout e login novamente

### Opção 3: Via Script SQL

Use o arquivo `supabase/create_admin_user.sql`:

1. Abra o arquivo
2. Substitua `'SEU_USER_ID_AQUI'` pelo User ID do seu usuário
3. Execute no Supabase SQL Editor

## Verificar se funcionou

Execute no SQL Editor:

```sql
-- Ver todos os admins
SELECT
  ur.user_id,
  ur.role,
  ap.name
FROM public.user_roles ur
LEFT JOIN public.admin_profiles ap ON ap.id = ur.user_id;
```

## Troubleshooting

### "Este usuário não tem uma role configurada"

**Causa**: O usuário existe no Supabase Auth, mas não tem role na tabela `user_roles`.

**Solução**:
1. Abra o console do navegador (F12)
2. Veja o comando SQL que aparece nos logs
3. Execute no Supabase SQL Editor

### "Error fetching role"

**Causa**: Pode ser problema de RLS (Row Level Security).

**Solução**:
```sql
-- Verificar se as policies estão ativas
SELECT * FROM pg_policies WHERE tablename = 'user_roles';

-- Se necessário, recriar a policy
CREATE POLICY "Usuários podem ver seu próprio role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

### Redefinir tudo (CUIDADO!)

Se quiser começar do zero:

```sql
-- Deletar todos os roles
DELETE FROM public.user_roles;

-- Criar novo admin (substitua o user_id)
INSERT INTO public.user_roles (user_id, role)
VALUES ('seu-user-id-aqui', 'admin');
```

## Próximos Passos

Depois de fazer login com sucesso:

1. ✅ Explore o Dashboard
2. ✅ Crie alguns produtos em `/admin/produtos/novo`
3. ✅ Teste o formulário público em `/contato`
4. ✅ Veja os orçamentos aparecerem em `/admin/orcamentos`

## Notas Importantes

- **Segurança**: Troque a senha padrão em produção
- **Roles**: Existem dois tipos: `admin` (acesso total) e `editor` (acesso limitado)
- **Múltiplos admins**: Pode criar vários usuários admin repetindo o processo
